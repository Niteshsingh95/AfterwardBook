import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

import { User, Otp, Book, Comment, Bookmark, Progress } from "./models.js";
const r = Router();
const token = (u) =>
  jwt.sign(
    { id: u._id },
    process.env.JWT_SECRET || "development-only-change-me",
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );
const pub = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  verified: u.verified,
});
async function auth(q, s, n) {
  try {
    const t = q.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!t) return s.status(401).json({ message: "Please sign in first." });
    const p = jwt.verify(
      t,
      process.env.JWT_SECRET || "development-only-change-me",
    );
    q.user = await User.findById(p.id).select("-passwordHash");
    if (!q.user?.verified)
      return s.status(401).json({ message: "Please sign in again." });
    n();
  } catch {
    return s
      .status(401)
      .json({ message: "Session expired. Please sign in again." });
  }
}
const admin = (q, s, n) =>
  q.user?.role === "admin"
    ? n()
    : s.status(403).json({ message: "Admin access required." });
const slugify = (s) =>
  String(s || "book")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70);
async function emailOtp(email, code) {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    EMAIL_FROM,
    SMTP_SECURE,
  } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[DEV ONLY] OTP for ${email}: ${code}`);
      return;
    }
    throw Error("Email service is not configured.");
  }
  const t = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 465),
    secure: SMTP_SECURE !== "false",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  await t.sendMail({
    from: EMAIL_FROM || SMTP_USER,
    to: email,
    subject: "Your Afterword verification code",
    text: `Your verification code is ${code}. It expires in 10 minutes.`,
  });
}
const bookView = (b, all = false) => ({
  id: b._id,
  title: b.title,
  slug: b.slug,
  subtitle: b.subtitle,
  description: b.description,
  coverUrl: b.coverUrl,
  genre: b.genre,
  status: b.status,
  createdAt: b.createdAt,
  chapters: (b.chapters || [])
    .filter((c) => all || c.status === "published")
    .map((c) => ({
      id: c._id,
      title: c.title,
      number: c.number,
      status: c.status,
      publishedAt: c.publishedAt,
      ...(all ? { content: c.content } : {}),
    })),
});
r.post("/auth/signup", async (q, s, n) => {
  try {
    const name = String(q.body.name || "").trim(),
      email = String(q.body.email || "")
        .trim()
        .toLowerCase(),
      password = String(q.body.password || "");
    if (name.length < 2 ||!/^\S+@\S+\.\S+$/.test(email) || password.length < 8)
      return s
        .status(400)
        .json({
          message:
            "Enter a name, valid email and password of at least 8 characters.",
        });
    if (await User.findOne({ email, verified: true }))
      return s
        .status(409)
        .json({ message: "An account with this email already exists." });
    await User.findOneAndUpdate(
      { email },
      { name, passwordHash: await bcrypt.hash(password, 12), verified: false },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    const code = String(crypto.randomInt(100000, 1000000));
    await Otp.deleteMany({ email });
    await Otp.create({
      email,
      codeHash: await bcrypt.hash(code, 10),
      expiresAt: new Date(Date.now() + 600000),
    });
    await emailOtp(email, code);
    s.json({
      message:
        "Verification code sent. If SMTP is not configured, check backend terminal.",
    });
  } catch (e) {
    n(e);
  }
});
r.post("/auth/verify-otp", async (q, s, n) => {
  try {
    const email = String(q.body.email || "")
        .trim()
        .toLowerCase(),
      code = String(q.body.code || ""),
      o = await Otp.findOne({ email }).sort({ createdAt: -1 });
    if (!o || o.expiresAt < new Date() || o.attempts >= 5)
      return s
        .status(400)
        .json({ message: "Code expired or unavailable. Request a new one." });
    if (!(await bcrypt.compare(code, o.codeHash))) {
      o.attempts++;
      await o.save();
      return s.status(400).json({ message: "Incorrect verification code." });
    }
    const u = await User.findOneAndUpdate(
      { email },
      { verified: true },
      { new: true },
    );
    if (!u) return s.status(404).json({ message: "Sign-up not found." });
    await Otp.deleteMany({ email });
    s.json({ message: "Email verified. You can now sign in." });
  } catch (e) {
    n(e);
  }
});
r.post("/auth/signin", async (q, s, n) => {
  try {
    const u = await User.findOne({
      email: String(q.body.email || "")
        .trim()
        .toLowerCase(),
    });
    if (
      !u ||
      !(await bcrypt.compare(String(q.body.password || ""), u.passwordHash))
    )
      return s.status(401).json({ message: "Incorrect email or password." });
    if (!u.verified)
      return s.status(403).json({ message: "Please verify your email first." });
    s.json({ token: token(u), user: pub(u) });
  } catch (e) {
    n(e);
  }
});
r.get("/auth/me", auth, (q, s) => s.json({ user: pub(q.user) }));
r.get("/books", async (_q, s, n) => {
  try {
    const books = await Book.find().sort({ updatedAt: -1 });
    s.json({ books: books.map((b) => bookView(b)) });
  } catch (e) {
    n(e);
  }
});
r.get("/books/mine/bookmarks", auth, async (q, s, n) => {
  try {
    s.json({
      bookIds: (await Bookmark.find({ userId: q.user._id })).map((x) =>
        String(x.bookId),
      ),
    });
  } catch (e) {
    n(e);
  }
});
r.get("/books/:slug", async (q, s, n) => {
  try {
    const b = await Book.findOne({ slug: q.params.slug });
    if (!b) return s.status(404).json({ message: "Book not found." });
    s.json({ book: bookView(b) });
  } catch (e) {
    n(e);
  }
});
r.get("/books/:slug/chapters/:cid", auth, async (q, s, n) => {
  try {
    const b = await Book.findOne({ slug: q.params.slug }),
      c = b?.chapters.id(q.params.cid);
    if (!b || !c || (c.status !== "published" && q.user.role !== "admin"))
      return s
        .status(404)
        .json({ message: "Chapter not found or not published." });
    s.json({
      book: bookView(b, q.user.role === "admin"),
      chapter: {
        id: c._id,
        title: c.title,
        number: c.number,
        content: c.content,
        status: c.status,
        publishedAt: c.publishedAt,
      },
    });
  } catch (e) {
    n(e);
  }
});
r.post("/books/:slug/bookmark", auth, async (q, s, n) => {
  try {
    const b = await Book.findOne({ slug: q.params.slug });
    if (!b) return s.status(404).json({ message: "Book not found." });
    const x = await Bookmark.findOne({ userId: q.user._id, bookId: b._id });
    if (x) {
      await x.deleteOne();
      return s.json({ bookmarked: false });
    }
    await Bookmark.create({ userId: q.user._id, bookId: b._id });
    s.json({ bookmarked: true });
  } catch (e) {
    n(e);
  }
});
r.put("/books/:slug/progress", auth, async (q, s, n) => {
  try {
    const b = await Book.findOne({ slug: q.params.slug }),
      c = b?.chapters.id(q.body.chapterId);
    if (!b || !c || c.status !== "published")
      return s.status(400).json({ message: "Invalid chapter." });
    await Progress.findOneAndUpdate(
      { userId: q.user._id, bookId: b._id },
      { chapterId: c._id, updatedAt: new Date() },
      { upsert: true },
    );
    s.json({ saved: true });
  } catch (e) {
    n(e);
  }
});
r.get("/books/:slug/chapters/:cid/comments", auth, async (q, s, n) => {
  try {
    const b = await Book.findOne({ slug: q.params.slug });
    if (!b) return s.status(404).json({ message: "Book not found." });
    const cs = await Comment.find({
      bookId: b._id,
      chapterId: q.params.cid,
      hidden: false,
    })
      .populate("userId", "name role")
      .sort({ createdAt: 1 });
    s.json({
      comments: cs.map((c) => ({
        id: c._id,
        body: c.body,
        spoiler: c.spoiler,
        parentId: c.parentId,
        createdAt: c.createdAt,
        likes: c.likes.length,
        liked: c.likes.some((id) => String(id) === String(q.user._id)),
        author: c.userId?.role === "admin",
        user: { id: c.userId?._id, name: c.userId?.name },
      })),
    });
  } catch (e) {
    n(e);
  }
});
r.post("/comments", auth, async (q, s, n) => {
  try {
    const { bookId, chapterId, parentId, body, spoiler } = q.body;
    if (!String(body || "").trim() || String(body).length > 1500)
      return s
        .status(400)
        .json({ message: "Enter a comment up to 1500 characters." });
    const b = await Book.findById(bookId),
      c = b?.chapters.id(chapterId);
    if (!c || c.status !== "published")
      return s.status(404).json({ message: "Published chapter not found." });
    if (
      parentId &&
      !(await Comment.findOne({
        _id: parentId,
        bookId,
        chapterId,
        hidden: false,
      }))
    )
      return s.status(400).json({ message: "Reply target not found." });
    const x = await Comment.create({
      bookId,
      chapterId,
      userId: q.user._id,
      parentId: parentId || null,
      body: String(body).trim(),
      spoiler: !!spoiler,
    });
    s.status(201).json({
      comment: {
        id: x._id,
        body: x.body,
        spoiler: x.spoiler,
        parentId: x.parentId,
        createdAt: x.createdAt,
        likes: 0,
        liked: false,
        author: q.user.role === "admin",
        user: { id: q.user._id, name: q.user.name },
      },
    });
  } catch (e) {
    n(e);
  }
});
r.post("/comments/:id/like", auth, async (q, s, n) => {
  try {
    const c = await Comment.findById(q.params.id);
    if (!c || c.hidden)
      return s.status(404).json({ message: "Comment not found." });
    const yes = c.likes.some((x) => String(x) === String(q.user._id));
    yes ? c.likes.pull(q.user._id) : c.likes.push(q.user._id);
    await c.save();
    s.json({ liked: !yes, likes: c.likes.length });
  } catch (e) {
    n(e);
  }
});
r.post("/comments/:id/report", auth, async (q, s, n) => {
  try {
    const c = await Comment.findById(q.params.id);
    if (!c || c.hidden)
      return s.status(404).json({ message: "Comment not found." });
    if (!c.reports.some((x) => String(x) === String(q.user._id)))
      c.reports.push(q.user._id);
    await c.save();
    s.json({ reported: true });
  } catch (e) {
    n(e);
  }
});
r.delete("/comments/:id", auth, async (q, s, n) => {
  try {
    const c = await Comment.findById(q.params.id);
    if (!c) return s.status(404).json({ message: "Comment not found." });
    if (String(c.userId) !== String(q.user._id) && q.user.role !== "admin")
      return s.status(403).json({ message: "You cannot delete this comment." });
    if (q.user.role === "admin") {
      c.hidden = true;
      await c.save();
    } else await c.deleteOne();
    s.json({ deleted: true });
  } catch (e) {
    n(e);
  }
});
r.get("/users/me/library", auth, async (q, s, n) => {
  try {
    const marks = await Bookmark.find({ userId: q.user._id }).populate(
        "bookId",
      ),
      ps = await Progress.find({ userId: q.user._id }).populate("bookId");
    s.json({
      bookmarks: marks
        .filter((x) => x.bookId)
        .map((x) => ({
          book: {
            id: x.bookId._id,
            title: x.bookId.title,
            slug: x.bookId.slug,
            coverUrl: x.bookId.coverUrl,
          },
        })),
      progress: ps
        .filter((x) => x.bookId)
        .map((x) => ({
          book: {
            id: x.bookId._id,
            title: x.bookId.title,
            slug: x.bookId.slug,
          },
          chapterId: x.chapterId,
          updatedAt: x.updatedAt,
        })),
    });
  } catch (e) {
    n(e);
  }
});
r.post("/admin/bootstrap", auth, async (q, s, n) => {
  try {
    if (
      !process.env.ADMIN_SETUP_KEY ||
      q.body.setupKey !== process.env.ADMIN_SETUP_KEY
    )
      return s.status(403).json({ message: "Invalid admin setup key." });
    if (await User.countDocuments({ role: "admin" }))
      return s
        .status(409)
        .json({ message: "An admin already exists; setup is disabled." });
    const u = await User.findByIdAndUpdate(
      q.user._id,
      { role: "admin" },
      { new: true },
    ).select("-passwordHash");
    s.json({
      message: "Admin enabled. Sign out and sign in again.",
      user: pub(u),
    });
  } catch (e) {
    n(e);
  }
});
r.use("/admin", auth, admin);
r.get("/admin/overview", async (_q, s, n) => {
  try {
    s.json({
      books: await Book.countDocuments(),
      members: await User.countDocuments({ role: "reader", verified: true }),
      comments: await Comment.countDocuments(),
      reports: await Comment.countDocuments({
        reports: { $exists: true, $ne: [] },
      }),
    });
  } catch (e) {
    n(e);
  }
});
r.get("/admin/books", async (_q, s, n) => {
  try {
    s.json({ books: await Book.find().sort({ updatedAt: -1 }) });
  } catch (e) {
    n(e);
  }
});
r.post("/admin/books", async (q, s, n) => {
  try {
    if (!String(q.body.title || "").trim())
      return s.status(400).json({ message: "Book title is required." });
    const b = await Book.create({
      ...q.body,
      title: q.body.title.trim(),
      slug: slugify(q.body.title) + "-" + Date.now().toString(36),
    });
    s.status(201).json({ book: b });
  } catch (e) {
    n(e);
  }
});
r.put("/admin/books/:id", async (q, s, n) => {
  try {
    const b = await Book.findByIdAndUpdate(
      q.params.id,
      { $set: { ...q.body, updatedAt: new Date() } },
      { new: true, runValidators: true },
    );
    if (!b) return s.status(404).json({ message: "Book not found." });
    s.json({ book: b });
  } catch (e) {
    n(e);
  }
});
r.delete("/admin/books/:id", async (q, s, n) => {
  try {
    const b = await Book.findByIdAndDelete(q.params.id);
    if (!b) return s.status(404).json({ message: "Book not found." });
    await Comment.deleteMany({ bookId: b._id });
    await Bookmark.deleteMany({ bookId: b._id });
    await Progress.deleteMany({ bookId: b._id });
    s.json({ deleted: true });
  } catch (e) {
    n(e);
  }
});
r.post("/admin/books/:id/chapters", async (q, s, n) => {
  try {
    const b = await Book.findById(q.params.id);
    if (!b) return s.status(404).json({ message: "Book not found." });
    const d = q.body;
    b.chapters.push({
      title: d.title,
      number: Number(d.number) || b.chapters.length + 1,
      content: { en: d.content?.en || "", hi: d.content?.hi || "" },
      status: d.status === "published" ? "published" : "draft",
      publishedAt: d.status === "published" ? new Date() : undefined,
    });
    b.updatedAt = new Date();
    await b.save();
    s.status(201).json({ book: b });
  } catch (e) {
    n(e);
  }
});
r.put("/admin/books/:id/chapters/:cid", async (q, s, n) => {
  try {
    const b = await Book.findById(q.params.id),
      c = b?.chapters.id(q.params.cid);
    if (!c) return s.status(404).json({ message: "Chapter not found." });
    for (const k of ["title", "number", "content", "status"])
      if (q.body[k] !== undefined) c[k] = q.body[k];
    if (c.status === "published" && !c.publishedAt) c.publishedAt = new Date();
    if (c.status === "draft") c.publishedAt = undefined;
    c.updatedAt = new Date();
    b.updatedAt = new Date();
    await b.save();
    s.json({ book: b });
  } catch (e) {
    n(e);
  }
});
r.delete("/admin/books/:id/chapters/:cid", async (q, s, n) => {
  try {
    const b = await Book.findById(q.params.id);
    if (!b) return s.status(404).json({ message: "Book not found." });
    b.chapters.pull(q.params.cid);
    await b.save();
    await Comment.deleteMany({ bookId: b._id, chapterId: q.params.cid });
    s.json({ deleted: true });
  } catch (e) {
    n(e);
  }
});
r.get("/admin/comments", async (_q, s, n) => {
  try {
    const cs = await Comment.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(200);
    s.json({
      comments: cs.map((c) => ({
        id: c._id,
        body: c.body,
        hidden: c.hidden,
        reports: c.reports.length,
        user: c.userId?.name,
        email: c.userId?.email,
      })),
    });
  } catch (e) {
    n(e);
  }
});
r.patch("/admin/comments/:id/moderate", async (q, s, n) => {
  try {
    const c = await Comment.findById(q.params.id);
    if (!c) return s.status(404).json({ message: "Comment not found." });
    c.hidden = !!q.body.hidden;
    await c.save();
    s.json({ hidden: c.hidden });
  } catch (e) {
    n(e);
  }
});



export default r;

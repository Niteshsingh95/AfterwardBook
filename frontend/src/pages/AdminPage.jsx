
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  MessageCircle,
  PenLine,
  Plus,
  Save,
  Trash2,
  Users,
  Flag,
} from "lucide-react";

import api, { err } from "../api";
import { Notice } from "../components";
import { useAuth } from "../state";

const empty = {
  title: "",
  subtitle: "",
  description: "",
  coverUrl: "",
  genre: "Contemporary",
  status: "ongoing",
};

const chapter = {
  title: "",
  number: 1,
  content: { en: "", hi: "" },
  status: "draft",
};

export default function AdminPage() {
  const { user } = useAuth();

  const [tab, T] = useState("books");
  const [books, B] = useState([]);
  const [stats, S] = useState(null);
  const [comments, C] = useState([]);
  const [selected, Sel] = useState("");
  const [bf, BF] = useState(empty);
  const [cf, CF] = useState(chapter);
  const [edit, Edit] = useState("");
  const [error, E] = useState("");
  const [msg, M] = useState("");
  const [busy, Busy] = useState(false);

  const load = () =>
    Promise.all([
      api.get("/admin/books"),
      api.get("/admin/overview"),
      api.get("/admin/comments"),
    ])
      .then(([b, s, c]) => {
        B(b.data.books);
        S(s.data);
        C(c.data.comments);

        if (!selected && b.data.books[0]) {
          Sel(String(b.data.books[0]._id));
        }
      })
      .catch((e) => E(err(e)));

  useEffect(() => {
    if (user?.role === "admin") load();
  }, [user?.role]);

  const act = async (fn) => {
    Busy(true);
    E("");
    M("");

    try {
      await fn();
      await load();
      M("Saved successfully.");
    } catch (e) {
      E(err(e));
    } finally {
      Busy(false);
    }
  };

  if (!user) {
    return (
      <div className="simple">
        <div className="form-card">
          <h1>Studio is private.</h1>
          <Link className="btn dark full" to="/signin">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="empty">
        <h1>Admin access only</h1>
      </div>
    );
  }

  const createBook = async (e) => {
    e.preventDefault();

    await act(async () => {
      await api.post("/admin/books", bf);
      BF(empty);
    });
  };

  const saveChapter = async (e) => {
    e.preventDefault();

    if (!selected) {
      return E("Create or select a book first.");
    }

    await act(async () => {
      if (edit) {
        await api.put(
          `/admin/books/${selected}/chapters/${edit}`,
          cf
        );
      } else {
        await api.post(
          `/admin/books/${selected}/chapters`,
          cf
        );
      }

      CF(chapter);
      Edit("");
    });
  };

  const book = books.find(
    (b) => String(b._id) === selected
  );

  return (
    <div className="admin">
      <div className="admin-hero">
        <small className="kicker">
          AFTERWORD / CREATOR STUDIO
        </small>

        <h1>
          Your words, <em>your world.</em>
        </h1>

        <p>A quiet place to shape the next chapter.</p>
      </div>

      <div className="container">
        <Notice type="error">{error}</Notice>
        <Notice type="success">{msg}</Notice>

        <div className="stats">
          {[
            ["Books", stats?.books || 0, BookOpen],
            ["Readers", stats?.members || 0, Users],
            ["Comments", stats?.comments || 0, MessageCircle],
            ["Reports", stats?.reports || 0, Flag],
          ].map(([label, value, Icon]) => (
            <div key={label}>
              <Icon />
              <small>{label}</small>
              <b>{value}</b>
            </div>
          ))}
        </div>

        {/* Admin navigation */}
        <div className="tabs">
          {[
            ["books", "Books"],
            ["write", "Chapter editor"],
            ["comments", "Community"],
          ].map(([id, label]) => (
            <button
              className={tab === id ? "active" : ""}
              key={id}
              onClick={() => T(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Books section */}
        {tab === "books" && (
          <div className="admin-grid">
            <section className="panel">
              <small className="kicker">THE CATALOGUE</small>
              <h2>All stories</h2>

              {books.map((b) => (
                <div className="admin-row" key={b._id}>
                  <span>
                    <b>{b.title}</b>
                    <small>
                      {b.chapters.length} chapters · {b.status}
                    </small>
                  </span>

                  <button
                    onClick={() => {
                      Sel(String(b._id));
                      T("write");
                    }}
                  >
                    Open
                  </button>

                  <button
                    className="danger"
                    onClick={() =>
                      confirm(`Delete ${b.title}?`) &&
                      act(() =>
                        api.delete("/admin/books/" + b._id)
                      )
                    }
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </section>

            <section className="panel">
              <small className="kicker">START SOMETHING NEW</small>
              <h2>Create a book</h2>

              <form className="form" onSubmit={createBook}>
                <label>
                  Title
                  <input
                    value={bf.title}
                    onChange={(e) =>
                      BF({ ...bf, title: e.target.value })
                    }
                    required
                  />
                </label>

                <label>
                  Subtitle
                  <input
                    value={bf.subtitle}
                    onChange={(e) =>
                      BF({ ...bf, subtitle: e.target.value })
                    }
                  />
                </label>

                <label>
                  Description
                  <textarea
                    rows="3"
                    value={bf.description}
                    onChange={(e) =>
                      BF({ ...bf, description: e.target.value })
                    }
                  />
                </label>

                <label>
                  Cover image URL
                  <input
                    value={bf.coverUrl}
                    onChange={(e) =>
                      BF({ ...bf, coverUrl: e.target.value })
                    }
                  />
                </label>

                <div className="two">
                  <label>
                    Genre
                    <input
                      value={bf.genre}
                      onChange={(e) =>
                        BF({ ...bf, genre: e.target.value })
                      }
                    />
                  </label>

                  <label>
                    Status
                    <select
                      value={bf.status}
                      onChange={(e) =>
                        BF({ ...bf, status: e.target.value })
                      }
                    >
                      <option>ongoing</option>
                      <option>completed</option>
                      <option>hiatus</option>
                    </select>
                  </label>
                </div>

                <button
                  className="btn dark full"
                  disabled={busy}
                >
                  <Plus size={15} />
                  Create book
                </button>
              </form>
            </section>
          </div>
        )}

        {/* Chapter editor */}
        {tab === "write" && (
          <div className="admin-grid">
            <section className="panel">
              <small className="kicker">CHOOSE A STORY</small>
              <h2>Chapter list</h2>

              <select
                value={selected}
                onChange={(e) => {
                  Sel(e.target.value);
                  Edit("");
                  CF(chapter);
                }}
              >
                <option value="">Select book…</option>

                {books.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.title}
                  </option>
                ))}
              </select>

              {book?.chapters?.map((c) => (
                <div className="admin-row" key={c._id}>
                  <span>
                    <b>
                      {c.number}. {c.title}
                    </b>
                    <small>{c.status}</small>
                  </span>

                  <button
                    onClick={() => {
                      Edit(c._id);
                      CF({
                        title: c.title,
                        number: c.number,
                        content: {
                          en: c.content?.en || "",
                          hi: c.content?.hi || "",
                        },
                        status: c.status,
                      });
                    }}
                  >
                    <PenLine size={14} />
                  </button>

                  <button
                    className="danger"
                    onClick={() =>
                      confirm("Delete chapter?") &&
                      act(() =>
                        api.delete(
                          `/admin/books/${selected}/chapters/${c._id}`
                        )
                      )
                    }
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </section>

            <section className="panel">
              <small className="kicker">
                {edit ? "EDIT CHAPTER" : "WRITE SOMETHING TRUE"}
              </small>

              <h2>
                {edit ? "Shape this chapter" : "The next chapter"}
              </h2>

              <form className="form" onSubmit={saveChapter}>
                <label>
                  Chapter title
                  <input
                    value={cf.title}
                    onChange={(e) =>
                      CF({ ...cf, title: e.target.value })
                    }
                    required
                  />
                </label>

                <div className="two">
                  <label>
                    Number
                    <input
                      type="number"
                      min="1"
                      value={cf.number}
                      onChange={(e) =>
                        CF({
                          ...cf,
                          number: Number(e.target.value),
                        })
                      }
                    />
                  </label>

                  <label>
                    Status
                    <select
                      value={cf.status}
                      onChange={(e) =>
                        CF({ ...cf, status: e.target.value })
                      }
                    >
                      <option value="draft">Save as draft</option>
                      <option value="published">
                        Publish chapter
                      </option>
                    </select>
                  </label>
                </div>

                <label>
                  English text
                  <textarea
                    rows="10"
                    value={cf.content.en}
                    onChange={(e) =>
                      CF({
                        ...cf,
                        content: {
                          ...cf.content,
                          en: e.target.value,
                        },
                      })
                    }
                    placeholder="Write in English…"
                  />
                </label>

                <label>
                  Hindi translation
                  <textarea
                    rows="8"
                    value={cf.content.hi}
                    onChange={(e) =>
                      CF({
                        ...cf,
                        content: {
                          ...cf.content,
                          hi: e.target.value,
                        },
                      })
                    }
                    placeholder="हिंदी में लिखें…"
                  />
                </label>

                <div className="actions">
                  <button
                    type="button"
                    className="btn outline"
                    onClick={() => {
                      Edit("");
                      CF(chapter);
                    }}
                  >
                    New chapter
                  </button>

                  <button
                    className="btn dark"
                    disabled={busy || !selected}
                  >
                    <Save size={15} />
                    {edit ? "Update chapter" : "Save chapter"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

        {/* Community and moderation */}
        {tab === "comments" && (
          <section className="panel">
            <small className="kicker">THE COMMUNITY</small>
            <h2>Reader comments & moderation</h2>

            {comments.map((c) => (
              <div className="admin-row" key={c.id}>
                <span>
                  <b>
                    {c.user}
                    {c.reports > 0 && ` · ${c.reports} reports`}
                  </b>

                  <p>{c.body}</p>
                  <small>{c.email}</small>
                </span>

                <button
                  onClick={() =>
                    act(() =>
                      api.patch(
                        `/admin/comments/${c.id}/moderate`,
                        { hidden: !c.hidden }
                      )
                    )
                  }
                >
                  {c.hidden ? "Restore" : "Hide"}
                </button>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

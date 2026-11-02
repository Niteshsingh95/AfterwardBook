import { Link } from "react-router-dom";
import { ArrowUpRight, BookOpen } from "lucide-react";
export function Notice({ children, type = "" }) {
  return children ? <div className={"notice " + type}>{children}</div> : null;
}
export function Loading() {
  return <div className="loading">Gathering stories…</div>;
}
export function BookCard({ book, i = 0 }) {
  const cls = ["rose", "olive", "blue", "sand", "plum"][i % 5];
  return (
    <article className="book-card">
      <Link
        to={"/book/" + book.slug}
        className={"cover " + cls}
        style={
          book.coverUrl
            ? {
                backgroundImage: `linear-gradient(180deg,transparent,rgba(20,20,20,.8)),url(${book.coverUrl})`,
              }
            : {}
        }
      >
        <small>AFTERWORD ORIGINAL</small>
        <strong>{book.title}</strong>
        <small>
          {book.genre || "FICTION"} ·{" "}
          {book.status === "completed" ? "COMPLETE" : "SERIAL"}
        </small>
      </Link>
      <div className="card-title">
        <div>
          <h3>
            <Link to={"/book/" + book.slug}>{book.title}</Link>
          </h3>
          <p>
            {book.subtitle ||
              book.description ||
              "A story of the things we carry."}
          </p>
        </div>
        <Link className="circle" to={"/book/" + book.slug}>
          <ArrowUpRight size={18} />
        </Link>
      </div>
      <div className="meta">
        <span>
          <BookOpen size={13} /> {book.chapters?.length || 0} chapters
        </span>
        <span>{book.status === "completed" ? "Completed" : "Ongoing"}</span>
      </div>
    </article>
  );
}

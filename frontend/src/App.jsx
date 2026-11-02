import { useState } from "react";
import { Link, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { Feather, Menu, X, Bookmark, LogOut } from "lucide-react";
import { useAuth } from "./state";
import Home from "./pages/Home";
import AuthPage from "./pages/AuthPage";
import VerifyPage from "./pages/VerifyPage";
import BookPage from "./pages/BookPage";
import ReadPage from "./pages/ReadPage";
import LibraryPage from "./pages/LibraryPage";
import AdminPage from "./pages/AdminPage";
import AdminSetup from "./pages/AdminSetup";
function Header() {
  const { user, signOut } = useAuth(),
    [open, setOpen] = useState(false),
    nav = useNavigate();
  const logout = () => {
    signOut();
    setOpen(false);
    nav("/");
  };
  return (
    <header className="header">
      <div className="nav">
        <Link to="/" className="brand">
          <span>
            <Feather />
          </span>
          <b>
            afterword<small>STORIES THAT STAY</small>
          </b>
        </Link>
        <button className="mobile" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
        <nav className={open ? "links open" : "links"}>
          <NavLink to="/" onClick={() => setOpen(false)}>
            Discover
          </NavLink>
          {user && (
            <NavLink to="/library">
              <Bookmark size={14} /> My library
            </NavLink>
          )}
          {user?.role === "admin" && <NavLink to="/admin">Studio</NavLink>}
          {user ? (
            <>
              <span className="user">{user.name.split(" ")[0]}</span>
              <button className="btn ghost small" onClick={logout}>
                <LogOut size={14} /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/signin">Sign in</Link>
              <Link to="/signup" className="btn dark small">
                Join the circle ↗
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
export default function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<AuthPage mode="signin" />} />
          <Route path="/signup" element={<AuthPage mode="signup" />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/book/:slug" element={<BookPage />} />
          <Route path="/read/:slug/:chapterId" element={<ReadPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin-setup" element={<AdminSetup />} />
          <Route
            path="*"
            element={
              <section className="empty">
                <h2>Page not found</h2>
                <Link className="btn dark" to="/">
                  Return home
                </Link>
              </section>
            }
          />
        </Routes>
      </main>
      <footer>
        <Link to="/" className="brand">
          <span>
            <Feather />
          </span>
          <b>
            afterword<small>STORIES THAT STAY</small>
          </b>
        </Link>
        <p>Some stories are fiction. The feelings are real.</p>
        <small>© {new Date().getFullYear()} Afterword</small>
      </footer>
    </>
  );
}

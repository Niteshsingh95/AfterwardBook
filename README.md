# Afterword — Fiction Publishing Platform

A full-stack MERN starter for a members-only fiction website.

## Included
- Responsive React/Vite story library and reading interface
- Email/password signup with OTP verification; email/password signin only (no Google auth)
- JWT sessions and bcrypt password hashing
- One-time admin bootstrap, admin book/chapter CRUD, drafts and publishing
- English/Hindi chapter content, bookmarks, reading progress, comments, replies, likes, reports and moderation
- AI integration placeholders for writing help, translation and comment insights

## Setup
1. Extract the ZIP and open this folder in VS Code.
2. Copy `backend/.env.example` to `backend/.env`; set MongoDB, JWT and admin setup values. Configure SMTP to send OTP emails.
3. Terminal 1: `cd backend`, `npm install`, `npm run dev`
4. Terminal 2: `cd frontend`, `npm install`, `npm run dev`
5. Open http://localhost:5173.
6. Sign up and verify your email. If SMTP is not configured in development, the OTP is printed in the backend terminal. Sign in, then visit `/admin-setup` and enter `ADMIN_SETUP_KEY`. This can only be used once. Sign in again and open `/admin`.

## Requirements
Node.js 20.19+ or 22.12+ recommended. MongoDB Atlas or local MongoDB.

## Important
Never commit `.env`. Use strong secrets and HTTPS in production. AI features are placeholders until an AI provider is configured. This starter has not undergone a formal security audit; review deployment security, backups, privacy, abuse prevention and email deliverability before launch.

# Afterword — Stories That Stay With You

<p align="center">
  <strong>A Life-Inspired Fiction & Reading Platform</strong>
</p>

<p align="center">
  A place where real emotions become stories, memories become chapters, and every reader finds something they can relate to.
</p>

<p align="center">
  <a href="https://afterward-book-3qioajgbd-nitesh-singh1.vercel.app/">Live Website</a> ·
  <a href="https://afterward-api.onrender.com/api/health">Backend API</a>
</p>

---

## About the Project

**Afterword** is a life-inspired fiction and online storytelling platform designed for readers who enjoy emotional, relatable and meaningful stories.

The platform allows an author to publish multiple books, organize stories into chapters, and connect with readers through comments and discussions.

The stories published on Afterword are inspired by real-life experiences but are presented as fiction.

Readers can create accounts, verify their email addresses, explore published books, read chapters, bookmark their favorite books and interact with the author and other readers.

Afterword aims to create more than just a reading platform — it aims to build a community around stories and emotions.

## Live Demo

| Component | URL |
|---|---|
| Frontend | https://afterward-book-3qioajgbd-nitesh-singh1.vercel.app/ |
| Backend API | https://afterward-api.onrender.com/ |
| API Health Check | https://afterward-api.onrender.com/api/health |

## Features

### 1. User Authentication & Security

- User registration with name, email and password.
- Email OTP verification during signup.
- Six-digit email verification code.
- OTP expiration after 10 minutes.
- Password-based login.
- Password hashing using bcrypt.
- JWT-based authentication.
- Protected routes for authenticated users.
- Role-based access control for administrators.
- Persistent authentication using browser storage.
- No Google authentication — email-based authentication only.

### 2. Book Discovery

- Explore published books.
- View individual book details.
- Discover stories through their descriptions and titles.
- Access chapters belonging to a particular book.
- Organized storytelling experience.

### 3. Chapter Reading Experience

- Read individual chapters.
- Access chapter content through protected reading routes.
- Support for English and Hindi chapter content.
- Navigate through a book's chapters.
- Save reading progress.
- Continue reading from previously saved progress.

### 4. Personal Library

- Bookmark favorite books.
- Maintain a personal reading library.
- View saved books.
- Track reading progress.

### 5. Community & Reader Interaction

- Comment on chapters.
- Like comments.
- Report inappropriate comments.
- Interact with other readers.
- Participate in discussions around stories.
- Receive author responses through the comment system.

### 6. Author Dashboard (Studio)

A dedicated dashboard allows the author to manage the storytelling platform.

**Book Management**
- Create new books.
- View the book catalogue.
- Edit book information.
- Delete books.

**Chapter Management**
- Create chapters for individual books.
- Edit existing chapters.
- Delete chapters.
- Write chapter content in English and Hindi.
- Save chapters as drafts.
- Publish chapters when ready.

**Community Management**
- View reader comments.
- Moderate comments.
- Hide inappropriate comments.
- Restore hidden comments.
- Manage reported content.
- Respond to readers as the author.

**Dashboard Overview**
- Total books.
- Total readers.
- Total comments.
- Total reports.

### 7. Admin Account Setup

- Dedicated initial admin setup page.
- One-time owner setup using a private setup key.
- Requires a verified, signed-in account.
- Admin privileges are assigned through the backend.
- Setup key is maintained as a backend environment variable.

### 8. Responsive User Interface

- Dedicated homepage.
- Clean and minimal reading experience.
- Separate authentication pages.
- Email verification page.
- Book details and chapter reading pages.
- Personal library.
- Author studio.
- Navigation for authenticated and unauthenticated users.
- Responsive layouts for different screen sizes.

---

## Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| React | Component-based user interface |
| Vite | Frontend development and build tool |
| JavaScript | Application functionality |
| React Router DOM | Client-side routing |
| Axios | HTTP requests and API integration |
| Lucide React | Icons |
| CSS | Styling and responsive layouts |

### Backend

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | Backend framework and REST APIs |
| MongoDB | NoSQL database |
| Mongoose | Database modelling and interaction |
| JWT | Authentication and authorization |
| bcryptjs | Password hashing |
| Nodemailer | Email OTP delivery |
| CORS | Cross-origin resource sharing |
| Helmet | HTTP security headers |
| Express Rate Limit | API rate limiting |
| dotenv | Environment configuration |

### Deployment & Services

| Service | Purpose |
|---|---|
| GitHub | Source code management |
| Vercel | Frontend deployment |
| Render | Backend deployment |
| MongoDB Atlas | Cloud database hosting |
| SMTP | Email verification delivery |

---

## Project Architecture

Afterword follows a client-server architecture.

```text
                 AFTERWORD
                     |
          +----------+----------+
          |                     |
       Frontend               Backend
       React + Vite        Node.js + Express
          |                     |
          | Axios API Requests  |
          +----------API--------+
                                |
                     +----------+----------+
                     |                     |
                  MongoDB              Nodemailer
                  Database             Email OTP
```

### Frontend Structure

```text
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   │   ├── AuthPage.jsx
│   │   ├── VerifyPage.jsx
│   │   ├── AdminPage.jsx
│   │   ├── AdminSetup.jsx
│   │   ├── BookPage.jsx
│   │   ├── ReadPage.jsx
│   │   ├── LibraryPage.jsx
│   │   └── ...
│   ├── state/
│   ├── api.js
│   ├── App.jsx
│   └── main.jsx
├── .env.production
├── package.json
└── vite.config.js
```

### Backend Structure

```text
backend/
├── src/
│   ├── services/
│   ├── server.js
│   ├── routes.js
│   └── models.js
├── package.json
└── .env.example
```

*Note: Folder and file names may vary slightly depending on the current project version.*

---

## Authentication Workflow

### Signup & Email Verification

1. A reader opens the signup page.
2. The reader enters their name, email and password.
3. The backend creates the signup verification process.
4. A six-digit OTP is sent to the registered email address.
5. The reader enters the OTP on the verification page.
6. The backend validates the OTP.
7. The email is marked as verified.
8. The reader can now sign in.

### Login Workflow

1. The reader enters their email and password.
2. The backend verifies the credentials.
3. A JWT token is generated.
4. The frontend stores the authentication token.
5. Axios attaches the token to subsequent API requests.
6. Protected routes validate the user's authentication and permissions.

---

## API Overview

The backend exposes REST API endpoints under:

```text
/api
```

The API includes the following functional groups:

| API Group | Responsibility |
|---|---|
| `/auth` | Signup, OTP verification, login and current user |
| `/books` | Book discovery and book details |
| `/chapters` | Chapter reading and management |
| `/bookmarks` | Personal library and bookmarks |
| `/progress` | Reading progress |
| `/comments` | Reader comments and interactions |
| `/admin` | Admin setup, dashboard and content management |

The backend also provides a health-check endpoint:

```http
GET /api/health
```

Example response:

```json
{
  "ok": true,
  "name": "Afterword API"
}
```

---

## Installation & Local Development

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- Git
- MongoDB Atlas account or local MongoDB
- VS Code (recommended)

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/afterword.git
```

```bash
cd afterword
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file using the variables required by your backend configuration.

Example configuration:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=your_token_expiry
CLIENT_URL=http://localhost:5173

SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_SECURE=your_smtp_secure_setting
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
EMAIL_FROM=your_sender_email

ADMIN_SETUP_KEY=your_private_admin_setup_key
```

**Important:** These are illustrative environment variable names. Use the exact names expected by your backend source code.

Start the backend development server:

```bash
npm run dev
```

The backend will run at:

```text
http://localhost:5000
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file if needed:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

The Vite development server will display its local URL, usually:

```text
http://localhost:5173
```

---

## Environment Variables

The application uses environment variables to keep configuration and sensitive credentials outside the source code.

| Variable | Description |
|---|---|
| `PORT` | Backend server port |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWTs |
| `JWT_EXPIRES_IN` | JWT expiration duration |
| `CLIENT_URL` | Frontend origin |
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP server port |
| `SMTP_SECURE` | SMTP secure connection setting |
| `SMTP_USER` | SMTP authentication username |
| `SMTP_PASS` | SMTP authentication password |
| `EMAIL_FROM` | Sender email address |
| `ADMIN_SETUP_KEY` | One-time admin setup key |
| `VITE_API_URL` | Frontend API base URL |

Never commit real `.env` files, database credentials, email passwords, JWT secrets or admin setup keys to GitHub.

---

## Deployment

Afterword is deployed using separate frontend and backend hosting services.

### Frontend Deployment — Vercel

- Connect the GitHub repository to Vercel.
- Select the `frontend` directory as the root directory.
- Use Vite as the framework preset.
- Build command: `npm run build`.
- Output directory: `dist`.
- Configure `VITE_API_URL` with the production backend API URL.

### Backend Deployment — Render

- Connect the GitHub repository to Render.
- Select `backend` as the root directory.
- Build command: `npm install`.
- Start command: `npm start`.
- Configure the production environment variables.
- Allow the deployed frontend origin through backend CORS configuration.

### Database — MongoDB Atlas

- Create a MongoDB Atlas cluster.
- Configure database credentials.
- Configure network access securely.
- Add the MongoDB connection string to Render's environment variables.

---

## Security Considerations

Afterword uses several security practices:

- Password hashing with bcryptjs.
- JWT-based authentication.
- Protected API endpoints.
- Role-based administrator authorization.
- Email OTP verification.
- OTP expiration.
- HTTP security headers using Helmet.
- API rate limiting.
- CORS configuration.
- Environment variables for sensitive configuration.

Production deployments should use HTTPS, strong secrets, restricted database network access and appropriate access controls.

---

## Future Enhancements

Potential future improvements include:

- Advanced book search and filtering.
- Reader ratings and reviews.
- Reading themes and font customization.
- Notifications for newly published chapters.
- Reader profiles and public author pages.
- Advanced reading analytics.
- Social sharing for books and chapters.
- More language support.
- Improved accessibility.

---

## Project Goals

Afterword was created to provide a personal and engaging space for life-inspired storytelling.

Its main goals are:

- Give authors a simple platform to publish stories.
- Make reading accessible through a clean interface.
- Encourage meaningful reader discussions.
- Connect authors and readers.
- Turn personal emotions and experiences into fictional stories.

---

## Author

**Nitesh Singh**

B.Tech — Computer Science

GitHub: [Add your GitHub profile link]

LinkedIn: [Add your LinkedIn profile link]

Portfolio: [Add your portfolio link]

---

<p align="center">
  <strong>Afterword — Every story leaves something behind.</strong>
</p>

<p align="center">
  Made with ❤️ for readers and storytellers.
</p>

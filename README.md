# SecureVault – Personal Digital Locker

A full-stack web application that gives students a single, private, and secure place to store and manage all their important documents and personal information.

## Problem

Students keep important documents scattered across phones, laptops, email, cloud storage, and messaging apps. SecureVault brings everything into one secure digital locker — private, organized, and accessible only to the logged-in student.

## Features

### Authentication
- Student signup / login / logout
- Secure password hashing (handled by Supabase Auth with bcrypt)
- Forgot / reset password via email
- Protected routes — unauthenticated users cannot access the app
- Each user can only access their own data (Row-Level Security)

### Personal Locker
- Personal dashboard with stats and analytics
- Upload and store documents (PDF, images, Word, Excel, PowerPoint, text)
- View, download, and delete documents
- Search by name / tags / description
- Filter by category and file type
- Sort by newest, oldest, or name

### Document Upload
- File size validation (10 MB max)
- File type validation (whitelist of allowed MIME types)
- Title, category, description, and tags
- Smart category suggestions based on file name and type
- Optional expiry / renewal date for reminders
- Secure private storage (per-user folder isolation)

### Categories
College ID, Marksheets, Certificates, Resume, Internship, Projects, Scholarships, Government Documents, Personal, Other

### Personal Information
- Full name, student ID / roll number, college, course, branch, year / semester
- Email, phone, address
- Emergency contact, blood group
- Profile completion indicator

### Innovation Features
- Favorites for important documents
- Recently viewed document tracking
- Secure Trash with Restore and Permanently Delete
- Document expiry / renewal reminders
- Storage analytics with category breakdown charts
- Activity log for all actions (upload, view, download, delete, restore, profile updates)
- Security status indicator
- Smart category suggestions

## Tech Stack

- **Frontend:** React + TypeScript, Tailwind CSS, Lucide Icons, React Router
- **Backend / Database:** Supabase (PostgreSQL, Auth, Storage, Row-Level Security)
- **Build Tool:** Vite

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Running the App

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

## Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `profiles` | Extends `auth.users` with display name |
| `documents` | Document metadata (title, category, tags, file info, favorites, trash, expiry) |
| `personal_info` | Student personal information (one row per user) |
| `activity_log` | Audit trail of all user actions |
| `document_views` | Recently viewed document tracking |

### Storage

- `documents` bucket (private) — files stored under `{user_id}/` folders
- Storage policies enforce per-user folder isolation

### Security (RLS)

All tables have Row-Level Security enabled with ownership-scoped policies:
- `SELECT` — users can only read their own rows
- `INSERT` — users can only insert rows they own
- `UPDATE` — users can only update their own rows
- `DELETE` — users can only delete their own rows

## API Documentation

SecureVault uses Supabase's auto-generated REST API. All data access is mediated through the Supabase client with RLS enforcement.

### Auth Endpoints (Supabase Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `auth/signup` | Register a new student account |
| POST | `auth/signInWithPassword` | Login with email and password |
| POST | `auth/signOut` | Logout current session |
| POST | `auth/resetPasswordForEmail` | Send password reset link |
| PUT | `auth/updateUser` | Update password |

### Documents

| Method | Table | Description |
|--------|-------|-------------|
| POST | `documents` | Upload document metadata |
| GET | `documents` | List user's documents |
| GET | `documents` | Get single document by ID |
| PUT | `documents` | Update document metadata |
| DELETE | `documents` | Delete document |
| POST | `storage/documents` | Upload file to storage |
| GET | `storage/documents` | Download file from storage |

### Personal Info

| Method | Table | Description |
|--------|-------|-------------|
| GET | `personal_info` | Get user's personal info |
| PUT | `personal_info` | Update personal info |

### Activity Log

| Method | Table | Description |
|--------|-------|-------------|
| GET | `activity_log` | List user's activity history |
| POST | `activity_log` | Log a new activity |

## Pages

1. **Landing Page** — Hero, problem explanation, features, security, CTAs
2. **Signup** — Create account with name, email, password
3. **Login** — Sign in with email and password
4. **Dashboard** — Stats, recent docs, quick actions, expiry reminders, storage charts
5. **My Locker** — Full document list with search, filter, and sort
6. **Upload Document** — Modal with drag-and-drop, category suggestions, file validation
7. **Personal Info** — Editable form with profile completion
8. **Document Preview** — PDF/image preview, metadata, edit, download, delete
9. **Favorites** — Starred documents
10. **Trash** — Soft-deleted documents with restore and permanent delete
11. **Activity** — Timeline of all user actions
12. **Settings** — Profile, account details, security status, sign out

## Design

- Dark navy / blue futuristic digital-vault theme
- Glassmorphism cards with subtle borders
- Smooth animations and micro-interactions
- Fully responsive (mobile, tablet, desktop)
- Loading states and skeletons
- Success / error toast notifications

## License

Built for a student hackathon.

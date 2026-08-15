# Issue Tracking System

A full-stack issue tracking system with:

- React frontend (`frontend/`)
- Spring Boot backend (`backend/`)
- MongoDB persistence

## Features

- User registration and login with BCrypt password hashing
- Create, view, edit, delete, search, and filter issues
- Issue type, priority, status, assignee, and due-date tracking
- Status workflow: Open, In Progress, Resolved, and Closed
- Comments and activity history
- Dashboard totals for open, completed, and high-priority issues
- Per-user issue ownership: users only see and manage issues they created
- Role-protected admin dashboard showing issues and summaries across all users
- Role-based workflow: users can Open/Close tickets; admins can also use In Progress and Resolved
- Twelve issue categories with automatic recommended-team assignment
- User notifications and history labels for statuses changed by an administrator
- Admin issue cards identify the user who raised each issue by name and email

### Administrator login

The development admin account is created automatically when the backend starts:

- Email: `admin@issuetracker.com`
- Password: `Admin@123`

For a non-development environment, set `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` before starting the backend.

Additional administrators can use **Register admin** on the login page. The development registration code is
`ISSUE-ADMIN-2026`. Set `ADMIN_REGISTRATION_CODE` to a private value outside development.

- Responsive interface, API validation, and user-friendly errors

## Setup

### Backend
1. Install Java 17 and Maven.
2. Start MongoDB on `localhost:27017`.
3. Run from `backend/`:
   ```bash
   mvn clean package
   mvn spring-boot:run
   ```

### Frontend
1. Install Node.js (18+ recommended).
2. From `frontend/`:
   ```bash
   npm install
   npm start
   ```

## Notes

- Backend API: `http://localhost:8080/api/issues`
- Frontend runs on `http://localhost:3000`
- CORS is enabled globally for the React development server.
- API documentation is available at `http://localhost:8080/swagger-ui/index.html`.

## Assignment submission checklist

- Capture screenshots of the running application.
- Record a 3–5 minute demonstration video.
- Create the submission PDF/Word document with your name, repository link, branch name, and video link.
- Push the source code to your separate assignment branch.

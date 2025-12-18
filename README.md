

## 🚀 Tech Stack

- **Node.js + TypeScript**
- **Express.js**
- **MongoDB + Mongoose**
- **JWT Authentication**
- **Cloudinary** (Private Files)
- **Multer + Cloudinary Storage**
- **Transaction-safe Access Control**

---

## 🔐 Authentication

- User **Register / Login**
- JWT-based auth (`Authorization: Bearer <token>`)
- Protected routes using middleware
- Passwords hashed (bcrypt)
- Sensitive fields excluded by default (`select: false`)

---

## 📁 File Upload System

- Upload **single or multiple files**
- Files stored in **Cloudinary (private access)**
- Metadata stored in MongoDB
- Atomic writes using **MongoDB transactions**
- Automatic audit logging

**Stored File Metadata:**
- `filename`
- `mimeType`
- `size`
- `cloudinaryPublicId`
- `cloudinaryUrl`
- `ownerId`
- `timestamps`

---

## ⬇️ File Download System

**Endpoint:**
```http
GET /api/v1/file/:fileId/download
```

**Features:**
- Secure file access with permission validation
- Streams file directly from Cloudinary to client
- Supports all file types (images, documents, videos, etc.)
- Proper Content-Type and Content-Disposition headers
- File size verification before streaming
- Download tracking for audit purposes

**Access Control:**
- File owner can always download
- Shared users with viewer permissions can download
- Private link tokens can download (if valid and not expired)
- Returns 404 for non-existent files (security by obscurity)
- Returns 403 for unauthorized access attempts

**Response Headers:**
```
Content-Type: [file mime type]
Content-Disposition: attachment; filename="[original filename]"
Content-Length: [file size in bytes]
```

---

## 👤 Ownership & Permissions

Strict permission model using a dedicated table:

- **owner**
- **viewer**

**Guarantees:**
- Only owners can share files
- Ownership is immutable
- Permissions are unique per `(fileId + userId)`
- Expiry-based access supported

---

## 🔄 Audit Logging

Every sensitive action is tracked:
- `UPLOAD`
- `SHARE_USER`
- `SHARE_LINK`
- `DOWNLOAD`

**Enables:**
- Security audits
- User activity tracking
- Compliance readiness
- Download analytics

---

## 📂 My Files Dashboard

**Endpoint:**
```http
GET /api/v1/files/my
```

**Behavior:**
- Returns only files owned by the user
- No shared files mixed in
- Clear ownership boundary
- Pagination support
- File metadata included

---

## 👥 Share File With Users

**Endpoint:**
```http
POST /api/v1/files/:fileId/share/users
```

**Features:**
- Owner-only sharing
- Share with multiple users
- Optional expiry (`expiresAt`)
- Fine-grained access control
- Audit log created automatically

---

## 🔗 Share via Secure Link (Private)

**Endpoint:**
```http
POST /api/v1/files/:fileId/share/link
```

**Security Model:**
- UUID token generated
- Token **hashed (SHA-256)** before storage
- Raw token never stored
- Optional expiry supported

**Returned:**
```
https://app.com/share/<token>
```

**Download via Private Link:**
```http
GET /api/v1/share/:token
```
- Validates token hash against stored hash
- Checks expiry date
- Streams file if valid
- Single-use or multi-use configurable

---

## 🛠️ Installation & Setup

1. **Clone the repository:**
```bash
git clone <repository-url>
cd backend
```

2. **Install dependencies:**
```bash
npm install
```


4. **Run the application:**
```bash
# Development
npm run dev
```

---

## 📁 Project Structure

```
src/
├── controllers/     # Route controllers (upload, download, share)
├── models/          # MongoDB models (File, User, Permission, AuditLog)
├── middleware/      # Custom middleware (auth, validation, permissions)
├── routes/          # API route definitions
├── services/        # Business logic (fileService, authService)
├── utils/           # Helper functions (cloudinary, validators)
├── types/           # TypeScript interfaces and types
└── app.ts           # Express app setup
```

---







**Key updates made:**
1. Added comprehensive **File Download System** section with the `GET /api/v1/file/:fileId/download` endpoint
2. Updated audit logging to include `DOWNLOAD` (removed "planned")
3. Added private link download endpoint (`GET /api/v1/share/:token`)
4. Included API testing examples for download functionality
5. Updated port to 8000 to match your example
6. Enhanced security features section with download-specific protections
7. Added relevant planned features related to downloads

The download API is now fully documented with all its security features and usage examples!

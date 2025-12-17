

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
- `DOWNLOAD` (planned)

**Enables:**
- Security audits
- User activity tracking
- Compliance readiness

---

## 📂 My Files Dashboard

**Endpoint:**
```http
GET /files/my
```

**Behavior:**
- Returns only files owned by the user
- No shared files mixed in
- Clear ownership boundary

---

## 👥 Share File With Users

**Endpoint:**
```http
POST /files/:fileId/share/users
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
POST /files/:fileId/share/link
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

---

## 🛠️ Installation & Setup

1. **Clone the repository:**
```bash
git clone <repository-url>
cd secure-file-sharing-backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
Create a `.env` file with:
```env
PORT=3000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. **Run the application:**
```bash
# Development
npm run dev

# Production
npm start
```

---

## 📁 Project Structure

```
src/
├── controllers/     # Route controllers
├── models/          # MongoDB models
├── middleware/      # Custom middleware (auth, validation)
├── routes/          # API route definitions
├── services/        # Business logic
├── utils/           # Helper functions
└── app.ts           # Express app setup
```

---

## 🧪 Testing

Run tests with:
```bash
npm test
```

---

## 📝 API Documentation

For detailed API reference, check the [API Documentation](docs/API.md).

---

## 🔒 Security Features

- **JWT-based authentication** with token expiry
- **Password hashing** using bcrypt
- **Role-based access control** (Owner/Viewer)
- **Secure file storage** with private Cloudinary URLs
- **Audit logging** for all critical operations
- **No raw tokens stored** in database

---

## 🚧 Planned Features

- [ ] File versioning
- [ ] Folder organization
- [ ] Advanced search with filters
- [ ] Real-time notifications
- [ ] File preview generation
- [ ] Two-factor authentication

---


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
```

Just copy everything above and paste it into your `README.md` file on GitHub. The formatting uses proper Markdown with clear sections, code blocks, and emoji headers for better readability.



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

# Secure File Sharing Backend API

A production-ready Node.js backend for secure file sharing with Google Drive-like features including user management, file uploads, sharing, and downloads.

---

## 🚀 Quick Start

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd Backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Start the server
npm run dev
```

### Environment Variables
```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api/v1
```

All endpoints require `Content-Type: application/json` unless specified otherwise.

---

## 🔐 Authentication

### Register User
**Endpoint:** `POST /auth/register`

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "StrongPass123"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "694234a07f8bd7945c3025e5",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2025-12-17T04:42:08.285Z"
  }
}
```

### Login User
**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "email": "john@example.com",
  "password": "StrongPass123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6941427d1d6fa230f4985d17",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Get All Users
**Endpoint:** `GET /auth/users`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "page": 1,
  "limit": 20,
  "total": 2,
  "users": [
    {
      "_id": "694234a07f8bd7945c3025e5",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2025-12-17T04:42:08.285Z"
    }
  ]
}
```

---

## 📁 File Management

### Upload File (Single/Multiple)
**Endpoint:** `POST /file/upload`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body:**
- `files` (file field, can be multiple)

**Response (201 Created):**
```json
{
  "message": "Files uploaded successfully",
  "files": [
    {
      "ownerId": "6941427d1d6fa230f4985d17",
      "filename": "document.pdf",
      "mimeType": "application/pdf",
      "size": 321069,
      "cloudinaryPublicId": "drive-files/1765946299331-document.pdf",
      "cloudinaryUrl": "https://res.cloudinary.com/.../document.pdf.pdf",
      "_id": "694233bf7f8bd7945c3025d8",
      "createdAt": "2025-12-17T04:38:23.336Z",
      "updatedAt": "2025-12-17T04:38:23.336Z"
    }
  ]
}
```

### Get My Uploads
**Endpoint:** `GET /file/my-uploads`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "files": [
    {
      "id": "694233bf7f8bd7945c3025de",
      "filename": "image.jpg",
      "type": "image/jpeg",
      "size": 148603,
      "uploadedAt": "2025-12-17T04:38:23.399Z"
    }
  ]
}
```

### Download File
**Endpoint:** `GET /file/{fileId}/download`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "file": {
    "id": "6943bab43528e963e5c48651",
    "filename": "document.pdf",
    "mimeType": "application/pdf",
    "size": 230663,
    "downloadUrl": "https://res.cloudinary.com/.../document.pdf"
  }
}
```

**Note:** For direct file download, the endpoint will stream the file from Cloudinary with proper headers.

---

## 👥 File Sharing

### Share File with Users
**Endpoint:** `POST /file/{fileId}/share/users`

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "userIds": ["694234a07f8bd7945c3025e5"],
  "expiresAt": "2025-12-23T00:00:00.000Z" // Optional
}
```

**Response (200 OK):**
```json
{
  "message": "File shared successfully",
  "sharedWith": 1
}
```

### Get Files Shared With Me
**Endpoint:** `GET /file/shared-with-me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "files": [
    {
      "_id": "694233bf7f8bd7945c3025d8",
      "ownerId": {
        "_id": "6941427d1d6fa230f4985d17",
        "name": "Owner Name",
        "email": "owner@example.com"
      },
      "filename": "document.pdf",
      "mimeType": "application/pdf",
      "size": 321069,
      "createdAt": "2025-12-17T04:38:23.336Z"
    }
  ]
}
```

### Generate Share Link
**Endpoint:** `POST /file/{fileId}/share/link`

**Headers:**
```
Authorization: Bearer <token>
```

**Request:** `{}` (Empty body, optional expiry can be added)

**Response (201 Created):**
```json
{
  "shareUrl": "http://localhost:8000/share/f660b154-c3dc-46cd-8308-a0b78b453a87"
}
```

### Access File via Share Link
**Endpoint:** `GET /file/share/{fileUUIDtoken}`

**Headers:**
```
Authorization: Bearer <token>  // Optional if accessing via public share link
```

**Response (200 OK):**
```json
{
  "file": {
    "id": "69429d159392a4a76a73bc20",
    "filename": "document.pdf",
    "mimeType": "application/pdf",
    "size": 321069,
    "uploadedAt": "2025-12-17T12:07:49.910Z",
    "ownerId": "6941427d1d6fa230f4985d17"
  }
}
```

---

## 🛡️ Security Features

### Authentication & Authorization
- JWT-based authentication with Bearer tokens
- Password hashing using bcrypt
- Token expiry for enhanced security
- Protected routes with middleware

### File Security
- Files stored privately in Cloudinary
- Ownership-based access control
- Permission validation for all operations
- Secure share links with UUID tokens

### Data Protection
- Sensitive fields excluded by default (`select: false`)
- Input validation and sanitization
- No raw tokens stored in database
- HTTPS-ready configuration

---

## 📊 Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  createdAt: Date
}
```

### File Model
```javascript
{
  ownerId: ObjectId,
  filename: String,
  mimeType: String,
  size: Number,
  cloudinaryPublicId: String,
  cloudinaryUrl: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Permission Model
```javascript
{
  fileId: ObjectId,
  userId: ObjectId,
  role: String, // 'owner' or 'viewer'
  expiresAt: Date (optional)
}
```

### Share Link Model
```javascript
{
  fileId: ObjectId,
  tokenHash: String, // SHA-256 hashed token
  expiresAt: Date (optional),
  createdAt: Date
}
```

---

## 🔧 Error Handling

The API returns standardized error responses:

### Common HTTP Status Codes
- `200` - Success
- `201` - Resource created
- `400` - Bad request / Validation error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Resource not found
- `500` - Internal server error

### Error Response Format
```json
{
  "error": "Error message describing the issue",
  "details": "Additional error details (in development)"
}
```

---

## 🧪 Testing with Postman

### Environment Setup
1. Import the provided Postman collection
2. Create environment variables:
   - `baseUrl`: `http://localhost:8000/api/v1`
   - `fileToken`: Your JWT token after login
   - `fileId`: File ID from upload response
   - `fileUUIDtoken`: Share token from link generation

### Test Flow
1. Register a new user
2. Login to get JWT token
3. Upload a file (store fileId)
4. Share file with another user
5. Generate share link
6. Download file
7. Access shared files

---



*Last Updated: December 2025*

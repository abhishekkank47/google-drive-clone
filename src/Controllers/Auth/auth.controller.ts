import jwt  from 'jsonwebtoken';
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import userModel from "../../Models/user.model";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validate input (minimal but strict)
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    // 2. Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists with this email",
      });
    }

    // 3. Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Create user
    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });

    // 5. Respond (never send password)
    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
//---------------------------------------------------------------------------------------------------------------

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // 1. Basic validation
  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  // 2. Find user and explicitly include password
  const user = await userModel.findOne({ email }).select("+password");

  if (!user) {
    // Do NOT reveal whether email exists
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }

  // 3. Compare password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }

  // 4. Create JWT payload (KEEP SMALL)
  const payload = {
    userId: user._id,
    email: user.email,
  };

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("FATAL: JWT_SECRET not set");
    return res.status(500).json({ message: "Internal server error" });
  }

  // 5. Sign token
  const token = jwt.sign(payload, secret, {
    expiresIn: "1h",
  });

  // 6. Respond
  return res.status(200).json({
    message: "Login successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
};
//---------------------------------------------------------------------------------------------------------------

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // Pagination (optional but important)
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    // Query users (password excluded by schema)
    const users = await userModel.find()
      .select("_id name email createdAt")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await userModel.countDocuments();

    return res.status(200).json({
      page,
      limit,
      total,
      users,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
//---------------------------------------------------------------------------------------------------------------

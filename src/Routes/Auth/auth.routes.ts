import { Router } from "express";
import { getAllUsers, loginUser, registerUser } from "../../Controllers/Auth/auth.controller";

export const authrouter = Router();

authrouter.post("/register", registerUser);
authrouter.post("/login", loginUser);
authrouter.get("/users", getAllUsers);

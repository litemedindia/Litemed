"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleLogin = async () => {
        try {
            const response = await axios.post("https://litemed-backend.vercel.app/login", { 
                username, 
                password 
            });
            // Store both token and username in local storage
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("username", response.data.username || username); // Use response username if available, otherwise use input
            router.push("/dashboard");
        } catch (err) {
            setError(err.response?.data?.error || "Invalid username or password");
        }
    };

    return (
        <div>
            <div className="flex items-center justify-center min-h-screen">
                <div className="p-8 bg-gradient-to-r from-gray-500 to-gray-700 rounded-lg shadow-md w-96">
                    <img src="/logo.png" alt="Litemed Logo" className="w-30 mx-auto mt-8" />
                    <h2 className="text-2xl font-bold text-center mb-4 text-white">Login</h2>
                    {error && <p className="text-red-500 text-center">{error}</p>}
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-2 mb-4 border rounded text-black"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 mb-4 border rounded text-black"
                    />
                    <button 
                        onClick={handleLogin} 
                        className="w-full bg-blue-500 text-white p-2 rounded"
                    >
                        Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
"use client"
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
            const response = await axios.post("http://localhost:5001/login", { username, password });
            localStorage.setItem("token", response.data.token);
            router.push("/dashboard");
        } catch (err) {
            setError(err.response?.data?.error || "Invalid username or password");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold text-center mb-4">Login</h2>
                {error && <p className="text-red-500 text-center">{error}</p>}
                <input 
                    type="text" 
                    placeholder="Username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    className="w-full p-2 mb-4 border rounded" 
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="w-full p-2 mb-4 border rounded" 
                />
                <button onClick={handleLogin} className="w-full bg-blue-500 text-white p-2 rounded">Login</button>
            </div>
        </div>
    );
};

export default Login;

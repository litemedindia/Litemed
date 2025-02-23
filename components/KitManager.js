import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Trash } from "lucide-react";

const API_BASE_URL = "http://localhost:5001";

const KitManager = () => {
    const [kits, setKits] = useState([]);
    const [selectedKits, setSelectedKits] = useState([]);
    const [file, setFile] = useState(null);
    const [showUpload, setShowUpload] = useState(false);
    const [totalAvailable, setTotalAvailable] = useState(0);
    const [totalSold, setTotalSold] = useState(0);
    const router = useRouter();

    useEffect(() => {
        const fetchKits = async () => {
            try {
                const allKitsResponse = await axios.get(`${API_BASE_URL}/kits`);
                setKits(allKitsResponse.data);
                setTotalAvailable(allKitsResponse.data.filter(kit => kit.status === "available").length);
                setTotalSold(allKitsResponse.data.filter(kit => kit.status === "sold").length);
            } catch (error) {
                console.error("Error fetching kits:", error);
            }
        };
        fetchKits();
    }, []);

    const deleteKit = async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/kits/${id}`);
            setKits(kits.filter(kit => kit._id !== id));
            setTotalAvailable(prev => prev - 1);
        } catch (error) {
            console.error("Error deleting kit:", error);
        }
    };

    const deleteSelectedKits = async () => {
        try {
            await axios.post(`${API_BASE_URL}/kits/delete-multiple`, { ids: selectedKits });
            setKits(kits.filter(kit => !selectedKits.includes(kit._id)));
            setTotalAvailable(prev => prev - selectedKits.length);
            setSelectedKits([]);
        } catch (error) {
            console.error("Error deleting selected kits:", error);
        }
    };

    const toggleSelectKit = (id) => {
        setSelectedKits(prev =>
            prev.includes(id) ? prev.filter(kitId => kitId !== id) : [...prev, id]
        );
    };

    const uploadCSV = async () => {
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);
        try {
            await axios.post(`${API_BASE_URL}/kits/upload`, formData);
            alert("CSV uploaded successfully");
            window.location.reload();
        } catch (error) {
            console.error("Error uploading CSV:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/");
    };

    return (
        <div className="p-6 space-y-6 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Kit Management</h1>
                <div className="flex space-x-4">
                    <button onClick={() => setShowUpload(!showUpload)} className="px-4 py-2 rounded bg-blue-600 text-white font-semibold shadow">Upload CSV</button>
                    <button onClick={handleLogout} className="px-4 py-2 rounded bg-red-600 text-white font-semibold shadow">Logout</button>
                </div>
            </div>

            <div className="flex justify-around mt-6">
                <div className="p-6 bg-blue-500 text-white rounded-lg shadow-lg text-center w-1/3">
                    <h3 className="text-lg font-bold">Total Available</h3>
                    <p className="text-3xl font-semibold">{totalAvailable}</p>
                </div>
                <div className="p-6 bg-gray-500 text-white rounded-lg shadow-lg text-center w-1/3">
                    <h3 className="text-lg font-bold">Total Sold</h3>
                    <p className="text-3xl font-semibold">{totalSold}</p>
                </div>
            </div>

            {showUpload && (
                <div className="mt-4">
                    <input type="file" onChange={(e) => setFile(e.target.files[0])} className="border p-2 w-full rounded" />
                    {file && <button onClick={uploadCSV} className="w-full bg-blue-600 mt-2 p-2 text-white font-semibold rounded shadow">Upload</button>}
                </div>
            )}

            <div className="flex justify-end my-2">
                {selectedKits.length > 0 && (
                    <button onClick={deleteSelectedKits} className="px-4 py-2 bg-red-600 text-white font-semibold rounded shadow">Delete Selected</button>
                )}
            </div>

            <table className="w-full border-collapse border border-gray-300 mt-4 bg-white shadow-lg rounded-lg overflow-hidden">
                <thead>
                    <tr className="bg-gray-200 text-gray-800">
                        <th className="border p-3">Select</th>
                        <th className="border p-3">Serial Number</th>
                        <th className="border p-3">Batch Number</th>
                        <th className="border p-3">Status</th>
                        <th className="border p-3">Order ID</th>
                        <th className="border p-3">Invoice URL</th>
                        <th className="border p-3">Invoice ID</th>
                        <th className="border p-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {kits.map((kit, index) => (
                        <tr key={index} className="border text-gray-700">
                            <td className="border p-3 text-center">
                                {kit.status === "available" && (
                                    <input type="checkbox" checked={selectedKits.includes(kit._id)} onChange={() => toggleSelectKit(kit._id)} />
                                )}
                            </td>
                            <td className="border p-3 text-center">{kit.serialNumber}</td>
                            <td className="border p-3 text-center">{kit.batchNumber}</td>
                            <td className="border p-3 text-center">{kit.status}</td>
                            <td className="border p-3 text-center">{kit.orderId || "N/A"}</td>
                            <td className="border p-3 text-center">{kit.invoiceUrl ? <a href={kit.invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600">View</a> : "N/A"}</td>
                            <td className="border p-3 text-center">{kit.invoiceId || "N/A"}</td>
                            <td className="border p-3 text-center">
                                {kit.status === "available" && (
                                    <button onClick={() => deleteKit(kit._id)} className="text-red-600 hover:text-red-800">
                                        <Trash size={20} />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default KitManager;

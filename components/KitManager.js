'use client';
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { User, Trash, LogOut, File } from "lucide-react";

const API_BASE_URL = "https://litemed-backend.vercel.app";

const KitManager = () => {
  const [kits, setKits] = useState([]);
  const [selectedAvailableKits, setSelectedAvailableKits] = useState([]);
  const [selectedSoldKits, setSelectedSoldKits] = useState([]);
  const [file, setFile] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [totalSold, setTotalSold] = useState(0);
  const [activeSection, setActiveSection] = useState("device-manager");
  const [username, setUsername] = useState("");
  const [codOrders, setCodOrders] = useState([]);
  const [totalCOD, setTotalCOD] = useState(0);
  const [totalConfirmed, setTotalConfirmed] = useState(0);
  const [totalCancelled, setTotalCancelled] = useState(0);
  const [returnTickets, setReturnTickets] = useState([]);
  const [totalReturns, setTotalReturns] = useState(0);
  const [totalAwaitingReturn, setTotalAwaitingReturn] = useState(0);
  const [totalReturnReceived, setTotalReturnReceived] = useState(0);
  const [totalRefundInitiated, setTotalRefundInitiated] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchKits = async () => {
      try {
        const allKitsResponse = await axios.get(`${API_BASE_URL}/kits`);
        setKits(allKitsResponse.data);
        setTotalAvailable(
          allKitsResponse.data.filter((kit) => kit.status === "available").length
        );
        setTotalSold(
          allKitsResponse.data.filter((kit) => kit.status === "sold").length
        );
      } catch (error) {
        console.error("Error fetching kits:", error);
      }
    };

    const fetchCodOrders = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/cod`);
        setCodOrders(response.data);
        calculateCodTotals(response.data);
      } catch (error) {
        console.error("Error fetching COD orders:", error);
      }
    };

    const fetchReturnTickets = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/returnservice`);
        setReturnTickets(response.data);
        calculateReturnTotals(response.data);
      } catch (error) {
        console.error("Error fetching return tickets:", error);
      }
    };

    if (activeSection === "device-manager") {
      fetchKits();
    } else if (activeSection === "cod") {
      fetchCodOrders();
    } else if (activeSection === "return-manager") {
      fetchReturnTickets();
    }

    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, [activeSection]);

  const calculateCodTotals = (orders) => {
    const total = orders.length;
    const confirmed = orders.filter((order) => order.status === "Confirmed").length;
    const cancelled = orders.filter((order) => order.status === "Cancelled").length;
    setTotalCOD(total);
    setTotalConfirmed(confirmed);
    setTotalCancelled(cancelled);
  };

  const calculateReturnTotals = (tickets) => {
    const total = tickets.length;
    const awaiting = tickets.filter((ticket) => ticket.status === "Awaiting Return").length;
    const received = tickets.filter((ticket) => ticket.status === "Return Received").length;
    const refunded = tickets.filter((ticket) => ticket.status === "Refund Initiated").length;
    setTotalReturns(total);
    setTotalAwaitingReturn(awaiting);
    setTotalReturnReceived(received);
    setTotalRefundInitiated(refunded);
  };

  const confirmOrder = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/cod/confirm/${id}`);
      const response = await axios.get(`${API_BASE_URL}/cod`);
      setCodOrders(response.data);
      calculateCodTotals(response.data);
    } catch (error) {
      console.error("Error confirming order:", error);
    }
  };

  const cancelOrder = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/cod/cancel/${id}`);
      const response = await axios.get(`${API_BASE_URL}/cod`);
      setCodOrders(response.data);
      calculateCodTotals(response.data);
    } catch (error) {
      console.error("Error canceling order:", error);
    }
  };

  const updateReturnStatus = async (id, action) => {
    try {
      await axios.put(`${API_BASE_URL}/returnservice/${id}/action`, { action });
      const response = await axios.get(`${API_BASE_URL}/returnservice`);
      setReturnTickets(response.data);
      calculateReturnTotals(response.data);
    } catch (error) {
      console.error("Error updating return status:", error);
      alert("Failed to update status");
    }
  };

  const deleteKit = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/kits/${id}`);
      setKits(kits.filter((kit) => kit._id !== id));
      setTotalAvailable((prev) => prev - 1);
    } catch (error) {
      console.error("Error deleting kit:", error);
    }
  };

  const deleteSelectedKits = async () => {
    try {
      await axios.post(`${API_BASE_URL}/kits/delete-multiple`, {
        ids: selectedAvailableKits,
      });
      setKits(kits.filter((kit) => !selectedAvailableKits.includes(kit._id)));
      setTotalAvailable((prev) => prev - selectedAvailableKits.length);
      setSelectedAvailableKits([]);
    } catch (error) {
      console.error("Error deleting selected kits:", error);
    }
  };

  const makeAvailableSelectedKits = async () => {
    try {
      await axios.post(`${API_BASE_URL}/kits/make-available`, {
        ids: selectedSoldKits,
      });
      const allKitsResponse = await axios.get(`${API_BASE_URL}/kits`);
      setKits(allKitsResponse.data);
      setTotalAvailable(
        allKitsResponse.data.filter((kit) => kit.status === "available").length
      );
      setTotalSold(
        allKitsResponse.data.filter((kit) => kit.status === "sold").length
      );
      setSelectedSoldKits([]);
    } catch (error) {
      console.error("Error making selected kits available:", error);
    }
  };

  const toggleSelectKit = (id, status) => {
    if (status === "available") {
      setSelectedAvailableKits((prev) =>
        prev.includes(id) ? prev.filter((kitId) => kitId !== id) : [...prev, id]
      );
    } else if (status === "sold") {
      setSelectedSoldKits((prev) =>
        prev.includes(id) ? prev.filter((kitId) => kitId !== id) : [...prev, id]
      );
    }
  };

  const uploadCSV = async () => {
    if (!file) {
      alert("Please choose a file first!");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      await axios.post(`${API_BASE_URL}/kits/upload`, formData);
      alert("CSV uploaded successfully");
      setShowUploadModal(false);
      setFile(null);
      window.location.reload();
    } catch (error) {
      console.error("Error uploading CSV:", error);
      alert("Failed to upload CSV");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    router.push("/");
  };

  const splitKitsForDisplay = (kits) => {
    const displayKits = [];
    kits.forEach((kit) => {
      if (kit.status === "sold" && kit.serialNumbers.includes("&")) {
        const serials = kit.serialNumbers.replace(/ & /g, "&").split("&");
        const batches = kit.batchNumbers.replace(/ & /g, "&").split("&");
        for (let i = 0; i < serials.length; i += 2) {
          const newKit = {
            ...kit,
            serialNumbers: serials.slice(i, i + 2).join(" & ") || serials[i] || "N/A",
            batchNumbers: batches[Math.floor(i / 2)] || "N/A"
          };
          displayKits.push(newKit);
        }
      } else {
        displayKits.push(kit);
      }
    });
    return displayKits;
  };

  return (
    <div className="flex min-h-screen">
      <div className="fixed top-0 left-0 w-64 h-screen bg-gray-800 text-white flex flex-col">
        <div className="p-4 text-xl font-bold">Curapod</div>
        <div className="flex flex-col space-y-2 p-4">
          <button
            className={`text-left p-2 rounded ${
              activeSection === "device-manager" ? "bg-gray-700" : ""
            } hover:bg-gray-700`}
            onClick={() => setActiveSection("device-manager")}
          >
            Device Manager
          </button>
          <button
            className={`text-left p-2 rounded ${
              activeSection === "cod" ? "bg-gray-700" : ""
            } hover:bg-gray-700`}
            onClick={() => setActiveSection("cod")}
          >
            COD Manager
          </button>
          <button
            className={`text-left p-2 rounded ${
              activeSection === "return-manager" ? "bg-gray-700" : ""
            } hover:bg-gray-700`}
            onClick={() => setActiveSection("return-manager")}
          >
            Return Manager
          </button>
        </div>
        <div className="mt-auto p-4">
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => setShowLogout(!setShowLogout)}
          >
            <User size={24} />
            <span>{username || "Profile"}</span>
          </div>
          <button
            className="w-full mt-2 p-2 bg-red-600 text-white rounded flex items-center justify-center"
            onClick={handleLogout}
          >
            <LogOut size={20} className="mr-2" />
            Logout
          </button>
        </div>
      </div>

      <div className="ml-64 flex-1 p-6 bg-gray-100 overflow-y-auto min-h-screen">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">
            {activeSection === "device-manager" ? "Device Manager" : 
             activeSection === "cod" ? "COD Manager" : "Return Manager"}
          </h1>
          {activeSection === "device-manager" && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 rounded bg-blue-600 text-white font-semibold shadow"
            >
              Upload CSV
            </button>
          )}
        </div>

        {activeSection === "device-manager" ? (
          <>
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

            <div className="flex justify-end my-2 space-x-2">
              {selectedAvailableKits.length > 0 && (
                <button
                  onClick={deleteSelectedKits}
                  className="px-4 py-2 bg-red-600 text-white font-semibold rounded shadow"
                >
                  Delete Selected Available
                </button>
              )}
              {selectedSoldKits.length > 0 && (
                <button
                  onClick={makeAvailableSelectedKits}
                  className="px-4 py-2 bg-green-600 text-white font-semibold rounded shadow"
                >
                  Make Available Selected Sold
                </button>
              )}
            </div>

            <div className="overflow-auto max-h-[600px] max-w-[1200px]">
              <table className="w-full border-collapse border border-gray-300 mt-4 bg-white shadow-lg rounded-lg">
                <thead>
                  <tr className="bg-gray-200 text-gray-800">
                    <th className="border p-3">Select</th>
                    <th className="border p-3">Serial Numbers</th>
                    <th className="border p-3">Batch Numbers</th>
                    <th className="border p-3">Status</th>
                    <th className="border p-3">Order ID</th>
                    <th className="border p-3">Invoice URL</th>
                    <th className="border p-3">Invoice ID</th>
                    <th className="border p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {splitKitsForDisplay(kits)
                    .sort((a, b) => {
                      const serialA = typeof a.serialNumbers === "string" ? a.serialNumbers : String(a.serialNumbers || "");
                      const serialB = typeof b.serialNumbers === "string" ? b.serialNumbers : String(b.serialNumbers || "");
                      return serialA.localeCompare(serialB);
                    })
                    .map((kit, index) => (
                      <tr key={index} className="border text-gray-700">
                        <td className="border p-3 text-center">
                          <input
                            type="checkbox"
                            checked={
                              kit.status === "available"
                                ? selectedAvailableKits.includes(kit._id)
                                : selectedSoldKits.includes(kit._id)
                            }
                            onChange={() => toggleSelectKit(kit._id, kit.status)}
                          />
                        </td>
                        <td className="border p-3 text-center">
                          {kit.serialNumbers || "N/A"}
                        </td>
                        <td className="border p-3 text-center">
                          {kit.batchNumbers || "N/A"}
                        </td>
                        <td className="border p-3 text-center">{kit.status}</td>
                        <td className="border p-3 text-center">{kit.orderId || "N/A"}</td>
                        <td className="border p-3 text-center">
                          {kit.invoiceUrl ? (
                            <a
                              href={kit.invoiceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600"
                            >
                              View
                            </a>
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td className="border p-3 text-center">{kit.invoiceId || "N/A"}</td>
                        <td className="border p-3 text-center">
                          {kit.status === "available" && (
                            <button
                              onClick={() => deleteKit(kit._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash size={20} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        ) : activeSection === "cod" ? (
          <>
            <div className="flex justify-around mt-6">
              <div className="p-6 mr-2 bg-blue-500 text-white rounded-lg shadow-lg text-center w-1/3">
                <h3 className="text-lg font-bold">Total COD Orders</h3>
                <p className="text-3xl font-semibold">{totalCOD}</p>
              </div>
              <div className="p-6 bg-green-500 text-white rounded-lg shadow-lg text-center w-1/3">
                <h3 className="text-lg font-bold">Total Confirmed</h3>
                <p className="text-3xl font-semibold">{totalConfirmed}</p>
              </div>
              <div className="p-6 ml-2 bg-red-500 text-white rounded-lg shadow-lg text-center w-1/3">
                <h3 className="text-lg font-bold">Total Cancelled</h3>
                <p className="text-3xl font-semibold">{totalCancelled}</p>
              </div>
            </div>

            <div className="overflow-auto max-h-[600px] max-w-[1200px] mt-6">
              <table className="w-full border-collapse border border-gray-300 mt-4 bg-white shadow-lg rounded-lg">
                <thead>
                  <tr className="bg-gray-200 text-gray-800">
                    <th className="border p-3">Order No</th>
                    <th className="border p-3">Customer Name</th>
                    <th className="border p-3">Customer Email</th>
                    <th className="border p-3">Customer Phone</th>
                    <th className="border p-3">Invoice ID</th>
                    <th className="border p-3">Status</th>
                    <th className="border p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {codOrders.map((order) => (
                    <tr key={order._id} className="border text-gray-700">
                      <td className="border p-3 text-center">{order.orderNo}</td>
                      <td className="border p-3 text-center">{order.customerName}</td>
                      <td className="border p-3 text-center">{order.customerEmail}</td>
                      <td className="border p-3 text-center">{order.customerPhone}</td>
                      <td className="border p-3 text-center">{order.invoiceId}</td>
                      <td className="border p-3 text-center">{order.status}</td>
                      <td className="border p-3 text-center">
                        {order.status === "Awating Confirmation" && (
                          <>
                            <button
                              className="px-2 py-1 bg-green-500 text-white rounded mr-2"
                              onClick={() => confirmOrder(order._id)}
                            >
                              ✓
                            </button>
                            <button
                              className="px-2 py-1 bg-red-500 text-white rounded"
                              onClick={() => cancelOrder(order._id)}
                            >
                              ✗
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-around mt-6">
              <div className="p-6 mr-2 bg-blue-500 text-white rounded-lg shadow-lg text-center w-1/4">
                <h3 className="text-lg font-bold">Total Returns</h3>
                <p className="text-3xl font-semibold">{totalReturns}</p>
              </div>
              <div className="p-6 bg-yellow-500 text-white rounded-lg shadow-lg text-center w-1/4">
                <h3 className="text-lg font-bold">Awaiting Return</h3>
                <p className="text-3xl font-semibold">{totalAwaitingReturn}</p>
              </div>
              <div className="p-6 ml-2 bg-green-500 text-white rounded-lg shadow-lg text-center w-1/4">
                <h3 className="text-lg font-bold">Return Received</h3>
                <p className="text-3xl font-semibold">{totalReturnReceived}</p>
              </div>
              <div className="p-6 ml-2 bg-purple-500 text-white rounded-lg shadow-lg text-center w-1/4">
                <h3 className="text-lg font-bold">Refund Initiated</h3>
                <p className="text-3xl font-semibold">{totalRefundInitiated}</p>
              </div>
            </div>

            <div className="overflow-auto max-h-[600px] max-w-[1200px] mt-6">
              <table className="w-full border-collapse border border-gray-300 mt-4 bg-white shadow-lg rounded-lg">
                <thead>
                  <tr className="bg-gray-200 text-gray-800">
                    <th className="border p-3">Order ID</th>
                    <th className="border p-3">Customer Name</th>

                    <th className="border p-3">Customer Phone</th>
                    <th className="border p-3">Ticket Type</th>
                    <th className="border p-3">Status</th>
                    <th className="border p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {returnTickets.map((ticket) => (
                    <tr key={ticket._id} className="border text-gray-700">
                      <td className="border p-3 text-center">{ticket.orderId}</td>
                      <td className="border p-3 text-center">{ticket.customerName}</td>

                      <td className="border p-3 text-center">{ticket.customerPhone}</td>
                      <td className="border p-3 text-center">{ticket.ticketType}</td>
                      <td className="border p-3 text-center">{ticket.status}</td>
                      <td className="border p-3 text-center">
                        {ticket.status === "Awaiting Return" && (
                          <button
                            className="px-2 py-1 bg-green-500 text-white rounded mr-2"
                            onClick={() => updateReturnStatus(ticket._id, "return_received")}
                          >
                            Return Received
                          </button>
                        )}
                        {ticket.status === "Return Received" && ticket.ticketType === "Refund" && (
                          <button
                            className="px-2 py-1 bg-purple-500 text-white rounded"
                            onClick={() => updateReturnStatus(ticket._id, "refund_initiated")}
                          >
                            Refund Initiated
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <div className="flex items-center space-x-2 mb-4">
                <File size={24} className="text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Please choose a file
                </h2>
              </div>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="border p-2 w-full rounded mb-4"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                >
                  Close
                </button>
                <button
                  onClick={uploadCSV}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KitManager;
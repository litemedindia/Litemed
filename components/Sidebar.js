
'use client'
import { useRouter } from 'next/router'

const Sidebar = () => {
  const router = useRouter()

  const handleLogout = () => {
    // Add your logout logic here (e.g., clear session or redirect)
    alert('Logged out')
  }

  return (
    <div className="h-full w-64 bg-gray-800 text-white">
      <div className="p-4 text-xl font-semibold">
        <h2>Admin Panel</h2>
      </div>

      <div className="space-y-2 mt-6">
        {/* Device Manager */}
        <button
          onClick={() => router.push('/device-manager')}
          className="w-full text-left px-4 py-2 hover:bg-gray-700 rounded-md"
        >
          Device Manager
        </button>

        {/* COD Manager */}
        <button
          onClick={() => router.push('/cod-manager')}
          className="w-full text-left px-4 py-2 hover:bg-gray-700 rounded-md"
        >
          COD Manager
        </button>
      </div>

      <div className="absolute bottom-0 w-full p-4 text-center border-t border-gray-700">
        <div className="space-y-2">
          <p>User Profile</p>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-white"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar

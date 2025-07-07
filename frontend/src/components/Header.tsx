import { Link } from '@tanstack/react-router'
import { TreePine, Users, Plus, Search } from 'lucide-react'

export default function Header() {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-gray-900">
              <TreePine className="w-6 h-6 text-blue-600" />
              <span>Family Tree</span>
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/tree/$personId"
                params={{ personId: "adda9918-824b-4123-b10b-5b23eb432f4f" }}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <TreePine className="w-4 h-4" />
                <span>Tree</span>
              </Link>

              <Link
                to="/people"
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>People</span>
              </Link>

              <Link
                to="/add"
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </Link>

              <Link
                to="/search"
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Sample Data Loaded</span>
          </div>
        </nav>
      </div>
    </header>
  )
}

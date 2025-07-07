import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, TreePine, Plus, Search } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Family Tree Explorer
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover, explore, and manage your family connections with our interactive family tree application.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <TreePine className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle>View Family Tree</CardTitle>
            <CardDescription>
              Explore your family tree with interactive visualization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/tree/$personId" params={{ personId: "adda9918-824b-4123-b10b-5b23eb432f4f" }}>
              <Button className="w-full">
                <TreePine className="w-4 h-4 mr-2" />
                View Tree
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle>Add Person</CardTitle>
            <CardDescription>
              Add new family members to your tree
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/add">
              <Button className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Person
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <CardTitle>Browse People</CardTitle>
            <CardDescription>
              View and manage all family members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/people">
              <Button className="w-full">
                <Users className="w-4 h-4 mr-2" />
                Browse People
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-orange-600" />
            </div>
            <CardTitle>Search</CardTitle>
            <CardDescription>
              Find specific family members quickly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/search">
              <Button className="w-full">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Features
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div>
            <h3 className="font-semibold text-lg mb-2">Interactive Tree</h3>
            <p className="text-gray-600">
              Click on nodes to expand and explore family branches with our interactive family tree visualization.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Rich Profiles</h3>
            <p className="text-gray-600">
              Store detailed information including photos, birth/death dates, and personal notes for each family member.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Family Relationships</h3>
            <p className="text-gray-600">
              Manage complex family relationships including multiple spouses, children, and extended family connections.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { api, type Person } from '@/lib/api'
import { Loader2, Users, Search, User, Edit, Eye } from 'lucide-react'

export const Route = createFileRoute('/people')({
  component: PeoplePage,
})

function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [genderFilter, setGenderFilter] = useState('all')

  useEffect(() => {
    loadPeople()
  }, [])

  const loadPeople = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getPersons()
      setPeople(data.results)
    } catch (err) {
      setError('Failed to load people')
      console.error('Error loading people:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredPeople = people.filter(person => {
    const matchesSearch = person.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGender = genderFilter === 'all' || person.gender === genderFilter
    return matchesSearch && matchesGender
  })

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'M': return 'Male'
      case 'F': return 'Female'
      case 'O': return 'Other'
      default: return 'Unknown'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading people...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button onClick={loadPeople} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Family Members
        </h1>
        <p className="text-gray-600">
          Browse and manage all family members in your tree.
        </p>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Search & Filter</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search by name</label>
              <Input
                placeholder="Search people..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by gender</label>
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All genders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All genders</SelectItem>
                  <SelectItem value="M">Male</SelectItem>
                  <SelectItem value="F">Female</SelectItem>
                  <SelectItem value="O">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {filteredPeople.length} {filteredPeople.length === 1 ? 'person' : 'people'} found
          </h2>
          <Link to="/add">
            <Button>
              <User className="w-4 h-4 mr-2" />
              Add Person
            </Button>
          </Link>
        </div>
      </div>

      {filteredPeople.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No people found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || genderFilter
                ? 'Try adjusting your search or filter criteria.'
                : 'No family members have been added yet.'
              }
            </p>
            <Link to="/add">
              <Button>
                <User className="w-4 h-4 mr-2" />
                Add First Person
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPeople.map((person) => (
            <Card key={person.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  {person.profile_photo ? (
                    <img
                      src={person.profile_photo}
                      alt={person.full_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-lg">{person.full_name}</CardTitle>
                    <p className="text-sm text-gray-600">
                      {getGenderLabel(person.gender)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  {person.date_of_birth && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Birth:</span> {new Date(person.date_of_birth).toLocaleDateString()}
                    </p>
                  )}
                  {person.date_of_death && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Death:</span> {new Date(person.date_of_death).toLocaleDateString()}
                    </p>
                  )}
                  {person.age !== undefined && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Age:</span> {person.age} years
                    </p>
                  )}
                  {person.notes && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {person.notes}
                    </p>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Link to="/person/$personId" params={{ personId: person.id }} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </Link>
                  <Link to="/edit/$personId" params={{ personId: person.id }} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
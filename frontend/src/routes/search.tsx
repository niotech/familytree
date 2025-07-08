import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api, type Person } from '@/lib/api'
import { Loader2, Search, User, Eye, Edit } from 'lucide-react'

export const Route = createFileRoute('/search')({
  component: SearchPage,
})

function SearchPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<Person[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    try {
      setLoading(true)
      const data = await api.getPersons({ name: searchTerm })
      setResults(data.results)
      setHasSearched(true)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch()
    }
  }

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'M': return 'Male'
      case 'F': return 'Female'
      case 'O': return 'Other'
      default: return 'Unknown'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Search Family Members
          </h1>
          <p className="text-gray-600">
            Find family members by searching their names.
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Search</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter person's name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
              <Button onClick={handleSearch} disabled={loading || !searchTerm.trim()}>
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {hasSearched && (
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {loading ? 'Searching...' : `${results.length} result${results.length === 1 ? '' : 's'} found`}
            </h2>

            {!loading && results.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600 mb-4">
                    No family members found matching "{searchTerm}". Try a different search term.
                  </p>
                  <Link to="/add">
                    <Button>
                      <User className="w-4 h-4 mr-2" />
                      Add New Person
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {!loading && results.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((person) => (
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
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => navigate({ to: '/person/$personId', params: { personId: person.id } })}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => navigate({ to: '/edit/$personId', params: { personId: person.id } })}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        {!hasSearched && (
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to="/people">
                  <Button variant="outline" className="w-full justify-start">
                    <User className="w-4 h-4 mr-2" />
                    Browse All People
                  </Button>
                </Link>
                <Link to="/add">
                  <Button variant="outline" className="w-full justify-start">
                    <User className="w-4 h-4 mr-2" />
                    Add New Person
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { api, type PersonDetail } from '@/lib/api'
import { Loader2, User, Users, Heart, Baby, ArrowLeft, Edit, TreePine } from 'lucide-react'

export const Route = createFileRoute('/person/$personId')({
  component: PersonDetailPage,
})

function PersonDetailPage() {
  const navigate = useNavigate()
  const { personId } = Route.useParams()
  const [person, setPerson] = useState<PersonDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPersonData()
  }, [personId])

  const loadPersonData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getPersonDetail(personId)
      setPerson(data)
    } catch (err) {
      setError('Failed to load person details')
      console.error('Error loading person data:', err)
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading person details...</span>
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
            <Button onClick={loadPersonData} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!person) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Person Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The requested person could not be found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/people"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to People
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {person.full_name}
              </h1>
              <p className="text-gray-600">
                {getGenderLabel(person.gender)} • {person.is_alive ? 'Living' : 'Deceased'}
                {person.age !== undefined && ` • ${person.age} years old`}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => navigate({ to: '/tree/$personId', params: { personId: person.id } })}
              >
                <TreePine className="w-4 h-4 mr-2" />
                View Tree
              </Button>
              <Button
                onClick={() => navigate({ to: '/edit/$personId', params: { personId: person.id } })}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  {person.profile_photo && (
                    <img
                      src={person.profile_photo}
                      alt={person.full_name}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium">Full Name:</span>
                        <p>{person.full_name}</p>
                      </div>
                      <div>
                        <span className="font-medium">Gender:</span>
                        <p>{getGenderLabel(person.gender)}</p>
                      </div>
                      {person.date_of_birth && (
                        <div>
                          <span className="font-medium">Date of Birth:</span>
                          <p>{new Date(person.date_of_birth).toLocaleDateString()}</p>
                        </div>
                      )}
                      {person.date_of_death && (
                        <div>
                          <span className="font-medium">Date of Death:</span>
                          <p>{new Date(person.date_of_death).toLocaleDateString()}</p>
                        </div>
                      )}
                      {person.age !== undefined && (
                        <div>
                          <span className="font-medium">Age:</span>
                          <p>{person.age} years</p>
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Status:</span>
                        <p>{person.is_alive ? 'Living' : 'Deceased'}</p>
                      </div>
                    </div>
                    {person.notes && (
                      <div>
                        <span className="font-medium">Notes:</span>
                        <p className="mt-1 text-gray-700">{person.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Family Relationships */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Spouses */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="w-5 h-5" />
                    <span>Spouses ({person.spouses.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {person.spouses.length === 0 ? (
                    <p className="text-gray-500">No spouses recorded</p>
                  ) : (
                    <div className="space-y-3">
                      {person.spouses.map((spouse) => (
                        <div key={spouse.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                          {spouse.profile_photo ? (
                            <img
                              src={spouse.profile_photo}
                              alt={spouse.full_name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-500" />
                            </div>
                          )}
                          <div className="flex-1">
                            <button
                              onClick={() => navigate({ to: '/person/$personId', params: { personId: spouse.id } })}
                              className="font-medium hover:underline text-left bg-transparent border-none cursor-pointer"
                            >
                              {spouse.full_name}
                            </button>
                            <p className="text-sm text-gray-600">
                              {spouse.marriage_date && `Married: ${new Date(spouse.marriage_date).toLocaleDateString()}`}
                              {spouse.divorce_date && ` (Divorced: ${new Date(spouse.divorce_date).toLocaleDateString()})`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Children */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Baby className="w-5 h-5" />
                    <span>Children ({person.children.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {person.children.length === 0 ? (
                    <p className="text-gray-500">No children recorded</p>
                  ) : (
                    <div className="space-y-3">
                      {person.children.map((child) => (
                        <div key={child.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                          {child.profile_photo ? (
                            <img
                              src={child.profile_photo}
                              alt={child.full_name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-500" />
                            </div>
                          )}
                          <div className="flex-1">
                            <button
                              onClick={() => navigate({ to: '/person/$personId', params: { personId: child.id } })}
                              className="font-medium hover:underline text-left bg-transparent border-none cursor-pointer"
                            >
                              {child.full_name}
                            </button>
                            <p className="text-sm text-gray-600">
                              {getGenderLabel(child.gender)}
                              {child.age !== undefined && ` • ${child.age} years old`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Parents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Parents ({person.parents.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {person.parents.length === 0 ? (
                  <p className="text-gray-500">No parents recorded</p>
                ) : (
                  <div className="space-y-3">
                    {person.parents.map((parent) => (
                      <div key={parent.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        {parent.profile_photo ? (
                          <img
                            src={parent.profile_photo}
                            alt={parent.full_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-500" />
                          </div>
                        )}
                        <div className="flex-1">
                          <button
                            onClick={() => navigate({ to: '/person/$personId', params: { personId: parent.id } })}
                            className="font-medium hover:underline text-left bg-transparent border-none cursor-pointer"
                          >
                            {parent.full_name}
                          </button>
                          <p className="text-sm text-gray-600">
                            {getGenderLabel(parent.gender)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate({ to: '/tree/$personId', params: { personId: person.id } })}
                >
                  <TreePine className="w-4 h-4 mr-2" />
                  View Family Tree
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate({ to: '/edit/$personId', params: { personId: person.id } })}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Person
                </Button>
                <Link to="/add" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <User className="w-4 h-4 mr-2" />
                    Add Family Member
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
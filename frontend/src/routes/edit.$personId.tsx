import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { api, type Person } from '@/lib/api'
import { Loader2, User, ArrowLeft, Save } from 'lucide-react'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/edit/$personId')({
  component: EditPersonPage,
})

function EditPersonPage() {
  const { personId } = Route.useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [person, setPerson] = useState<Person | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    gender: '',
    date_of_birth: '',
    date_of_death: '',
    notes: '',
  })
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null)

  useEffect(() => {
    loadPersonData()
  }, [personId])

  const loadPersonData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getPerson(personId)
      setPerson(data)
      setFormData({
        full_name: data.full_name,
        gender: data.gender,
        date_of_birth: data.date_of_birth || '',
        date_of_death: data.date_of_death || '',
        notes: data.notes || '',
      })
      setCurrentPhoto(data.profile_photo || null)
    } catch (err) {
      setError('Failed to load person data')
      console.error('Error loading person data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setProfilePhoto(file)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!formData.full_name.trim()) {
      alert('Full name is required')
      return
    }

    try {
      setSaving(true)

      const data = new FormData()
      data.append('full_name', formData.full_name)
      data.append('gender', formData.gender)
      if (formData.date_of_birth) {
        data.append('date_of_birth', formData.date_of_birth)
      }
      if (formData.date_of_death) {
        data.append('date_of_death', formData.date_of_death)
      }
      if (formData.notes) {
        data.append('notes', formData.notes)
      }
      if (profilePhoto) {
        data.append('profile_photo', profilePhoto)
      }

      await api.updatePerson(personId, data)

      // Navigate to the person's detail page
      navigate({ to: `/person/${personId}` })
    } catch (error) {
      console.error('Error updating person:', error)
      alert('Failed to update person. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading person data...</span>
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
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            to="/person/$personId"
            params={{ personId }}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Person Details
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Edit Person: {person.full_name}
          </h1>
          <p className="text-gray-600">
            Update the information for this family member.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Edit Person Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Male</SelectItem>
                      <SelectItem value="F">Female</SelectItem>
                      <SelectItem value="O">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_of_death">Date of Death</Label>
                  <Input
                    id="date_of_death"
                    type="date"
                    value={formData.date_of_death}
                    onChange={(e) => handleInputChange('date_of_death', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile_photo">Profile Photo</Label>
                <div className="space-y-4">
                  {currentPhoto && (
                    <div className="flex items-center space-x-4">
                      <img
                        src={currentPhoto}
                        alt="Current profile photo"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <span className="text-sm text-gray-600">Current photo</span>
                    </div>
                  )}
                  <Input
                    id="profile_photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                  <p className="text-sm text-gray-500">
                    {currentPhoto ? 'Upload a new photo to replace the current one' : 'Upload a profile photo (optional)'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes / Biography</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Enter any additional notes or biography..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Link to="/person/$personId" params={{ personId }}>
                  <Button variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
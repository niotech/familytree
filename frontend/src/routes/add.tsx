import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/lib/api'
import { Loader2, UserPlus, ArrowLeft } from 'lucide-react'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/add')({
  component: AddPersonPage,
})

function AddPersonPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    gender: '',
    date_of_birth: '',
    date_of_death: '',
    notes: '',
  })
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)

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
      setLoading(true)

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

      const newPerson = await api.createPerson(data)

      // Navigate to the person's detail page
      navigate({ to: `/person/${newPerson.id}` })
    } catch (error) {
      console.error('Error creating person:', error)
      alert('Failed to create person. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Add New Person
          </h1>
          <p className="text-gray-600">
            Add a new family member to your family tree.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserPlus className="w-5 h-5" />
              <span>Person Information</span>
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
                <Input
                  id="profile_photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
                <p className="text-sm text-gray-500">
                  Upload a profile photo (optional)
                </p>
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
                <Link to="/">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Add Person
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
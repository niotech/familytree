import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { api, type Person, type FamilyTreePerson } from '@/lib/api'
import { Loader2, User, Users } from 'lucide-react'

// Import family-chart CSS
import 'family-chart/styles/family-chart.css'

export const Route = createFileRoute('/tree/$personId')({
  component: FamilyTreePage,
})

function FamilyTreePage() {
  const { personId } = Route.useParams()
  const [person, setPerson] = useState<FamilyTreePerson | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstanceRef = useRef<any>(null)

  useEffect(() => {
    loadPersonData()
  }, [personId])

  const loadPersonData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getPersonFamilyTree(personId)
      setPerson(data)
    } catch (err) {
      setError('Failed to load family tree data')
      console.error('Error loading person data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (person && chartRef.current) {
      // Initialize family-chart using dynamic import
      import('family-chart').then((familyChart) => {
        console.log('Family chart module:', familyChart);
        console.log('Available exports:', Object.keys(familyChart));

        // Convert our data structure to family-chart format
        const chartData = convertToChartData(person)
        console.log('Chart data:', chartData);

        // Clean up existing chart instance
        if (chartInstanceRef.current) {
          try {
            if (typeof chartInstanceRef.current.destroy === 'function') {
              chartInstanceRef.current.destroy()
            } else if (typeof chartInstanceRef.current.dispose === 'function') {
              chartInstanceRef.current.dispose()
            } else if (typeof chartInstanceRef.current.remove === 'function') {
              chartInstanceRef.current.remove()
            }
          } catch (err) {
            console.warn('Error cleaning up chart instance:', err)
          }
          chartInstanceRef.current = null
        }

        // Try using the default export (f3)
        const f3 = familyChart.default || familyChart;
        if (chartRef.current && f3 && f3.createChart) {
          try {
            chartInstanceRef.current = f3.createChart(chartRef.current, {
              data: chartData,
              nodeBinding: {
                field_0: "name",
                field_1: "birth",
                img_0: "img"
              },
              nodeMenu: {
                details: { text: "Details" },
                edit: { text: "Edit" },
                add: { text: "Add" }
              },
              nodeContextMenu: {
                details: { text: "Details" },
                edit: { text: "Edit" },
                add: { text: "Add" }
              },
              nodeMenuBinding: {
                field_0: "name",
                field_1: "birth",
                img_0: "img"
              },
              onNodeClick: (node: any) => {
                // Find the person data from our API response
                const personData = findPersonById(node.id, person!)
                if (personData) {
                  setSelectedPerson(personData)
                }
              }
            })
          } catch (err) {
            console.error('Error creating chart:', err)
            setError('Failed to create family tree visualization')
          }
        } else {
          console.error('f3 or createChart not found in familyChart module');
          setError('Family tree visualization library not available')
        }
      }).catch((err) => {
        console.error('Failed to load family-chart:', err)
        setError('Failed to load family tree visualization')
      })
    }

    return () => {
      // Cleanup function
      if (chartInstanceRef.current) {
        try {
          if (typeof chartInstanceRef.current.destroy === 'function') {
            chartInstanceRef.current.destroy()
          } else if (typeof chartInstanceRef.current.dispose === 'function') {
            chartInstanceRef.current.dispose()
          } else if (typeof chartInstanceRef.current.remove === 'function') {
            chartInstanceRef.current.remove()
          }
        } catch (err) {
          console.warn('Error during chart cleanup:', err)
        }
        chartInstanceRef.current = null
      }
    }
  }, [person])

  const convertToChartData = (rootPerson: FamilyTreePerson) => {
    const nodes: any[] = [];
    const marriageMap = new Map<string, number>(); // Map spouseId to marriageId
    let marriageIdCounter = 1000;

    // Add root person
    nodes.push({
      id: rootPerson.id,
      name: rootPerson.full_name,
      gender: rootPerson.gender,
      img: rootPerson.profile_photo || '',
      birth: rootPerson.date_of_birth ? new Date(rootPerson.date_of_birth).getFullYear().toString() : '',
    });

    // Add spouses and assign marriage IDs
    rootPerson.spouses.forEach(spouse => {
      const marriageId = marriageIdCounter++;
      marriageMap.set(spouse.id, marriageId);

      nodes.push({
        id: spouse.id,
        name: spouse.full_name,
        gender: spouse.gender,
        img: spouse.profile_photo || '',
        birth: spouse.date_of_birth ? new Date(spouse.date_of_birth).getFullYear().toString() : '',
        mid: marriageId,
      });

      // Add children from this spouse
      spouse.children.forEach(child => {
        if (!nodes.find(n => n.id === child.id)) {
          nodes.push({
            id: child.id,
            name: child.full_name,
            gender: child.gender,
            img: child.profile_photo || '',
            birth: child.date_of_birth ? new Date(child.date_of_birth).getFullYear().toString() : '',
            pids: [rootPerson.id, spouse.id],
          });
        }
      });
    });

    // Add other children (not from spouses)
    rootPerson.children.forEach(child => {
      if (!nodes.find(n => n.id === child.id)) {
        nodes.push({
          id: child.id,
          name: child.full_name,
          gender: child.gender,
          img: child.profile_photo || '',
          birth: child.date_of_birth ? new Date(child.date_of_birth).getFullYear().toString() : '',
          pids: [rootPerson.id],
        });
      }
    });

    return nodes;
  }

  const findPersonById = (id: string, rootPerson: FamilyTreePerson): Person | null => {
    if (rootPerson.id === id) return rootPerson

    for (const spouse of rootPerson.spouses) {
      if (spouse.id === id) return spouse
      for (const child of spouse.children) {
        if (child.id === id) return child
      }
    }

    for (const child of rootPerson.children) {
      if (child.id === id) return child
    }

    return null
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading family tree...</span>
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Family Tree: {person.full_name}
        </h1>
        <p className="text-gray-600">
          Click on any person to view their details. The tree shows patrilineal descendants by default.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Family Tree Visualization</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={chartRef}
            className="w-full h-[600px] border rounded-lg"
            style={{ minHeight: '600px' }}
          />
        </CardContent>
      </Card>

      {/* Person Details Dialog */}
      <Dialog open={!!selectedPerson} onOpenChange={() => setSelectedPerson(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>{selectedPerson?.full_name}</span>
            </DialogTitle>
          </DialogHeader>

          {selectedPerson && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {selectedPerson.profile_photo && (
                  <img
                    src={selectedPerson.profile_photo}
                    alt={selectedPerson.full_name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div>
                  <h3 className="font-semibold">{selectedPerson.full_name}</h3>
                  <p className="text-sm text-gray-600">
                    {selectedPerson.gender === 'M' ? 'Male' : selectedPerson.gender === 'F' ? 'Female' : 'Other'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {selectedPerson.date_of_birth && (
                  <div>
                    <span className="font-medium">Birth:</span> {new Date(selectedPerson.date_of_birth).toLocaleDateString()}
                  </div>
                )}
                {selectedPerson.date_of_death && (
                  <div>
                    <span className="font-medium">Death:</span> {new Date(selectedPerson.date_of_death).toLocaleDateString()}
                  </div>
                )}
                {selectedPerson.age !== undefined && (
                  <div>
                    <span className="font-medium">Age:</span> {selectedPerson.age} years
                  </div>
                )}
                {selectedPerson.notes && (
                  <div>
                    <span className="font-medium">Notes:</span>
                    <p className="text-sm text-gray-600 mt-1">{selectedPerson.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { api, type Person, type FamilyTreePerson } from '@/lib/api'
import { Loader2, User, Users } from 'lucide-react'
import f3 from 'family-chart'

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
      console.log('Family chart module:', f3);
      console.log('Available exports:', Object.keys(f3));

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

      // Use the exact same approach as the example
      if (chartRef.current && f3) {
        try {
          const store = (f3 as any).createStore({
            data: chartData,
            node_separation: 250,
            level_separation: 150
          })

          const svg = (f3 as any).createSvg(document.querySelector("#FamilyChart"))

          const Card = (f3 as any).elements.Card({
            store,
            svg,
            card_dim: {w:220,h:70,text_x:75,text_y:15,img_w:60,img_h:60,img_x:5,img_y:5},
            card_display: [
              (i: any) => `${i.data["first name"] || ""} ${i.data["last name"] || ""}`,
              (i: any) => `${i.data.birthday || ""}`
            ],
            mini_tree: true,
            link_break: false
          })

          store.setOnUpdate((props: any) => (f3 as any).view(store.getTree(), svg, Card, props || {}))
          store.updateTree({initial: true})

          // Store reference for cleanup
          chartInstanceRef.current = { store, svg, Card }

        } catch (err) {
          console.error('Error creating chart:', err)
          setError('Failed to create family tree visualization')
        }
      } else {
        console.error('f3 not found in familyChart module');
        setError('Family tree visualization library not available')
      }
    }

    return () => {
      // Cleanup function
      if (chartInstanceRef.current) {
        try {
          if (chartInstanceRef.current.store) {
            // Clean up store if needed
            chartInstanceRef.current.store = null
          }
          if (chartInstanceRef.current.svg) {
            // Clean up SVG if needed
            chartInstanceRef.current.svg = null
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
    const processedIds = new Set<string>();

    // Helper function to add a person to the nodes array
    const addPerson = (person: any, rels: any) => {
      if (processedIds.has(person.id)) return;
      processedIds.add(person.id);

      nodes.push({
        id: person.id,
        data: {
          "first name": person.full_name.split(' ')[0] || '',
          "last name": person.full_name.split(' ').slice(1).join(' ') || '',
          "birthday": person.date_of_birth ? new Date(person.date_of_birth).getFullYear().toString() : '',
          "avatar": person.profile_photo || '',
          "gender": person.gender
        },
        rels: rels
      });
    };

    // Add root person
    const rootRels: any = {
      spouses: rootPerson.spouses.map(s => s.id),
      children: rootPerson.children.map(c => c.id)
    };
    addPerson(rootPerson, rootRels);

    // Add spouses
    rootPerson.spouses.forEach(spouse => {
      const spouseRels: any = {
        spouses: [rootPerson.id],
        children: spouse.children.map(c => c.id)
      };
      addPerson(spouse, spouseRels);

      // Add children from this spouse
      spouse.children.forEach(child => {
        const childRels: any = {
          father: rootPerson.id,
          mother: spouse.id
        };
        addPerson(child, childRels);
      });
    });

    // Add other children (not from spouses)
    rootPerson.children.forEach(child => {
      if (!processedIds.has(child.id)) {
        const childRels: any = {
          father: rootPerson.id
        };
        addPerson(child, childRels);
      }
    });

    return nodes;
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
            id="FamilyChart"
            className="f3 w-full h-[600px] border rounded-lg"
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
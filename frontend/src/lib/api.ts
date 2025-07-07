const API_BASE_URL = 'http://localhost:8000/api';

export interface Person {
  id: string;
  full_name: string;
  gender: 'M' | 'F' | 'O';
  date_of_birth?: string;
  date_of_death?: string;
  profile_photo?: string;
  notes?: string;
  age?: number;
  is_alive?: boolean;
  created_at: string;
  updated_at: string;
}

export interface PersonDetail extends Person {
  spouses: Spouse[];
  parents: Person[];
  children: Person[];
}

export interface Spouse extends Person {
  marriage_date?: string;
  divorce_date?: string;
  active_marriage_status: boolean;
  children: Person[];
}

export interface FamilyTreePerson extends Person {
  spouses: Spouse[];
  children: Person[];
}

export interface FamilyRelationship {
  id: string;
  relationship_type: 'spouse' | 'parent_child';
  person1: string;
  person2: string;
  person1_name: string;
  person2_name: string;
  marriage_date?: string;
  divorce_date?: string;
  active_marriage_status: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Person endpoints
  async getPersons(params?: { name?: string; gender?: string }): Promise<PaginatedResponse<Person>> {
    const searchParams = new URLSearchParams();
    if (params?.name) searchParams.append('name', params.name);
    if (params?.gender) searchParams.append('gender', params.gender);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<PaginatedResponse<Person>>(`/persons/${query}`);
  }

  async getPerson(id: string): Promise<Person> {
    return this.request<Person>(`/persons/${id}/`);
  }

  async getPersonDetail(id: string): Promise<PersonDetail> {
    return this.request<PersonDetail>(`/persons/${id}/`);
  }

  async getPersonFamilyTree(id: string): Promise<FamilyTreePerson> {
    return this.request<FamilyTreePerson>(`/persons/${id}/family_tree/`);
  }

  async createPerson(data: FormData): Promise<Person> {
    return this.request<Person>('/persons/', {
      method: 'POST',
      body: data,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  async updatePerson(id: string, data: FormData): Promise<Person> {
    return this.request<Person>(`/persons/${id}/`, {
      method: 'PUT',
      body: data,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  async deletePerson(id: string): Promise<void> {
    return this.request<void>(`/persons/${id}/`, {
      method: 'DELETE',
    });
  }

  // Relationship endpoints
  async getRelationships(params?: { type?: string; person?: string }): Promise<FamilyRelationship[]> {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.append('type', params.type);
    if (params?.person) searchParams.append('person', params.person);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<FamilyRelationship[]>(`/relationships/${query}`);
  }

  async createSpouseRelationship(data: {
    person1: string;
    person2: string;
    marriage_date?: string;
  }): Promise<FamilyRelationship> {
    return this.request<FamilyRelationship>('/relationships/create_spouse_relationship/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createParentChildRelationship(data: {
    parent: string;
    child: string;
  }): Promise<FamilyRelationship> {
    return this.request<FamilyRelationship>('/relationships/create_parent_child_relationship/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiService();
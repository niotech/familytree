# Family Tree Explorer

A full-stack web application for creating, managing, and visualizing family trees with an interactive interface.

## Features

### Core Functionality
- **Person Management**: Add, edit, and view detailed information about family members
- **Family Relationships**: Manage complex family relationships including spouses, parents, and children
- **Interactive Family Tree**: Visualize family connections using the family-chart library
- **Search & Filter**: Find family members quickly with search and filtering capabilities
- **Profile Photos**: Upload and manage profile photos for each family member
- **Rich Data**: Store birth/death dates, notes, and biographical information

### Technical Features
- **React Frontend**: Modern React with TypeScript and TanStack Router
- **Django Backend**: RESTful API with Django REST Framework
- **Interactive Tree**: Family tree visualization with expandable nodes
- **Responsive Design**: Mobile-friendly interface with shadcn/ui components
- **Real-time Updates**: Dynamic data loading and state management

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **TanStack Router** for routing and navigation
- **shadcn/ui** for UI components and styling
- **Tailwind CSS** for styling
- **family-chart** for tree visualization
- **Lucide React** for icons

### Backend
- **Django 5** with Python
- **Django REST Framework** for API
- **SQLite** database (can be easily changed to PostgreSQL/MySQL)
- **Pillow** for image processing
- **django-cors-headers** for CORS support

## Project Structure

```
familytree/
├── backend/                 # Django backend
│   ├── familytree/         # Django project settings
│   │   ├── family/             # Main Django app
│   │   │   ├── models.py       # Person and FamilyRelationship models
│   │   │   ├── serializers.py  # DRF serializers
│   │   │   ├── views.py        # API views
│   │   │   ├── admin.py        # Django admin configuration
│   │   │   └── management/     # Custom management commands
│   │   └── manage.py
│   ├── frontend/               # React frontend
│   │   ├── src/
│   │   │   ├── routes/         # TanStack Router routes
│   │   │   ├── components/     # React components
│   │   │   │   └── ui/         # shadcn/ui components
│   │   │   └── lib/            # Utilities and API service
│   │   └── package.json
│   └── README.md
```

## Getting Started

### Prerequisites
- Python 3.12+
- Node.js 18+
- pnpm (recommended) or npm

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install Python dependencies**:
   ```bash
   pip install poetry
   poetry install
   ```

3. **Run Django migrations**:
   ```bash
   python manage.py migrate
   ```

4. **Seed the database with sample data**:
   ```bash
   python manage.py seed_family_data
   ```

5. **Start the Django development server**:
   ```bash
   python manage.py runserver
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Start the development server**:
   ```bash
   pnpm dev
   ```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### Persons
- `GET /api/persons/` - List all persons
- `GET /api/persons/{id}/` - Get person details
- `GET /api/persons/{id}/detail/` - Get person with family relationships
- `GET /api/persons/{id}/family_tree/` - Get family tree data
- `POST /api/persons/` - Create new person
- `PUT /api/persons/{id}/` - Update person
- `DELETE /api/persons/{id}/` - Delete person

### Relationships
- `GET /api/relationships/` - List all relationships
- `POST /api/relationships/create_spouse_relationship/` - Create spouse relationship
- `POST /api/relationships/create_parent_child_relationship/` - Create parent-child relationship

## Usage

### Adding Family Members
1. Navigate to the "Add Person" page
2. Fill in the person's information (name, gender, dates, etc.)
3. Optionally upload a profile photo
4. Save the person

### Viewing the Family Tree
1. Click "View Family Tree" from the home page or any person's detail page
2. The tree shows the selected person as the root
3. Click on any node to expand and see spouses and children
4. Click on a person's node to view their details in a modal

### Managing Relationships
- **Spouse Relationships**: Use the relationship API endpoints to connect spouses
- **Parent-Child Relationships**: Connect parents and children through the API
- **Multiple Spouses**: The system supports multiple marriages and relationships

### Searching and Filtering
- Use the search page to find family members by name
- Filter people by gender on the people listing page
- Browse all family members with detailed information

## Sample Data

The application comes with sample family data including:
- 4 generations of family members
- Multiple spouses and children
- Various birth/death dates and biographical information

Sample person IDs for testing:
- Root person (father): `adda9918-824b-4123-b10b-5b23eb432f4f`
- Child 1: `e082eb51-982e-4912-9abd-ccadcde9771d`
- Child 2: `9b669ab3-4181-4cc5-b0e0-a73f26f56e8b`

## Development

### Adding New Features
1. **Backend**: Add models, serializers, and views in the Django app
2. **Frontend**: Create new routes and components as needed
3. **API Integration**: Update the API service in `frontend/src/lib/api.ts`

### Styling
- Use shadcn/ui components for consistent styling
- Follow Tailwind CSS conventions
- Maintain responsive design principles

### Database Changes
1. Create new migrations: `python manage.py makemigrations`
2. Apply migrations: `python manage.py migrate`
3. Update serializers and views as needed

## Deployment

### Backend Deployment
- Use a production database (PostgreSQL recommended)
- Set up proper environment variables
- Configure static and media file serving
- Use a production WSGI server (Gunicorn)

### Frontend Deployment
- Build the production version: `pnpm build`
- Serve static files from a web server
- Configure API endpoint URLs for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For questions or issues, please open an issue on the GitHub repository.

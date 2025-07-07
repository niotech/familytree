from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Person, FamilyRelationship
from .serializers import (
    PersonSerializer, PersonListSerializer, PersonDetailSerializer,
    FamilyRelationshipSerializer, FamilyTreeSerializer
)


class PersonViewSet(viewsets.ModelViewSet):
    """ViewSet for Person model with CRUD operations."""

    queryset = Person.objects.all()
    parser_classes = (MultiPartParser, FormParser)

    def get_serializer_class(self):
        """Return appropriate serializer class based on action."""
        if self.action == 'list':
            return PersonListSerializer
        elif self.action == 'retrieve':
            return PersonDetailSerializer
        elif self.action == 'family_tree':
            return FamilyTreeSerializer
        return PersonSerializer

    def get_queryset(self):
        """Filter queryset based on query parameters."""
        queryset = Person.objects.all()

        # Filter by name
        name = self.request.query_params.get('name', None)
        if name:
            queryset = queryset.filter(full_name__icontains=name)

        # Filter by gender
        gender = self.request.query_params.get('gender', None)
        if gender:
            queryset = queryset.filter(gender=gender)

        return queryset

    def retrieve(self, request, *args, **kwargs):
        person = self.get_object()
        serializer = self.get_serializer(person)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def family_tree(self, request, pk=None):
        """Get family tree data for a specific person."""
        person = self.get_object()
        serializer = self.get_serializer(person)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def descendants(self, request, pk=None):
        """Get all descendants of a person (patrilineal by default)."""
        person = self.get_object()

        # Get all descendants recursively
        descendants = self._get_descendants(person)

        # Serialize the descendants
        serializer = PersonListSerializer(descendants, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def ancestors(self, request, pk=None):
        """Get all ancestors of a person."""
        person = self.get_object()

        # Get all ancestors recursively
        ancestors = self._get_ancestors(person)

        # Serialize the ancestors
        serializer = PersonListSerializer(ancestors, many=True)
        return Response(serializer.data)

    def _get_descendants(self, person, max_generations=5, current_generation=0):
        """Recursively get all descendants of a person."""
        if current_generation >= max_generations:
            return []

        descendants = []
        children_relationships = FamilyRelationship.objects.filter(
            relationship_type='parent_child',
            person1=person
        )

        for rel in children_relationships:
            child = rel.person2
            descendants.append(child)

            # Recursively get descendants of this child
            child_descendants = self._get_descendants(
                child, max_generations, current_generation + 1
            )
            descendants.extend(child_descendants)

        return descendants

    def _get_ancestors(self, person, max_generations=5, current_generation=0):
        """Recursively get all ancestors of a person."""
        if current_generation >= max_generations:
            return []

        ancestors = []
        parent_relationships = FamilyRelationship.objects.filter(
            relationship_type='parent_child',
            person2=person
        )

        for rel in parent_relationships:
            parent = rel.person1
            ancestors.append(parent)

            # Recursively get ancestors of this parent
            parent_ancestors = self._get_ancestors(
                parent, max_generations, current_generation + 1
            )
            ancestors.extend(parent_ancestors)

        return ancestors


class FamilyRelationshipViewSet(viewsets.ModelViewSet):
    """ViewSet for FamilyRelationship model."""

    queryset = FamilyRelationship.objects.all()
    serializer_class = FamilyRelationshipSerializer

    def get_queryset(self):
        """Filter queryset based on query parameters."""
        queryset = FamilyRelationship.objects.all()

        # Filter by relationship type
        relationship_type = self.request.query_params.get('type', None)
        if relationship_type:
            queryset = queryset.filter(relationship_type=relationship_type)

        # Filter by person
        person_id = self.request.query_params.get('person', None)
        if person_id:
            queryset = queryset.filter(
                Q(person1_id=person_id) | Q(person2_id=person_id)
            )

        return queryset

    @action(detail=False, methods=['post'])
    def create_spouse_relationship(self, request):
        """Create a spouse relationship between two people."""
        person1_id = request.data.get('person1')
        person2_id = request.data.get('person2')
        marriage_date = request.data.get('marriage_date')

        if not person1_id or not person2_id:
            return Response(
                {'error': 'Both person1 and person2 are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            person1 = Person.objects.get(id=person1_id)
            person2 = Person.objects.get(id=person2_id)
        except Person.DoesNotExist:
            return Response(
                {'error': 'One or both persons not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if relationship already exists
        existing_relationship = FamilyRelationship.objects.filter(
            relationship_type='spouse',
            person1=person1,
            person2=person2
        ) | FamilyRelationship.objects.filter(
            relationship_type='spouse',
            person1=person2,
            person2=person1
        )

        if existing_relationship.exists():
            return Response(
                {'error': 'Spouse relationship already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )

        relationship = FamilyRelationship.objects.create(
            relationship_type='spouse',
            person1=person1,
            person2=person2,
            marriage_date=marriage_date
        )

        serializer = self.get_serializer(relationship)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def create_parent_child_relationship(self, request):
        """Create a parent-child relationship."""
        parent_id = request.data.get('parent')
        child_id = request.data.get('child')

        if not parent_id or not child_id:
            return Response(
                {'error': 'Both parent and child are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            parent = Person.objects.get(id=parent_id)
            child = Person.objects.get(id=child_id)
        except Person.DoesNotExist:
            return Response(
                {'error': 'Parent or child not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if relationship already exists
        existing_relationship = FamilyRelationship.objects.filter(
            relationship_type='parent_child',
            person1=parent,
            person2=child
        )

        if existing_relationship.exists():
            return Response(
                {'error': 'Parent-child relationship already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )

        relationship = FamilyRelationship.objects.create(
            relationship_type='parent_child',
            person1=parent,
            person2=child
        )

        serializer = self.get_serializer(relationship)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

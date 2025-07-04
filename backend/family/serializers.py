from rest_framework import serializers
from .models import Person, FamilyRelationship


class PersonSerializer(serializers.ModelSerializer):
    """Serializer for Person model."""

    age = serializers.ReadOnlyField()
    is_alive = serializers.ReadOnlyField()

    class Meta:
        model = Person
        fields = [
            'id', 'full_name', 'gender', 'date_of_birth', 'date_of_death',
            'profile_photo', 'notes', 'age', 'is_alive', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PersonListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing persons."""

    class Meta:
        model = Person
        fields = ['id', 'full_name', 'gender', 'profile_photo']


class FamilyRelationshipSerializer(serializers.ModelSerializer):
    """Serializer for FamilyRelationship model."""

    person1_name = serializers.CharField(source='person1.full_name', read_only=True)
    person2_name = serializers.CharField(source='person2.full_name', read_only=True)
    is_active_marriage = serializers.ReadOnlyField()

    class Meta:
        model = FamilyRelationship
        fields = [
            'id', 'relationship_type', 'person1', 'person2', 'person1_name', 'person2_name',
            'marriage_date', 'divorce_date', 'is_active_marriage', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PersonDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for Person with family relationships."""

    age = serializers.ReadOnlyField()
    is_alive = serializers.ReadOnlyField()

    # Spouse relationships
    spouses = serializers.SerializerMethodField()

    # Parent relationships
    parents = serializers.SerializerMethodField()

    # Children relationships
    children = serializers.SerializerMethodField()

    class Meta:
        model = Person
        fields = [
            'id', 'full_name', 'gender', 'date_of_birth', 'date_of_death',
            'profile_photo', 'notes', 'age', 'is_alive', 'spouses', 'parents', 'children',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_spouses(self, obj):
        """Get all spouse relationships for this person."""
        spouse_relationships = FamilyRelationship.objects.filter(
            relationship_type='spouse',
            person1=obj
        ) | FamilyRelationship.objects.filter(
            relationship_type='spouse',
            person2=obj
        )

        spouses_data = []
        for rel in spouse_relationships:
            spouse = rel.person2 if rel.person1 == obj else rel.person1
            spouses_data.append({
                'id': spouse.id,
                'full_name': spouse.full_name,
                'gender': spouse.gender,
                'profile_photo': spouse.profile_photo.url if spouse.profile_photo else None,
                'marriage_date': rel.marriage_date,
                'divorce_date': rel.divorce_date,
                'is_active_marriage': rel.is_active_marriage,
            })

        return spouses_data

    def get_parents(self, obj):
        """Get parent relationships for this person."""
        parent_relationships = FamilyRelationship.objects.filter(
            relationship_type='parent_child',
            person2=obj  # person2 is the child
        )

        parents_data = []
        for rel in parent_relationships:
            parent = rel.person1  # person1 is the parent
            parents_data.append({
                'id': parent.id,
                'full_name': parent.full_name,
                'gender': parent.gender,
                'profile_photo': parent.profile_photo.url if parent.profile_photo else None,
            })

        return parents_data

    def get_children(self, obj):
        """Get children relationships for this person."""
        children_relationships = FamilyRelationship.objects.filter(
            relationship_type='parent_child',
            person1=obj  # person1 is the parent
        )

        children_data = []
        for rel in children_relationships:
            child = rel.person2  # person2 is the child
            children_data.append({
                'id': child.id,
                'full_name': child.full_name,
                'gender': child.gender,
                'profile_photo': child.profile_photo.url if child.profile_photo else None,
            })

        return children_data


class FamilyTreeSerializer(serializers.ModelSerializer):
    """Serializer for family tree data structure."""

    spouses = serializers.SerializerMethodField()
    children = serializers.SerializerMethodField()

    class Meta:
        model = Person
        fields = ['id', 'full_name', 'gender', 'profile_photo', 'spouses', 'children']

    def get_spouses(self, obj):
        """Get spouse relationships with their children."""
        spouse_relationships = FamilyRelationship.objects.filter(
            relationship_type='spouse',
            person1=obj
        ) | FamilyRelationship.objects.filter(
            relationship_type='spouse',
            person2=obj
        )

        spouses_data = []
        for rel in spouse_relationships:
            spouse = rel.person2 if rel.person1 == obj else rel.person1
            # Get children from this specific spouse
            children = FamilyRelationship.objects.filter(
                relationship_type='parent_child',
                person1=obj,
                person2__in=FamilyRelationship.objects.filter(
                    relationship_type='parent_child',
                    person1=spouse
                ).values_list('person2', flat=True)
            )

            spouses_data.append({
                'id': spouse.id,
                'full_name': spouse.full_name,
                'gender': spouse.gender,
                'profile_photo': spouse.profile_photo.url if spouse.profile_photo else None,
                'marriage_date': rel.marriage_date,
                'divorce_date': rel.divorce_date,
                'is_active_marriage': rel.is_active_marriage,
                'children': PersonListSerializer([rel.person2 for rel in children], many=True).data
            })

        return spouses_data

    def get_children(self, obj):
        """Get all children for this person."""
        children_relationships = FamilyRelationship.objects.filter(
            relationship_type='parent_child',
            person1=obj
        )

        children_data = []
        for rel in children_relationships:
            child = rel.person2
            children_data.append({
                'id': child.id,
                'full_name': child.full_name,
                'gender': child.gender,
                'profile_photo': child.profile_photo.url if child.profile_photo else None,
            })

        return children_data
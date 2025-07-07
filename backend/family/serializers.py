from rest_framework import serializers
from .models import Person, FamilyRelationship


class PersonSerializer(serializers.ModelSerializer):
    """Serializer for Person model."""

    age = serializers.SerializerMethodField()
    is_alive = serializers.SerializerMethodField()

    def get_age(self, obj):
        return obj.age

    def get_is_alive(self, obj):
        return obj.is_alive

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
    active_marriage_status = serializers.SerializerMethodField()

    def get_active_marriage_status(self, obj):
        return obj.active_marriage_status

    class Meta:
        model = FamilyRelationship
        fields = [
            'id', 'relationship_type', 'person1', 'person2', 'person1_name', 'person2_name',
            'marriage_date', 'divorce_date', 'created_at', 'updated_at', 'active_marriage_status'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'active_marriage_status']


class PersonDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for Person with family relationships."""

    age = serializers.SerializerMethodField()
    is_alive = serializers.SerializerMethodField()
    spouses = serializers.SerializerMethodField()
    parents = serializers.SerializerMethodField()
    children = serializers.SerializerMethodField()

    def get_age(self, obj):
        return obj.age

    def get_is_alive(self, obj):
        return obj.is_alive

    def get_spouses(self, obj):
        """Get spouse relationships."""
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
                'date_of_birth': spouse.date_of_birth,
                'date_of_death': spouse.date_of_death,
                'profile_photo': spouse.profile_photo.url if spouse.profile_photo else None,
                'age': spouse.age,
                'is_alive': spouse.is_alive,
                'marriage_date': rel.marriage_date,
                'divorce_date': rel.divorce_date,
                'active_marriage_status': rel.active_marriage_status,
                'children': []  # Empty array for now, can be populated if needed
            })

        return spouses_data

    def get_parents(self, obj):
        """Get parent relationships."""
        parent_relationships = FamilyRelationship.objects.filter(
            relationship_type='parent_child',
            person2=obj
        )

        parents_data = []
        for rel in parent_relationships:
            parent = rel.person1
            parents_data.append({
                'id': parent.id,
                'full_name': parent.full_name,
                'gender': parent.gender,
                'profile_photo': parent.profile_photo.url if parent.profile_photo else None,
            })

        return parents_data

    def get_children(self, obj):
        """Get children relationships."""
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
                'date_of_birth': child.date_of_birth,
                'date_of_death': child.date_of_death,
                'profile_photo': child.profile_photo.url if child.profile_photo else None,
                'age': child.age,
                'is_alive': child.is_alive,
            })

        return children_data

    class Meta:
        model = Person
        fields = [
            'id', 'full_name', 'gender', 'date_of_birth', 'date_of_death',
            'profile_photo', 'notes', 'age', 'is_alive', 'created_at', 'updated_at',
            'spouses', 'parents', 'children'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


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
                'date_of_birth': spouse.date_of_birth,
                'date_of_death': spouse.date_of_death,
                'profile_photo': spouse.profile_photo.url if spouse.profile_photo else None,
                'age': spouse.age,
                'is_alive': spouse.is_alive,
                'marriage_date': rel.marriage_date,
                'divorce_date': rel.divorce_date,
                'active_marriage_status': rel.active_marriage_status,
                'children': [{
                    'id': rel.person2.id,
                    'full_name': rel.person2.full_name,
                    'gender': rel.person2.gender,
                    'date_of_birth': rel.person2.date_of_birth,
                    'date_of_death': rel.person2.date_of_death,
                    'profile_photo': rel.person2.profile_photo.url if rel.person2.profile_photo else None,
                    'age': rel.person2.age,
                    'is_alive': rel.person2.is_alive,
                } for rel in children]
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
                'date_of_birth': child.date_of_birth,
                'date_of_death': child.date_of_death,
                'profile_photo': child.profile_photo.url if child.profile_photo else None,
                'age': child.age,
                'is_alive': child.is_alive,
            })

        return children_data
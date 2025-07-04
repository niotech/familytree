from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date
from family.models import Person, FamilyRelationship


class Command(BaseCommand):
    help = 'Seed the database with sample family tree data'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample family tree data...')

        # Clear existing data
        FamilyRelationship.objects.all().delete()
        Person.objects.all().delete()

        # Create sample family members
        # Generation 1 - Great Grandparents
        great_grandfather = Person.objects.create(
            full_name="John Smith",
            gender="M",
            date_of_birth=date(1920, 5, 15),
            date_of_death=date(1995, 8, 20),
            notes="World War II veteran, worked as a carpenter."
        )

        great_grandmother = Person.objects.create(
            full_name="Mary Johnson",
            gender="F",
            date_of_birth=date(1925, 3, 10),
            date_of_death=date(2000, 12, 5),
            notes="Loved gardening and cooking for the family."
        )

        # Generation 2 - Grandparents
        grandfather = Person.objects.create(
            full_name="Robert Smith",
            gender="M",
            date_of_birth=date(1950, 7, 22),
            date_of_death=date(2010, 11, 15),
            notes="Engineer, loved fishing and woodworking."
        )

        grandmother = Person.objects.create(
            full_name="Elizabeth Davis",
            gender="F",
            date_of_birth=date(1952, 9, 8),
            notes="Retired teacher, active in community service."
        )

        # Generation 3 - Parents
        father = Person.objects.create(
            full_name="Michael Smith",
            gender="M",
            date_of_birth=date(1975, 4, 12),
            notes="Software engineer, enjoys hiking and photography."
        )

        mother = Person.objects.create(
            full_name="Sarah Wilson",
            gender="F",
            date_of_birth=date(1978, 6, 25),
            notes="Marketing manager, loves reading and yoga."
        )

        # Generation 4 - Current Generation
        child1 = Person.objects.create(
            full_name="Emma Smith",
            gender="F",
            date_of_birth=date(2005, 2, 14),
            notes="High school student, interested in art and music."
        )

        child2 = Person.objects.create(
            full_name="James Smith",
            gender="M",
            date_of_birth=date(2008, 8, 30),
            notes="Middle school student, loves sports and video games."
        )

        # Create relationships
        # Great Grandparents marriage
        FamilyRelationship.objects.create(
            relationship_type="spouse",
            person1=great_grandfather,
            person2=great_grandmother,
            marriage_date=date(1945, 6, 10)
        )

        # Grandparents marriage
        FamilyRelationship.objects.create(
            relationship_type="spouse",
            person1=grandfather,
            person2=grandmother,
            marriage_date=date(1970, 5, 20)
        )

        # Parents marriage
        FamilyRelationship.objects.create(
            relationship_type="spouse",
            person1=father,
            person2=mother,
            marriage_date=date(2000, 9, 15)
        )

        # Parent-child relationships
        # Great Grandparents -> Grandfather
        FamilyRelationship.objects.create(
            relationship_type="parent_child",
            person1=great_grandfather,
            person2=grandfather
        )
        FamilyRelationship.objects.create(
            relationship_type="parent_child",
            person1=great_grandmother,
            person2=grandfather
        )

        # Grandparents -> Father
        FamilyRelationship.objects.create(
            relationship_type="parent_child",
            person1=grandfather,
            person2=father
        )
        FamilyRelationship.objects.create(
            relationship_type="parent_child",
            person1=grandmother,
            person2=father
        )

        # Parents -> Children
        FamilyRelationship.objects.create(
            relationship_type="parent_child",
            person1=father,
            person2=child1
        )
        FamilyRelationship.objects.create(
            relationship_type="parent_child",
            person1=mother,
            person2=child1
        )

        FamilyRelationship.objects.create(
            relationship_type="parent_child",
            person1=father,
            person2=child2
        )
        FamilyRelationship.objects.create(
            relationship_type="parent_child",
            person1=mother,
            person2=child2
        )

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {Person.objects.count()} people and '
                f'{FamilyRelationship.objects.count()} relationships'
            )
        )

        # Display the family tree structure
        self.stdout.write('\nFamily Tree Structure:')
        self.stdout.write('=' * 50)
        self.stdout.write(f'Great Grandparents: {great_grandfather.full_name} & {great_grandmother.full_name}')
        self.stdout.write(f'Grandparents: {grandfather.full_name} & {grandmother.full_name}')
        self.stdout.write(f'Parents: {father.full_name} & {mother.full_name}')
        self.stdout.write(f'Children: {child1.full_name}, {child2.full_name}')

        self.stdout.write('\nSample person IDs for testing:')
        self.stdout.write(f'Root person (father): {father.id}')
        self.stdout.write(f'Child 1: {child1.id}')
        self.stdout.write(f'Child 2: {child2.id}')
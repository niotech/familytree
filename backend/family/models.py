from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import uuid


class Person(models.Model):
    """Model representing a person in the family tree."""

    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(max_length=255)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    date_of_birth = models.DateField(null=True, blank=True)
    date_of_death = models.DateField(null=True, blank=True)
    profile_photo = models.ImageField(upload_to='profile_photos/', null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['full_name']

    def __str__(self):
        return self.full_name

    @property
    def is_alive(self):
        """Check if the person is alive."""
        if self.date_of_death:
            return False
        return True

    @property
    def age(self):
        """Calculate current age or age at death."""
        if not self.date_of_birth:
            return None

        end_date = self.date_of_death if self.date_of_death else timezone.now().date()
        age = end_date.year - self.date_of_birth.year
        if end_date.month < self.date_of_birth.month or (
            end_date.month == self.date_of_birth.month and end_date.day < self.date_of_birth.day
        ):
            age -= 1
        return age


class FamilyRelationship(models.Model):
    """Model representing family relationships between people."""

    RELATIONSHIP_TYPES = [
        ('spouse', 'Spouse'),
        ('parent_child', 'Parent-Child'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    relationship_type = models.CharField(max_length=20, choices=RELATIONSHIP_TYPES)

    # For spouse relationships
    person1 = models.ForeignKey(
        Person,
        on_delete=models.CASCADE,
        related_name='relationships_as_person1'
    )
    person2 = models.ForeignKey(
        Person,
        on_delete=models.CASCADE,
        related_name='relationships_as_person2'
    )

    # For parent-child relationships, person1 is the parent, person2 is the child
    marriage_date = models.DateField(null=True, blank=True)
    divorce_date = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [
            ('person1', 'person2', 'relationship_type'),
        ]
        ordering = ['-created_at']

    def __str__(self):
        if self.relationship_type == 'spouse':
            return f"{self.person1.full_name} - {self.person2.full_name} (Spouse)"
        else:
            return f"{self.person1.full_name} -> {self.person2.full_name} (Parent-Child)"

    @property
    def active_marriage_status(self):
        """Check if this is an active marriage (no divorce date)."""
        if self.relationship_type != 'spouse':
            return False
        return self.divorce_date is None

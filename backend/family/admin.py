from django.contrib import admin
from .models import Person, FamilyRelationship


@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'gender', 'date_of_birth', 'date_of_death', 'is_alive', 'age']
    list_filter = ['gender', 'date_of_birth', 'date_of_death']
    search_fields = ['full_name']
    readonly_fields = ['id', 'created_at', 'updated_at', 'age', 'is_alive']

    fieldsets = (
        ('Basic Information', {
            'fields': ('full_name', 'gender', 'profile_photo')
        }),
        ('Dates', {
            'fields': ('date_of_birth', 'date_of_death')
        }),
        ('Additional Information', {
            'fields': ('notes',)
        }),
        ('System Information', {
            'fields': ('id', 'created_at', 'updated_at', 'age', 'is_alive'),
            'classes': ('collapse',)
        }),
    )


@admin.register(FamilyRelationship)
class FamilyRelationshipAdmin(admin.ModelAdmin):
    list_display = ['relationship_type', 'person1', 'person2', 'marriage_date', 'divorce_date']
    list_filter = ['relationship_type', 'marriage_date', 'divorce_date']
    search_fields = ['person1__full_name', 'person2__full_name']
    readonly_fields = ['id', 'created_at', 'updated_at']

    fieldsets = (
        ('Relationship Information', {
            'fields': ('relationship_type', 'person1', 'person2')
        }),
        ('Marriage Information', {
            'fields': ('marriage_date', 'divorce_date'),
            'classes': ('collapse',)
        }),
        ('System Information', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

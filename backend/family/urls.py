from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PersonViewSet, FamilyRelationshipViewSet

router = DefaultRouter()
router.register(r'persons', PersonViewSet)
router.register(r'relationships', FamilyRelationshipViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
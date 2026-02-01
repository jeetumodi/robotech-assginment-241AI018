from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RecruitmentDriveViewSet, TimelineEventViewSet, RecruitmentAssignmentViewSet, RecruitmentApplicationViewSet

router = DefaultRouter()
router.register(r'drives', RecruitmentDriveViewSet)
router.register(r'timeline', TimelineEventViewSet)
router.register(r'assignments', RecruitmentAssignmentViewSet)
router.register(r'applications', RecruitmentApplicationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

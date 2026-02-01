from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import RecruitmentDrive, TimelineEvent, RecruitmentAssignment, RecruitmentApplication
from .serializers import RecruitmentDriveSerializer, TimelineEventSerializer, RecruitmentAssignmentSerializer
from django.db import transaction

class RecruitmentDriveViewSet(viewsets.ModelViewSet):
    queryset = RecruitmentDrive.objects.all().order_by('-created_at')
    serializer_class = RecruitmentDriveSerializer
    # permission_classes = [GlobalPermission] -> Moved to get_permissions

    def get_permissions(self):
        if self.action == 'active_public':
            return [permissions.AllowAny()]
        from users.permissions import GlobalPermission
        return [GlobalPermission()]

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def active_public(self, request):
        """Public endpoint to get the current active recruitment drive"""
        drive = RecruitmentDrive.objects.filter(is_active=True, is_public=True).prefetch_related('timeline', 'assignments').first()
        if drive:
            return Response(RecruitmentDriveSerializer(drive).data)
        return Response(None)

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def submit_assessment(self, request):
        """Public endpoint for candidates to submit their assessment files"""
        identifier = request.data.get('identifier')
        drive_id = request.data.get('drive')
        file = request.FILES.get('assessment_file')
        
        if not identifier or not drive_id or not file:
             return Response({"error": "Identifier, Drive, and File are required."}, status=400)
             
        try:
            drive = RecruitmentDrive.objects.get(id=drive_id)
            # Find or create application
            app, created = RecruitmentApplication.objects.get_or_create(
                drive=drive,
                identifier=identifier
            )
            app.assessment_file = file
            from django.utils import timezone
            app.assessment_submitted_at = timezone.now()
            if app.status == 'APPLIED' or app.status == 'ASSESSMENT_PENDING':
                app.status = 'ASSESSMENT_COMPLETED'
            app.save()
            
            return Response({"success": "Assessment submitted successfully."})
        except RecruitmentDrive.DoesNotExist:
            return Response({"error": "Invalid drive id."}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class TimelineEventViewSet(viewsets.ModelViewSet):
    queryset = TimelineEvent.objects.all()
    serializer_class = TimelineEventSerializer
    # permission_classes = [GlobalPermission] -> Moved to get_permissions
    
    def get_permissions(self):
        from users.permissions import GlobalPermission
        return [GlobalPermission()]

    def perform_update(self, serializer):
        # Check if date changed, if so, update original_date if it wasn't set
        instance = self.get_object()
        new_date = serializer.validated_data.get('date')
        
        if new_date and instance.date != new_date and not instance.original_date:
             # Store the old date as original before updating
             serializer.save(original_date=instance.date)
        else:
             serializer.save()
class RecruitmentAssignmentViewSet(viewsets.ModelViewSet):
    queryset = RecruitmentAssignment.objects.all()
    serializer_class = RecruitmentAssignmentSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        from users.permissions import GlobalPermission
        return [GlobalPermission()]

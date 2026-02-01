from rest_framework import serializers
from .models import RecruitmentDrive, TimelineEvent, RecruitmentAssignment, RecruitmentApplication

class TimelineEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimelineEvent
        fields = '__all__'

class RecruitmentAssignmentSerializer(serializers.ModelSerializer):
    sig_name = serializers.CharField(source='sig.name', read_only=True)
    class Meta:
        model = RecruitmentAssignment
        fields = '__all__'

class RecruitmentApplicationSerializer(serializers.ModelSerializer):
    sig_name = serializers.CharField(source='user.profile.sig', read_only=True, default="N/A")
    class Meta:
        model = RecruitmentApplication
        fields = '__all__'

class RecruitmentDriveSerializer(serializers.ModelSerializer):
    timeline = TimelineEventSerializer(many=True, read_only=True)
    assignments = RecruitmentAssignmentSerializer(many=True, read_only=True)
    applications_count = serializers.IntegerField(source='applications.count', read_only=True)
    
    class Meta:
        model = RecruitmentDrive
        fields = '__all__'

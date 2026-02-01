from rest_framework import serializers
from .models import RecruitmentDrive, TimelineEvent, RecruitmentAssignment

class TimelineEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimelineEvent
        fields = '__all__'

class RecruitmentAssignmentSerializer(serializers.ModelSerializer):
    sig_name = serializers.CharField(source='sig.name', read_only=True)
    class Meta:
        model = RecruitmentAssignment
        fields = '__all__'

class RecruitmentDriveSerializer(serializers.ModelSerializer):
    timeline = TimelineEventSerializer(many=True, read_only=True)
    assignments = RecruitmentAssignmentSerializer(many=True, read_only=True)
    
    class Meta:
        model = RecruitmentDrive
        fields = '__all__'

from rest_framework import serializers
from users.serializers import UserSerializer
from .models import (
    Announcement, GalleryImage, Sponsorship, ContactMessage, 
    Form, FormSection, FormField, FormResponse
)

class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = '__all__'

class GalleryImageSerializer(serializers.ModelSerializer):
    image_path = serializers.SerializerMethodField()
    event_title = serializers.SerializerMethodField()

    class Meta:
        model = GalleryImage
        fields = ['id', 'image', 'image_path', 'uploaded_at', 'title', 'event', 'event_title']

    def get_image_path(self, obj):
        return obj.image.name

    def get_event_title(self, obj):
        return obj.event.title if obj.event else None

class SponsorshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sponsorship
        fields = '__all__'

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'

class FormFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormField
        fields = '__all__'

class FormSectionSerializer(serializers.ModelSerializer):
    fields = FormFieldSerializer(many=True, read_only=True)
    class Meta:
        model = FormSection
        fields = '__all__'

class FormResponseSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    class Meta:
        model = FormResponse
        fields = '__all__'
        read_only_fields = ['user']

class FormSerializer(serializers.ModelSerializer):
    sections = FormSectionSerializer(many=True, read_only=True)
    fields = FormFieldSerializer(many=True, read_only=True)
    response_count = serializers.IntegerField(source='responses.count', read_only=True)
    created_by_details = UserSerializer(source='created_by', read_only=True)

    class Meta:
        model = Form
        fields = '__all__'
        read_only_fields = ['created_by']

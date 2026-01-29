from django.db import models
from django.conf import settings

class Form(models.Model):
    THEME_CHOICES = [
        ('cyberpunk', 'Cyberpunk Neon'),
        ('minimal', 'Minimalist Glass'),
        ('industrial', 'Industrial Steel'),
        ('academic', 'Academic Official'),
        ('solaris', 'Solaris Vivid'),
        ('midnight', 'Midnight Indigo'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_forms')
    
    # Post-Submission Actions
    success_message = models.TextField(blank=True, default="Your response has been integrated. Session terminates now.")
    success_link = models.URLField(blank=True, help_text="Optional link to redirect to or show after submission")
    success_link_label = models.CharField(max_length=50, blank=True, default="Continue", help_text="Label for the success link button")

    is_active = models.BooleanField(default=True)
    theme = models.CharField(max_length=30, choices=THEME_CHOICES, default='cyberpunk')
    closes_at = models.DateTimeField(null=True, blank=True, help_text="Automatic closure timestamp")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class FormSection(models.Model):
    form = models.ForeignKey(Form, on_delete=models.CASCADE, related_name='sections')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.title} in {self.form.title}"

class FormField(models.Model):
    FIELD_TYPES = [
        ('text', 'Short Text'),
        ('textarea', 'Long Text'),
        ('number', 'Number'),
        ('date', 'Date'),
        ('select', 'Dropdown'),
        ('radio', 'Radio Buttons'),
        ('checkbox', 'Checkbox'),
    ]

    form = models.ForeignKey(Form, on_delete=models.CASCADE, related_name='fields')
    section = models.ForeignKey(FormSection, on_delete=models.SET_NULL, null=True, blank=True, related_name='fields')
    label = models.CharField(max_length=200)
    field_type = models.CharField(max_length=20, choices=FIELD_TYPES, default='text')
    required = models.BooleanField(default=False)
    options = models.JSONField(default=list, blank=True, help_text="List of options for select/dropdown")
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.label} ({self.field_type}) in {self.form.title}"

class FormResponse(models.Model):
    form = models.ForeignKey(Form, on_delete=models.CASCADE, related_name='responses')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    data = models.JSONField(help_text="JSON object mapping field labels/ids to values")
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Response to {self.form.title} by {self.user.username if self.user else 'Anonymous'}"

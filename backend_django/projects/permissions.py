from rest_framework import permissions

class IsProjectMember(permissions.BasePermission):
    """
    Custom permission to only allow members of a project to view/edit.
    """

    def has_permission(self, request, view):
        if request.user.is_superuser:
            return True
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any member
        if request.user.is_superuser:
            return True
            
        # If obj is Project
        if hasattr(obj, 'members'):
            return request.user == obj.lead or request.user in obj.members.all()
            
        # If obj is ProjectThread
        if hasattr(obj, 'project'):
            return request.user == obj.project.lead or request.user in obj.project.members.all()

        # If obj is ThreadMessage
        if hasattr(obj, 'thread'):
            project = obj.thread.project
            return request.user == project.lead or request.user in project.members.all()

        return False

#!/bin/bash

echo "Migrating database..."
python manage.py migrate --noinput

exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4
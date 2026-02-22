#!/bin/bash
# deploy.sh
# Usage: ./deploy.sh <COMMIT_SHA>

COMMIT_SHA=$1
DOCKER_REPO=docker.io/jeetumodi/robotech

echo "Pulling backend production image..."
docker pull $DOCKER_REPO-backend:$COMMIT_SHA

echo "Pulling frontend production image..."
docker pull $DOCKER_REPO-frontend:$COMMIT_SHA

echo "Deploying containers using docker-compose.prod.yml..."
docker-compose -f docker-compose.prod.yml up -d --no-build

echo "Deployment completed for commit $COMMIT_SHA"
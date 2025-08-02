#!/bin/bash

# Deployment script for Scribd Viewer
# This script can be used for various deployment scenarios

set -e

echo "🚀 Starting deployment process..."

# Default values
ENVIRONMENT=${1:-production}
IMAGE_TAG=${2:-latest}
DOCKER_REGISTRY=${DOCKER_REGISTRY:-docker.io}
APP_NAME="scribd-viewer"

echo "📦 Environment: $ENVIRONMENT"
echo "🏷️  Image Tag: $IMAGE_TAG"

# Function to deploy with Docker Compose
deploy_docker_compose() {
    echo "🐳 Deploying with Docker Compose..."
    
    # Stop existing containers
    docker-compose down || true
    
    # Pull latest images
    docker-compose pull
    
    # Start services
    docker-compose up -d
    
    # Wait for health check
    echo "⏳ Waiting for service to be healthy..."
    sleep 10
    
    # Check if service is running
    if curl -f http://localhost:5000/ > /dev/null 2>&1; then
        echo "✅ Service is running successfully!"
    else
        echo "❌ Service failed to start properly"
        exit 1
    fi
}

# Function to deploy with Kubernetes
deploy_kubernetes() {
    echo "☸️  Deploying with Kubernetes..."
    
    # Apply Kubernetes manifests
    kubectl apply -f k8s/
    
    # Wait for deployment to be ready
    kubectl rollout status deployment/$APP_NAME
    
    echo "✅ Kubernetes deployment completed!"
}

# Function to build and push Docker image
build_and_push() {
    echo "🔨 Building Docker image..."
    
    # Build the image
    docker build -t $DOCKER_REGISTRY/$APP_NAME:$IMAGE_TAG .
    
    # Push to registry
    if [ "$CI" = "true" ] || [ "$PUSH_IMAGE" = "true" ]; then
        echo "📤 Pushing image to registry..."
        docker push $DOCKER_REGISTRY/$APP_NAME:$IMAGE_TAG
    fi
}

# Function to run health check
health_check() {
    echo "🔍 Running health check..."
    
    # Wait a bit for service to start
    sleep 5
    
    # Check health endpoint
    if curl -f http://localhost:5000/ > /dev/null 2>&1; then
        echo "✅ Health check passed!"
        return 0
    else
        echo "❌ Health check failed!"
        return 1
    fi
}

# Main deployment logic
case $ENVIRONMENT in
    "local")
        echo "🏠 Local deployment"
        build_and_push
        deploy_docker_compose
        ;;
    "production")
        echo "🌐 Production deployment"
        build_and_push
        if command -v kubectl &> /dev/null; then
            deploy_kubernetes
        else
            deploy_docker_compose
        fi
        ;;
    "kubernetes")
        echo "☸️  Kubernetes deployment"
        build_and_push
        deploy_kubernetes
        ;;
    *)
        echo "❌ Unknown environment: $ENVIRONMENT"
        echo "Available environments: local, production, kubernetes"
        exit 1
        ;;
esac

# Final health check
health_check

echo "🎉 Deployment completed successfully!"
echo "🌐 Application is available at: http://localhost:5000"
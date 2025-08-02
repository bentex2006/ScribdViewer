# 🚀 Deployment Guide - Scribd Viewer

This guide covers multiple deployment options for the Scribd Document Viewer application.

## 📋 Prerequisites

- Docker installed
- Docker Compose (for local deployment)
- Kubernetes cluster access (for k8s deployment)
- GitHub account (for auto-deployment)

## 🐳 Quick Start with Docker

### Option 1: Docker Compose (Recommended for local development)

```bash
# Clone the repository
git clone <your-repo-url>
cd scribd-viewer

# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

### Option 2: Manual Docker Build

```bash
# Build the image
docker build -t scribd-viewer .

# Run the container
docker run -d -p 5000:5000 --name scribd-viewer scribd-viewer

# View logs
docker logs -f scribd-viewer

# Stop the container
docker stop scribd-viewer && docker rm scribd-viewer
```

## ☸️ Kubernetes Deployment

### Prerequisites
- kubectl configured with your cluster
- Ingress controller installed (nginx-ingress recommended)
- cert-manager for SSL certificates (optional)

### Deploy to Kubernetes

```bash
# Apply all Kubernetes manifests
kubectl apply -f k8s/

# Check deployment status
kubectl rollout status deployment/scribd-viewer

# Get service information
kubectl get services scribd-viewer-service

# View pods
kubectl get pods -l app=scribd-viewer
```

### Update deployment

```bash
# Update image tag in k8s/deployment.yaml
# Then apply changes
kubectl apply -f k8s/deployment.yaml

# Force rollout restart
kubectl rollout restart deployment/scribd-viewer
```

## 🔄 Auto-Deployment with GitHub Actions

### Setup Steps

1. **Fork/Clone the repository**

2. **Set up Docker Hub secrets in GitHub:**
   - Go to Settings → Secrets and variables → Actions
   - Add `DOCKER_USERNAME` with your Docker Hub username
   - Add `DOCKER_PASSWORD` with your Docker Hub access token

3. **Customize deployment:**
   - Edit `.github/workflows/deploy.yml`
   - Update Docker image name in the workflow
   - Add your specific deployment commands

4. **Push to main/master branch:**
   ```bash
   git add .
   git commit -m "feat: add auto-deployment"
   git push origin main
   ```

### GitHub Actions Workflow Features

- ✅ Automatic builds on push to main/master
- ✅ Docker image building and pushing
- ✅ Build caching for faster deployments
- ✅ Multi-platform support
- ✅ Production deployment automation

## 🛠️ Deployment Script

Use the included deployment script for easier deployments:

```bash
# Local deployment
./deploy.sh local

# Production deployment
./deploy.sh production

# Kubernetes deployment
./deploy.sh kubernetes

# Custom image tag
./deploy.sh production v1.2.3
```

## 🌐 Environment Variables

Set these environment variables for production:

```bash
NODE_ENV=production
PORT=5000
```

Optional variables:
```bash
DATABASE_URL=your_postgres_url  # If using PostgreSQL
REDIS_URL=your_redis_url        # If using Redis for sessions
```

## 📊 Monitoring and Health Checks

### Health Check Endpoint
The application includes built-in health checks at:
- `GET /` - Basic health check

### Docker Health Check
```bash
# Check container health
docker ps --filter "name=scribd-viewer"

# View health status
docker inspect scribd-viewer | grep Health
```

### Kubernetes Health Check
```bash
# Check pod status
kubectl get pods -l app=scribd-viewer

# Describe pod for detailed info
kubectl describe pod <pod-name>
```

## 🔒 Security Considerations

1. **Use environment variables for secrets**
2. **Enable HTTPS in production**
3. **Set up proper ingress with SSL certificates**
4. **Use non-root user in Docker container**
5. **Regular security updates**

## 🐛 Troubleshooting

### Common Issues

**Container won't start:**
```bash
# Check logs
docker logs scribd-viewer

# Check if port is available
netstat -tulpn | grep :5000
```

**Kubernetes pod not ready:**
```bash
# Check pod logs
kubectl logs -l app=scribd-viewer

# Check events
kubectl get events --sort-by=.metadata.creationTimestamp
```

**Build failures:**
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker build --no-cache -t scribd-viewer .
```

## 📈 Scaling

### Docker Compose Scaling
```bash
# Scale to 3 instances
docker-compose up -d --scale scribd-viewer=3
```

### Kubernetes Scaling
```bash
# Scale deployment
kubectl scale deployment scribd-viewer --replicas=5

# Auto-scaling (optional)
kubectl autoscale deployment scribd-viewer --cpu-percent=70 --min=2 --max=10
```

## 🔄 Updates and Rollbacks

### Rolling Updates
```bash
# Update image tag in deployment files
# Apply changes
kubectl apply -f k8s/deployment.yaml

# Monitor rollout
kubectl rollout status deployment/scribd-viewer
```

### Rollback
```bash
# Rollback to previous version
kubectl rollout undo deployment/scribd-viewer

# Rollback to specific revision
kubectl rollout undo deployment/scribd-viewer --to-revision=2
```

## 📞 Support

For deployment issues:
1. Check the logs first
2. Verify environment variables
3. Ensure all prerequisites are met
4. Review this deployment guide

---

🎉 **Happy Deploying!** Your Scribd Viewer should now be running successfully.
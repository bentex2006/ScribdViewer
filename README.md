# DisBlur - Scribd Document Viewer

## Overview

DisBlur is a comprehensive web application that provides enhanced readability for Scribd documents by removing blur effects and visual restrictions. The application features a React frontend with URL input, document viewing, history management, and fullscreen capabilities. The backend proxy server injects CSS to improve document visibility and provides persistent history storage.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Style**: RESTful endpoints with JSON responses
- **Proxy Service**: Custom Scribd document fetcher with CSS injection
- **Development**: Hot reload with Vite middleware integration

### Data Storage
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Database**: PostgreSQL (configured but not actively used)
- **Session Storage**: In-memory storage with connect-pg-simple for future use
- **History Storage**: MemStorage implementation with CRUD operations for viewing history
- **Schema Validation**: Zod schemas for history items and URL validation

## Key Components

### Frontend Components
1. **UrlInput**: Handles Scribd URL validation and submission
2. **DocumentViewer**: Displays proxied documents with fullscreen support and mobile optimization
3. **ControlPanel**: Provides document controls (refresh, fullscreen, etc.)
4. **HistoryPanel**: Manages viewing history with search, clear, and quick access features
5. **UI Components**: Complete shadcn/ui component library with Sheet components for mobile

### Backend Services
1. **Proxy Service**: `/api/proxy-scribd` endpoint that fetches and modifies Scribd content
2. **CSS Injection**: Removes blur filters, promotional overlays, and unwanted UI elements
3. **History API**: RESTful endpoints for managing document viewing history
4. **Mobile Optimization**: CSS injection includes responsive design improvements
5. **Error Handling**: Comprehensive error responses with proper HTTP status codes

### Shared Resources
1. **Schema Validation**: Zod schemas for Scribd URL validation
2. **Type Definitions**: Shared TypeScript interfaces

## Data Flow

1. User enters Scribd document URL in the frontend form
2. Frontend validates URL format using Zod schema
3. Valid URLs are sent to `/api/proxy-scribd` endpoint
4. Backend fetches the original Scribd page with proper headers
5. CSS is injected to remove blur effects and promotional content
6. Modified HTML is returned to frontend
7. Frontend displays the enhanced document in an iframe

## External Dependencies

### Frontend Dependencies
- **UI/UX**: Radix UI primitives, Lucide React icons, Tailwind CSS
- **Data Fetching**: TanStack Query for API calls
- **Form Management**: React Hook Form with Hookform resolvers
- **Validation**: Zod for schema validation
- **Date Handling**: date-fns for date manipulation

### Backend Dependencies
- **Server**: Express.js with TypeScript support
- **Database**: Drizzle ORM with Neon Database serverless driver
- **Development**: tsx for TypeScript execution, esbuild for production builds

### Development Tools
- **Build System**: Vite with React plugin
- **Type Checking**: TypeScript with strict configuration
- **Code Quality**: PostCSS with Tailwind and Autoprefixer
- **Development**: Replit integration with error overlay and cartographer

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds React app to `dist/public` directory
2. **Backend**: esbuild bundles server code to `dist` directory
3. **Production**: Single Node.js process serves both static files and API

### Environment Configuration
- **Development**: Uses tsx for TypeScript execution with hot reload
- **Production**: Compiled JavaScript with NODE_ENV=production
- **Database**: PostgreSQL connection via DATABASE_URL environment variable

### Hosting Considerations
- **Static Assets**: Served from Express in production
- **API Routes**: Express handles all `/api/*` requests
- **Database**: Configured for Neon serverless PostgreSQL
- **Sessions**: Ready for PostgreSQL session storage in production

## Recent Changes (January 2025)

✓ Enhanced CSS injection to hide unwanted Scribd UI elements (ratings, downloads, etc.)
✓ Added comprehensive mobile responsive design with optimized layouts
✓ Implemented history management system with persistent storage
✓ Added fullscreen document viewing capability
✓ Created history panel with search, clear, and quick access features
✓ Mobile optimization for document viewing and navigation
✓ Improved user experience with better button layouts and spacing
✓ Added Docker containerization support with multi-stage builds
✓ Created comprehensive auto-deployment pipeline with GitHub Actions
✓ Implemented Kubernetes deployment manifests with health checks
✓ Added deployment scripts for multiple environments (local, production, k8s)

## Deployment Options

The application supports multiple deployment strategies:

1. **Docker Compose**: Quick local development and small-scale production
2. **Kubernetes**: Scalable production deployments with auto-scaling
3. **GitHub Actions**: Automated CI/CD pipeline with Docker registry integration
4. **Manual Deployment**: Traditional server deployment with build scripts

All deployment configurations include health checks, logging, and monitoring capabilities. The Docker image is optimized for production with multi-stage builds and security best practices.


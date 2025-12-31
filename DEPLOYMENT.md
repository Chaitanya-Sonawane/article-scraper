# Deployment Guide

## 🚀 Quick Deployment Options

### Option 1: Heroku (Recommended for Backend)

#### Prerequisites
- Heroku CLI installed
- Git repository ready

#### Steps
```bash
# Login to Heroku
heroku login

# Create Heroku app
heroku create article-scraper-app

# Set environment variables
heroku config:set MONGODB_URI="your_mongodb_atlas_uri"
heroku config:set OPENAI_API_KEY="your_openai_key"
heroku config:set NODE_ENV="production"

# Deploy
git push heroku main

# Open app
heroku open
```

### Option 2: Netlify (Frontend) + Railway (Backend)

#### Frontend on Netlify
```bash
# Build frontend
cd frontend
npm run build

# Deploy to Netlify (drag & drop build folder)
# Or connect GitHub repo for auto-deployment
```

#### Backend on Railway
```bash
# Connect GitHub repo to Railway
# Set environment variables in Railway dashboard
# Deploy automatically on git push
```

### Option 3: Vercel (Full-Stack)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

## 🔧 Environment Configuration

### Production Environment Variables

```env
# Required for production
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
OPENAI_API_KEY=sk-your-openai-key
PORT=80

# Optional
GOOGLE_API_KEY=your-google-api-key
GOOGLE_CX=your-custom-search-engine-id
```

### MongoDB Atlas Setup

1. **Create Atlas Account**
   - Visit [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create free tier cluster

2. **Configure Database**
   ```bash
   # Create database user
   # Whitelist IP addresses (0.0.0.0/0 for all)
   # Get connection string
   ```

3. **Connection String Format**
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
   ```

## 🌐 Platform-Specific Guides

### Heroku Deployment

#### 1. Prepare Application
```bash
# Create Procfile
echo "web: node server.js" > Procfile

# Update package.json engines
{
  "engines": {
    "node": "18.x",
    "npm": "9.x"
  }
}
```

#### 2. Configure Heroku
```bash
# Create app
heroku create your-app-name

# Add MongoDB addon (optional)
heroku addons:create mongolab:sandbox

# Set config vars
heroku config:set OPENAI_API_KEY=your-key
heroku config:set MONGODB_URI=your-uri
```

#### 3. Deploy
```bash
git add .
git commit -m "Prepare for Heroku deployment"
git push heroku main
```

### Railway Deployment

#### 1. Connect Repository
- Visit [Railway](https://railway.app)
- Connect GitHub repository
- Select deployment branch

#### 2. Configure Environment
```bash
# In Railway dashboard, add variables:
MONGODB_URI=your-mongodb-uri
OPENAI_API_KEY=your-openai-key
PORT=3000
```

#### 3. Deploy
- Automatic deployment on git push
- Custom domain available

### Vercel Deployment

#### 1. Install CLI
```bash
npm i -g vercel
```

#### 2. Configure vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    },
    {
      "src": "frontend/build/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/build/$1"
    }
  ]
}
```

#### 3. Deploy
```bash
vercel --prod
```

## 🔒 Security Considerations

### Environment Variables
```bash
# Never commit .env files
echo ".env" >> .gitignore

# Use platform-specific secret management
# Heroku: heroku config:set
# Vercel: vercel env add
# Railway: Environment variables in dashboard
```

### API Security
```javascript
// Add rate limiting
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### CORS Configuration
```javascript
// Configure CORS for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com']
    : ['http://localhost:3000'],
  credentials: true
};

app.use(cors(corsOptions));
```

## 📊 Monitoring & Logging

### Application Monitoring
```javascript
// Add health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### Error Tracking
```javascript
// Add error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : {}
  });
});
```

### Logging
```bash
# Use structured logging
npm install winston

# Configure log levels
# ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3
```

## 🚀 Performance Optimization

### Database Optimization
```javascript
// Add database indexes
db.articles.createIndex({ url: 1 });
db.articles.createIndex({ createdAt: -1 });
db.updatedarticles.createIndex({ originalArticleId: 1 });
```

### Caching
```javascript
// Add Redis caching
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

// Cache frequently accessed data
app.get('/api/articles', async (req, res) => {
  const cached = await client.get('articles');
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  const articles = await Article.find();
  await client.setex('articles', 300, JSON.stringify(articles));
  res.json(articles);
});
```

### CDN Configuration
```bash
# Use CDN for static assets
# Configure CloudFlare or AWS CloudFront
# Optimize images and assets
```

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        npm install
        cd frontend && npm install
        
    - name: Build frontend
      run: cd frontend && npm run build
      
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{secrets.HEROKU_API_KEY}}
        heroku_app_name: "your-app-name"
        heroku_email: "your-email@example.com"
```

## 🧪 Testing in Production

### Health Checks
```bash
# Test API endpoints
curl https://your-app.herokuapp.com/health
curl https://your-app.herokuapp.com/api/articles

# Test scraping functionality
curl -X POST https://your-app.herokuapp.com/api/articles/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/article"}'
```

### Load Testing
```bash
# Install artillery
npm install -g artillery

# Create load test
artillery quick --count 10 --num 5 https://your-app.herokuapp.com/api/articles
```

## 📱 Mobile Optimization

### Responsive Design
```css
/* Ensure mobile-friendly design */
@media (max-width: 768px) {
  .article-container {
    padding: 10px;
    font-size: 14px;
  }
}
```

### PWA Configuration
```json
// public/manifest.json
{
  "name": "Article Scraper & AI Rewriter",
  "short_name": "ArticleAI",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}
```

## 🔧 Troubleshooting Deployment

### Common Issues

**Build Failures:**
```bash
# Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Memory Issues:**
```bash
# Increase memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
```

**Database Connection:**
```bash
# Test connection
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected'))
  .catch(err => console.error('Error:', err));
"
```

**API Key Issues:**
```bash
# Verify environment variables
heroku config:get OPENAI_API_KEY
vercel env ls
```

## 📞 Support

For deployment issues:
1. Check platform-specific documentation
2. Review application logs
3. Test locally first
4. Contact platform support if needed

---

**Happy Deploying! 🚀**
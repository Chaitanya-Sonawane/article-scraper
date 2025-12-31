# Detailed Setup Guide

## Quick Start (5 minutes)

### 1. Prerequisites Check
```bash
node --version  # Should be v14+
npm --version   # Should be 6+
mongo --version # Should be 4.4+
```

### 2. One-Command Setup
```bash
git clone https://github.com/Chaitanya-Sonawane/article-scraper.git
cd article-scraper
npm run setup:all
```

## Manual Setup (Detailed)

### Environment Variables Explained

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB connection string | Yes | `mongodb://localhost:27017/article-scraper` |
| `OPENAI_API_KEY` | OpenAI API key for AI rewriting | Yes | `sk-...` |
| `PORT` | Server port | No | `3000` |
| `GOOGLE_API_KEY` | Google Custom Search API | No | `AIza...` |
| `GOOGLE_CX` | Google Custom Search Engine ID | No | `017576...` |

### Database Setup Options

#### Option 1: Local MongoDB
```bash
# Install MongoDB
brew install mongodb-community  # macOS
sudo apt install mongodb        # Ubuntu

# Start service
brew services start mongodb-community
sudo systemctl start mongod
```

#### Option 2: MongoDB Atlas (Cloud)
1. Visit [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### OpenAI API Setup
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create account
3. Add payment method (required for API access)
4. Generate API key
5. Copy to `.env` file

### Verification Steps
```bash
# Test database connection
npm run test:db

# Test OpenAI API
npm run test:openai

# Test scraper
npm run test:scraper

# Full system test
npm run test:all
```

## Development Workflow

### 1. Start Development Servers
```bash
# Terminal 1: Backend with hot reload
npm run dev

# Terminal 2: Frontend with hot reload
cd frontend && npm start
```

### 2. Making Changes
- Backend changes auto-reload with nodemon
- Frontend changes auto-reload with React dev server
- Database changes require manual restart

### 3. Testing Changes
```bash
# Test specific component
npm run test:component ArticleList

# Test API endpoints
npm run test:api

# Test scraping functionality
npm run test:scraper
```

## Production Deployment

### Environment Setup
```bash
# Production environment variables
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
OPENAI_API_KEY=sk-...
PORT=80
```

### Build Process
```bash
# Build frontend
cd frontend && npm run build

# Build backend (if using TypeScript)
npm run build

# Start production server
npm start
```

## Troubleshooting

### Common Setup Issues

**Issue: MongoDB connection failed**
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Check connection
mongo --eval "db.adminCommand('ismaster')"

# Restart MongoDB
brew services restart mongodb-community
```

**Issue: OpenAI API key invalid**
```bash
# Test API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

**Issue: Port already in use**
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

**Issue: Frontend build fails**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node version
nvm use 16  # or latest LTS
```

### Performance Optimization

**Database Indexing:**
```javascript
// Add indexes for better performance
db.articles.createIndex({ "url": 1 })
db.articles.createIndex({ "createdAt": -1 })
db.updatedarticles.createIndex({ "originalArticleId": 1 })
```

**Memory Management:**
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
```

## Development Tips

### Useful Commands
```bash
# View logs
npm run logs

# Clear database
npm run db:clear

# Seed sample data
npm run db:seed

# Generate API documentation
npm run docs:generate

# Run linting
npm run lint

# Format code
npm run format
```

### Debugging
```bash
# Debug backend
npm run debug

# Debug with Chrome DevTools
node --inspect server.js

# Debug frontend
npm run debug:frontend
```

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/article-export

# Commit frequently
git add .
git commit -m "Add article export functionality"

# Push changes
git push origin feature/article-export
```
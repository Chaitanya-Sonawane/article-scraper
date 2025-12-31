# Article Scraper & AI Rewriter

A full-stack web application that scrapes articles from websites and uses AI to rewrite them while maintaining the original meaning and structure. Built with Node.js, Express, MongoDB, React, and OpenAI GPT.

## 🚀 Live Demo

**Frontend Application**: [Live Link Coming Soon]
- View original scraped articles
- See AI-rewritten versions
- Compare side-by-side content

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Local Setup Instructions](#local-setup-instructions)
- [API Documentation](#api-documentation)
- [Data Flow](#data-flow)
- [Project Structure](#project-structure)
- [Usage Examples](#usage-examples)
- [Contributing](#contributing)

## ✨ Features

### Core Functionality
- **Web Scraping**: Automated article extraction from various websites
- **AI Rewriting**: Intelligent content rewriting using OpenAI GPT models
- **Content Management**: Store and manage original and rewritten articles
- **RESTful API**: Complete backend API for article operations
- **React Frontend**: Modern, responsive user interface

### Advanced Features
- **Batch Processing**: Process multiple articles simultaneously
- **Content Comparison**: Side-by-side view of original vs rewritten content
- **Search & Filter**: Find articles by title, content, or metadata
- **Export Options**: Download articles in various formats
- **Real-time Updates**: Live status updates during processing

## 🏗️ Architecture

### System Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │  Express Server │    │   MongoDB DB    │
│                 │    │                 │    │                 │
│  - Article List │◄──►│  - REST API     │◄──►│  - Articles     │
│  - Comparison   │    │  - Scraping     │    │  - Updated      │
│  - Management   │    │  - AI Service   │    │    Articles     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   OpenAI API    │
                       │                 │
                       │  - GPT Models   │
                       │  - Text Rewrite │
                       └─────────────────┘
```

### Data Flow Diagram

```
1. User Input (URL) → 2. Web Scraper → 3. Content Extraction → 4. Database Storage
                                                                        │
8. Display Results ← 7. Database Update ← 6. AI Rewriting ← 5. AI Processing Queue
```

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Puppeteer** - Web scraping
- **OpenAI API** - AI text rewriting
- **JSDOM** - HTML parsing

### Frontend
- **React** - UI framework
- **Create React App** - Project setup
- **Axios** - HTTP client
- **CSS3** - Styling

### Development Tools
- **Nodemon** - Development server
- **Git** - Version control
- **npm** - Package management

## 🚀 Local Setup Instructions

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)

### Step 1: Clone the Repository

```bash
git clone https://github.com/Chaitanya-Sonawane/article-scraper.git
cd article-scraper
```

### Step 2: Install Dependencies

#### Backend Dependencies
```bash
npm install
```

#### Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### Step 3: Environment Configuration

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Edit `.env` file with your configuration:
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/article-scraper

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=3000

# Google Custom Search (optional)
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_CX=your_google_custom_search_engine_id_here
```

### Step 4: Database Setup

1. Start MongoDB service:
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Ubuntu/Debian
sudo systemctl start mongod

# On Windows
net start MongoDB
```

2. Verify MongoDB is running:
```bash
mongo --eval "db.adminCommand('ismaster')"
```

### Step 5: Get OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env` file

### Step 6: Start the Application

#### Option 1: Start Both Services Separately

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

#### Option 2: Start Both Services Together
```bash
npm run start:all
```

### Step 7: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3000/api
- **MongoDB**: mongodb://localhost:27017

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### Articles

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/articles` | Get all articles |
| GET | `/articles/:id` | Get specific article |
| POST | `/articles/scrape` | Scrape new article |
| PUT | `/articles/:id/rewrite` | Rewrite article with AI |
| DELETE | `/articles/:id` | Delete article |

#### Example Requests

**Scrape Article:**
```bash
curl -X POST http://localhost:3000/api/articles/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/article"}'
```

**Rewrite Article:**
```bash
curl -X PUT http://localhost:3000/api/articles/:id/rewrite \
  -H "Content-Type: application/json"
```

## 🔄 Data Flow

### 1. Article Scraping Process
```
URL Input → Puppeteer Launch → Page Navigation → Content Extraction → HTML Parsing → Data Cleaning → Database Storage
```

### 2. AI Rewriting Process
```
Original Article → Content Preparation → OpenAI API Call → Response Processing → Quality Check → Database Update
```

### 3. Frontend Display Process
```
User Request → API Call → Database Query → Data Formatting → React Component Rendering → User Interface Update
```

## 📁 Project Structure

```
article-scraper/
├── frontend/                 # React frontend application
│   ├── public/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/           # Page components
│   │   ├── api/             # API integration
│   │   └── utils/           # Utility functions
│   └── package.json
├── src/                     # Backend source code
│   ├── config/              # Database configuration
│   ├── controllers/         # Route controllers
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   └── scrapers/            # Web scraping logic
├── scripts/                 # Utility scripts
├── docs/                    # Documentation
├── .env.example             # Environment template
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies
└── README.md               # This file
```

## 🎯 Usage Examples

### 1. Scraping an Article

```javascript
// Using the API
const response = await fetch('/api/articles/scrape', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://example.com/article' })
});
```

### 2. Rewriting Content

```javascript
// Rewrite an existing article
const response = await fetch(`/api/articles/${articleId}/rewrite`, {
  method: 'PUT'
});
```

### 3. Running Scripts

```bash
# Test scraper functionality
npm run test:scraper

# Run AI pipeline
npm run ai:pipeline

# Demo AI rewriting
npm run demo:ai
```

## 🧪 Testing

### Run Tests
```bash
# Backend tests
npm test

# Frontend tests
cd frontend && npm test
```

### Manual Testing
1. Test article scraping with various URLs
2. Verify AI rewriting functionality
3. Check database operations
4. Test frontend components

## 🚀 Deployment

### Frontend Deployment (Netlify/Vercel)
1. Build the frontend:
```bash
cd frontend && npm run build
```
2. Deploy the `build` folder to your hosting service

### Backend Deployment (Heroku/Railway)
1. Set environment variables on your hosting platform
2. Deploy the backend code
3. Update frontend API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**MongoDB Connection Error:**
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify database permissions

**OpenAI API Error:**
- Verify API key is correct
- Check API quota and billing
- Ensure proper API key format

**Scraping Failures:**
- Some websites block automated scraping
- Try different user agents
- Check for CAPTCHA requirements

**Frontend Build Issues:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version compatibility
- Verify all dependencies are installed

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check existing documentation
- Review troubleshooting section

---

**Made with ❤️ by Chaitanya Sonawane**
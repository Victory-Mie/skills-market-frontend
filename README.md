# Skills Market Frontend

Next.js frontend for the Skills Market application.

## Features

- **My Orders**: View order history and order details
- **My Skills**: View purchased and rented skills
- **Account Settings**: Manage profile information

## Getting Started

### Prerequisites

- Node.js 18+ installed

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`.

### Build for Production

```bash
npm run build
npm start
```

## Environment Variables

Create a `.env.local` file in the root directory:

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Project Structure

```
/
├── components/
│   └── Layout.js        # Main layout with navigation
├── lib/
│   └── api.js           # API client with axios
├── pages/
│   ├── index.js         # Home page
│   ├── my-orders/       # Orders pages
│   │   ├── index.js     # Orders list
│   │   └── [id].js      # Order details
│   ├── my-skills.js     # My skills page
│   └── settings.js      # Account settings
└── styles/
    └── globals.css      # Global styles with Tailwind
```

## API Integration

The frontend uses a centralized API client (`lib/api.js`) that handles:
- Authentication token management
- Request/response interceptors
- Error handling

### API Endpoints

- `GET /api/orders` - Get user orders
- `GET /api/orders/[id]` - Get order details
- `GET /api/my-skills` - Get user's skills
- `GET /api/user/profile` - Get user profile
- `PATCH /api/user/profile` - Update user profile

## Styling

This project uses [Tailwind CSS](https://tailwindcss.com/) for styling.

## Development

The project is set up for development with Vercel's serverless functions. For local development:

```bash
# Start backend API (from backend directory)
cd ../skills-market-backend
vercel dev

# Start frontend (from frontend directory)
cd ../skills-market-frontend
npm run dev
```

Both services will run concurrently on ports 3000 and 3001.

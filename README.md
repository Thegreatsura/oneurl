<img width="2752" height="1536" alt="og" src="https://github.com/user-attachments/assets/3449d15c-1ebc-4f69-8d16-c2d85aee597f" />

# OneURL

**One URL for all your links** - An open-source alternative to Linktree. Create a beautiful profile page to share all your important links in one place.

## Features

- **Google OAuth Authentication** - Secure and seamless sign-in with your existing Google account
- **Custom Profile Pages** - Create personalized profile pages with your unique username
- **Link Management** - Add, edit, and reorganize your links effortlessly
- **Deep Analytics** - Track clicks and view detailed insights about your audience engagement
- **Avatar Upload** - Upload and customize your profile picture with drag-and-drop support
- **Responsive Design** - Your profile looks perfect on every device
- **Fast & Modern** - Built with Next.js 16 and React 19 for instant page loads

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** Better Auth
- **File Upload:** UploadThing + React Dropzone
- **State Management:** TanStack Query (React Query)
- **Styling:** Tailwind CSS
- **UI Components:** Base UI React
- **Charts:** Recharts

## Prerequisites

Before you begin, ensure you have:

- Node.js 20+ or Bun installed
- PostgreSQL database (local or cloud like Neon)
- Google OAuth credentials
- UploadThing account (free tier available)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/KartikLabhshetwar/oneurl.git
cd oneurl
```

### 2. Install Dependencies

```bash
bun install
# or
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/oneurl"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# UploadThing - for file uploads
UPLOADTHING_TOKEN="your-uploadthing-token"
```

> **Note:** UploadThing is optional. If not configured, you can still use the app but avatar uploads won't work. Sign up at [uploadthing.com](https://uploadthing.com) to get your credentials.

### 4. Set Up Database

```bash
# Generate Prisma Client
bun prisma generate

# Run migrations
bun prisma migrate dev
```

### 5. Run the Development Server

```bash
bun run dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
oneurl/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication routes (login, signup)
│   ├── (dashboard)/       # Dashboard routes (protected)
│   ├── (onboarding)/      # Onboarding flow
│   ├── [username]/        # Public profile pages
│   └── api/               # API routes
├── components/            # React components
│   ├── landing/           # Landing page components
│   └── ui/                # UI component library
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and services
│   ├── generated/         # Generated Prisma client
│   ├── hooks/             # Custom hooks
│   ├── services/          # Business logic services
│   └── validations/       # Zod schemas
├── prisma/                # Prisma schema and migrations
└── public/                # Static assets
```

## Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint

## Additional Setup

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env`

### UploadThing Setup (Optional)

UploadThing is used for secure file uploads (avatars). To enable avatar uploads:

1. Sign up at [uploadthing.com](https://uploadthing.com) (free tier available)
2. Create a new app
3. Copy your `UPLOADTHING_TOKEN`
4. Add them to your `.env` file

The app will work without UploadThing, but avatar upload functionality will be disabled.

## Usage

1. Sign In - Click "Sign In" and authenticate with Google
2. Onboarding - Complete the onboarding flow:
   - Choose a username
   - Upload an avatar (optional)
   - Add your links
   - Preview your profile
3. Dashboard - Manage your profile, links, and view analytics
4. Share - Your profile is available at `oneurl.live/yourusername`

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository to Vercel
3. Add all environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `BETTER_AUTH_SECRET`
   - `BETTER_AUTH_URL` (your production URL)
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `UPLOADTHING_TOKEN` (if using file uploads)
4. Deploy!

### Database

For production, use a managed PostgreSQL service like:

- [Neon](https://neon.tech/)
- [Supabase](https://supabase.com/)
- [Railway](https://railway.app/)

Update your `DATABASE_URL` in the deployment environment variables.

### Production Checklist

- [ ] Set up production database
- [ ] Configure Google OAuth with production redirect URI
- [ ] Set `BETTER_AUTH_URL` to your production domain
- [ ] Configure UploadThing with production domain (if using)
- [ ] Update `next.config.ts` image domains if needed
- [ ] Test all features in production environment

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

Quick start:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

For detailed guidelines, see [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

Made by [Kartik Labhshetwar](https://github.com/KartikLabhshetwar)

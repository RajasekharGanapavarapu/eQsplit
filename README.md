eQsplit 💸
A premium, open-source expense splitting application built for modern friend groups and roommates.

eQsplit takes the awkwardness out of shared expenses. Whether you're splitting rent, organizing a group trip, or just splitting a dinner bill, eQsplit provides a beautiful, real-time dashboard to track who owes who, record precise splits, and settle up balances effortlessly.

✨ Features
Real-Time Dashboards: Instantly see your net balances and total group expenses.
Advanced Splitting: Split bills equally, by exact amounts, or by custom percentages.
Smart Settlements: The algorithm automatically simplifies debts so you make the fewest number of transactions possible.
Receipt Tracking: Upload photos of receipts securely to the cloud so you never lose track of a bill.
Premium UI/UX: Built with a stunning glassmorphic design, fluid animations, and a modern dark mode.
Secure Authentication: Passwordless magic links and secure session management.
🛠️ Tech Stack
Frontend: React 18, Vite, TypeScript
Styling: Tailwind CSS, Lucide Icons, Custom Glassmorphism
Backend & Database: Supabase (PostgreSQL)
Authentication: Supabase Auth
Storage: Supabase Storage buckets (for receipts and avatars)
🚀 Getting Started
Clone the repository

bash


git clone https://github.com/YOUR_USERNAME/eQsplit.git
cd eQsplit
Install dependencies

bash


npm install
Set up Environment Variables Create a .env file in the root directory and add your Supabase keys:

env


VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
Run the development server

bash


npm run dev
📜 License
MIT License - free to use, modify, and distribute.


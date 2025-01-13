import { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import { ClerkProvider,SignInButton,
  SignedIn,
  SignedOut,
  UserButton } from '@clerk/nextjs';
import Header from '@/components/header';

const inter =Inter({subsets: ['latin']});

export const metadata :Metadata= {
  title: 'Journal',
  description: 'A journaling app',
};

export default function RootLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <ClerkProvider>
      <html lang="en">
      <body
          className={`${inter.className} bg-gradient-to-b from-orange-50 via-amber-50 to-orange-50`}
        >
          <div className="inset-0 bg-[url('/bg.jpg')] opacity-50 fixed -z-10" />
          <Header />
          <main className="min-h-screen">{children}</main>
          {/* <Toaster richColors /> */}

          <footer className="bg-orange-300 py-12 bg-opacity-10">
            <div className="container mx-auto px-4 text-center text-gray-900">
              <p>Made by Dhev</p>
            </div>
          </footer>
        </body>
      </html>
      </ClerkProvider>
    )
  }

import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import RacePage from './pages/RacePage';
import LeaderboardPage from './pages/LeaderboardPage';
import { useInitializeTracks } from './hooks/useQueries';

function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

function AppContent() {
  const { mutate: initializeTracks } = useInitializeTracks();

  useEffect(() => {
    initializeTracks();
  }, [initializeTracks]);

  const rootRoute = createRootRoute({
    component: Layout,
  });

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: HomePage,
  });

  const raceRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/race/$trackId',
    component: RacePage,
  });

  const leaderboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/leaderboard',
    component: LeaderboardPage,
  });

  const routeTree = rootRoute.addChildren([indexRoute, raceRoute, leaderboardRoute]);

  const router = createRouter({ routeTree });

  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AppContent />
    </ThemeProvider>
  );
}

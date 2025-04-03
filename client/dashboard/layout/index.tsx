import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import Domains from '../domains';
import Header from '../header';
import Profile from '../profile';
import RequireAuth from '../auth/require-auth';
import Site from '../site';
import SiteBackups from '../site-backups';
import Sites from '../sites';
import './style.scss';

// Create a client
const queryClient = new QueryClient();

// Create the root layout component that will be used in the router
function DashboardLayout() {
	return (
		<div className="dashboard__layout">
			<Header />
			<main className="dashboard__content">
				<Outlet />
			</main>
		</div>
	);
}

// Create the router configuration
const router = createBrowserRouter(
	[
		{
			path: '/',
			element: <DashboardLayout />,
			children: [
				{
					path: 'sites',
					element: <Sites />,
				},
				{
					path: 'sites/:id',
					element: <Site />,
				},
				{
					path: 'sites/:id/backups',
					element: <SiteBackups />,
				},
				{
					path: 'domains',
					element: <Domains />,
				},
				{
					path: 'account/profile',
					element: <Profile />,
				},
				{
					path: '',
					element: <Navigate to="/sites" replace />,
				},
			],
		},
	],
	{
		basename: '/v2',
	}
);

function Layout() {
	return (
		<QueryClientProvider client={ queryClient }>
			<RequireAuth>
				<RouterProvider router={ router } />
			</RequireAuth>
		</QueryClientProvider>
	);
}

export default Layout;

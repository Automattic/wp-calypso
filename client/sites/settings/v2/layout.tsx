import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { AuthProvider, useAuth } from 'calypso/dashboard/app/auth';
import { queryClient } from 'calypso/dashboard/app/query-client';
import { getRouter } from './router';

function RouterProviderWithAuth() {
	const auth = useAuth();
	const router = getRouter();
	return <RouterProvider router={ router } context={ { auth } } />;
}

function Layout() {
	return (
		<QueryClientProvider client={ queryClient }>
			<AuthProvider>
				<RouterProviderWithAuth />
			</AuthProvider>
		</QueryClientProvider>
	);
}

export default Layout;

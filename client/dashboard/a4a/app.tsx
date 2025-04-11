import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { queryClient } from '../app/query-client';
import { routerA4A } from '../app/router';
import { AppProvider } from '../app-context';
import { AuthProvider, useAuth } from '../auth';

function RouterProviderWithAuth() {
	const auth = useAuth();
	return <RouterProvider router={ routerA4A } context={ { auth } } />;
}

function Layout() {
	return (
		<QueryClientProvider client={ queryClient }>
			<AuthProvider>
				<AppProvider appType="a4a">
					<RouterProviderWithAuth />
				</AppProvider>
			</AuthProvider>
		</QueryClientProvider>
	);
}
export default Layout;

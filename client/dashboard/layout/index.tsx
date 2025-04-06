import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { AppProvider } from '../app-context';
import { AuthProvider, useAuth } from '../auth';
import { queryClient } from './query-client';
import { router } from './router';

import './style.scss';

function RouterProviderWithAuth() {
	const auth = useAuth();
	return <RouterProvider router={ router } context={ { auth } } />;
}

function Layout() {
	return (
		<QueryClientProvider client={ queryClient }>
			<AuthProvider>
				<AppProvider appType="dotcom">
					<RouterProviderWithAuth />
				</AppProvider>
			</AuthProvider>
		</QueryClientProvider>
	);
}
export default Layout;

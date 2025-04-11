import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { useMemo } from 'react';
import { useAppContext } from '../app-context';
import { AuthProvider, useAuth } from '../auth';
import { queryClient } from './query-client';
import { getRouter } from './router';

function RouterProviderWithAuth() {
	const auth = useAuth();
	const { appType } = useAppContext();
	const router = useMemo( () => getRouter( appType ), [ appType ] );
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

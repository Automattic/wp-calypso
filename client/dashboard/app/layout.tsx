import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { useMemo } from 'react';
import { AuthProvider, useAuth } from '../auth';
import { AppProvider, type AppType } from './context';
import { queryClient } from './query-client';
import { getRouter } from './router';

function RouterProviderWithAuth( { app }: { app: AppType } ) {
	const auth = useAuth();
	const router = useMemo( () => getRouter( app ), [ app ] );
	return <RouterProvider router={ router } context={ { auth } } />;
}

function Layout( { app }: { app: AppType } ) {
	return (
		<AppProvider appType={ app }>
			<QueryClientProvider client={ queryClient }>
				<AuthProvider>
					<RouterProviderWithAuth app={ app } />
				</AuthProvider>
			</QueryClientProvider>
		</AppProvider>
	);
}
export default Layout;

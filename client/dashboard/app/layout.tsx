import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { useMemo } from 'react';
import { AuthProvider, useAuth } from '../auth';
import { AppProvider, type AppType, type AppConfig } from './context';
import { queryClient } from './query-client';
import { getRouter } from './router';

function RouterProviderWithAuth( { basePath }: { basePath: string } ) {
	const auth = useAuth();
	const router = useMemo( () => getRouter( basePath ), [ basePath ] );
	return <RouterProvider router={ router } context={ { auth } } />;
}

function Layout( { app, config }: { app: AppType; config: AppConfig } ) {
	return (
		<AppProvider appType={ app } config={ config }>
			<QueryClientProvider client={ queryClient }>
				<AuthProvider>
					<RouterProviderWithAuth basePath={ config.basePath } />
				</AuthProvider>
			</QueryClientProvider>
		</AppProvider>
	);
}
export default Layout;

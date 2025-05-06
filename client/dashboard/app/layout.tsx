import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { useMemo } from 'react';
import { AuthProvider, useAuth } from './auth';
import { AppProvider, type AppConfig } from './context';
import { queryClient } from './query-client';
import { getRouter } from './router';

function RouterProviderWithAuth( { config }: { config: AppConfig } ) {
	const auth = useAuth();
	const router = useMemo( () => getRouter( config ), [ config ] );
	return <RouterProvider router={ router } context={ { auth, config } } />;
}

function Layout( { config }: { config: AppConfig } ) {
	return (
		<AppProvider config={ config }>
			<QueryClientProvider client={ queryClient }>
				<AuthProvider>
					<RouterProviderWithAuth config={ config } />
				</AuthProvider>
			</QueryClientProvider>
		</AppProvider>
	);
}
export default Layout;

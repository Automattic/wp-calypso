import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { useMemo } from 'react';
import { AuthProvider, useAuth } from './auth';
import { AppProvider, type AppConfig } from './context';
import { I18nProvider } from './i18n';
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
					<I18nProvider>
						<RouterProviderWithAuth config={ config } />
					</I18nProvider>
				</AuthProvider>
			</QueryClientProvider>
		</AppProvider>
	);
}
export default Layout;

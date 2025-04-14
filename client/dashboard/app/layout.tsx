import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { useMemo } from 'react';
import { AppProvider, type AppConfig } from './context';
import { queryClient } from './query-client';
import { getRouter } from './router';

function RouterProviderWithAuth( { config }: { config: AppConfig } ) {
	const router = useMemo( () => getRouter( config ), [ config ] );
	return <RouterProvider router={ router } />;
}

function Layout( { config }: { config: AppConfig } ) {
	return (
		<AppProvider config={ config }>
			<QueryClientProvider client={ queryClient }>
				<RouterProviderWithAuth config={ config } />
			</QueryClientProvider>
		</AppProvider>
	);
}
export default Layout;

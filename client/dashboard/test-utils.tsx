import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRootRoute } from '@tanstack/react-router';
import { render as testingLibraryRender } from '@testing-library/react';
import { Suspense } from 'react';

export function render( ui: React.ReactElement ) {
	const queryClient = new QueryClient( {
		defaultOptions: {
			queries: { retry: false },
		},
	} );
	const Component = () => ui;
	const router = createRouter( {
		routeTree: createRootRoute( {
			pendingMs: 0,
			component: () => (
				<Suspense fallback={ <div data-testid="loading" /> }>
					<Component />
				</Suspense>
			),
		} ),
	} );
	return testingLibraryRender(
		<QueryClientProvider client={ queryClient }>
			<RouterProvider router={ router } context={ { config: { basePath: '/' } } } />
		</QueryClientProvider>
	);
}

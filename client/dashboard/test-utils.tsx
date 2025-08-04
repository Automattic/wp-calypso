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
	const router = createRouter( {
		routeTree: createRootRoute( { component: () => ui } ),
	} );
	return testingLibraryRender(
		<QueryClientProvider client={ queryClient }>
			<Suspense fallback={ <div>Loading...</div> }>
				<RouterProvider router={ router } context={ { config: { basePath: '/' } } } />
			</Suspense>
		</QueryClientProvider>
	);
}

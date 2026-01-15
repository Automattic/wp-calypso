import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRootRoute } from '@tanstack/react-router';
import { render as testingLibraryRender } from '@testing-library/react';
import { Suspense } from 'react';
import { type AnalyticsClient, AnalyticsProvider } from './app/analytics';

function createTestRouter( ui: React.ReactElement ) {
	const Component = () => ui;

	return createRouter( {
		routeTree: createRootRoute( {
			pendingMs: 0,
			component: () => (
				<Suspense fallback={ <div data-testid="loading" /> }>
					<Component />
				</Suspense>
			),
		} ),
	} );
}

type RenderResult = ReturnType< typeof testingLibraryRender > &
	AnalyticsClient & {
		router: ReturnType< typeof createTestRouter >;
		queryClient: QueryClient;
	};

export function render( ui: React.ReactElement ): RenderResult {
	const queryClient = new QueryClient( {
		defaultOptions: {
			queries: { retry: false },
		},
	} );
	const router = createTestRouter( ui );

	const recordTracksEvent = jest.fn();
	const recordPageView = jest.fn();

	const testingLibraryResult = testingLibraryRender(
		<QueryClientProvider client={ queryClient }>
			<AnalyticsProvider client={ { recordTracksEvent, recordPageView } }>
				<RouterProvider router={ router } context={ { config: { basePath: '/' } } } />
			</AnalyticsProvider>
		</QueryClientProvider>
	);

	return {
		...testingLibraryResult,
		router,
		queryClient,
		recordTracksEvent,
		recordPageView,
	};
}

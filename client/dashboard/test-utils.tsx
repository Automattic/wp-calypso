import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRootRoute } from '@tanstack/react-router';
import { render as testingLibraryRender } from '@testing-library/react';
import { Suspense } from 'react';
import { type AnalyticsClient, AnalyticsProvider } from './app/analytics';
import { AuthContext } from './app/auth';
import { AppProvider, APP_CONTEXT_DEFAULT_CONFIG } from './app/context';
import type { User } from '@automattic/api-core';

const defaultUser = {
	ID: 1,
	username: 'testuser',
	email: 'test@example.com',
	language: 'en',
} as User;

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

interface RenderOptions {
	user?: User;
	queryClient?: QueryClient;
}

export function render( ui: React.ReactElement, options: RenderOptions = {} ): RenderResult {
	const { user = defaultUser, queryClient: providedClient } = options;
	const queryClient =
		providedClient ??
		new QueryClient( {
			defaultOptions: {
				queries: { retry: false },
			},
		} );
	const router = createTestRouter( ui );

	const recordTracksEvent = jest.fn();
	const recordPageView = jest.fn();

	const testingLibraryResult = testingLibraryRender(
		<QueryClientProvider client={ queryClient }>
			<AppProvider config={ APP_CONTEXT_DEFAULT_CONFIG }>
				<AnalyticsProvider client={ { recordTracksEvent, recordPageView } }>
					<AuthContext.Provider value={ { user, logout: jest.fn() } }>
						<RouterProvider router={ router } context={ { config: { basePath: '/' } } } />
					</AuthContext.Provider>
				</AnalyticsProvider>
			</AppProvider>
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

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createMemoryHistory, createRouter } from '@tanstack/react-router';
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { AnalyticsProvider } from '../../../app/analytics';
import { AuthContext } from '../../../app/auth';
import { AppProvider, APP_CONTEXT_DEFAULT_CONFIG } from '../../../app/context';
import { createAgencyRoutes } from '../../../app/router/agency';
import { rootRoute } from '../../../app/router/root';
import { createSitesRoutes } from '../../../app/router/sites';
import type { User } from '@automattic/api-core';
import type { AnyRoute } from '@tanstack/react-router';

/**
 * Builds the app's real route tree, which gives its route objects (e.g. `siteRoute`) their ids
 * and full paths. Code reads params and search through those objects, which find their match by
 * id, and links to their full paths. The router is never rendered.
 */
export function buildRealRoutes( section: 'sites' | 'agency' ) {
	const config = {
		...APP_CONTEXT_DEFAULT_CONFIG,
		supports: { ...APP_CONTEXT_DEFAULT_CONFIG.supports, sites: true },
	};
	createRouter( {
		routeTree: rootRoute.addChildren(
			section === 'sites' ? createSitesRoutes( config ) : createAgencyRoutes()
		),
		context: { config },
	} );
}

/**
 * Renders a test route tree at `path`, in the providers `render()` from test-utils gives.
 *
 * Give the test routes the same paths (and pathless ids) as the app's, so their ids match the real
 * route objects' once `buildRealRoutes()` has run. Unlike the app's routes, they don't load data
 * before rendering: the components fetch what they need, which tests mock with nock.
 */
export function renderAtPath( routeTree: AnyRoute, path: string ) {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	const router = createRouter( {
		routeTree,
		history: createMemoryHistory( { initialEntries: [ path ] } ),
		defaultPendingMs: 0,
	} );

	const result = render(
		<QueryClientProvider client={ queryClient }>
			<AppProvider config={ APP_CONTEXT_DEFAULT_CONFIG }>
				<AnalyticsProvider client={ { recordTracksEvent: vi.fn(), recordPageView: vi.fn() } }>
					<AuthContext.Provider value={ { user: { ID: 1 } as User, logout: vi.fn() } }>
						<RouterProvider router={ router } context={ { config: { basePath: '/' } } } />
					</AuthContext.Provider>
				</AnalyticsProvider>
			</AppProvider>
		</QueryClientProvider>
	);

	return { ...result, router, queryClient };
}

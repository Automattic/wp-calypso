/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
	RouterProvider,
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
} from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import { AnalyticsProvider } from '../../analytics';
import { AuthContext } from '../../auth';
import { APP_CONTEXT_DEFAULT_CONFIG, AppProvider } from '../../context';
import Root from '../index';
import type { AppConfig } from '../../context';
import type { User } from '@automattic/api-core';

const config: AppConfig = {
	...APP_CONTEXT_DEFAULT_CONFIG,
	name: 'Test Dashboard',
	basePath: '/',
	supports: { ...APP_CONTEXT_DEFAULT_CONFIG.supports, sites: true },
};

function renderRoot( initialPath: string ) {
	const rootRoute = createRootRoute( { component: Root } );
	const regularRoute = createRoute( {
		getParentRoute: () => rootRoute,
		path: '/regular',
		component: () => <h1>Regular page</h1>,
	} );
	const fullscreenRoute = createRoute( {
		getParentRoute: () => rootRoute,
		path: '/fullscreen',
		staticData: { isFullscreen: true },
		component: () => <h1>Fullscreen page</h1>,
	} );
	const router = createRouter( {
		routeTree: rootRoute.addChildren( [ regularRoute, fullscreenRoute ] ),
		history: createMemoryHistory( { initialEntries: [ initialPath ] } ),
	} );

	return render(
		<QueryClientProvider
			client={ new QueryClient( { defaultOptions: { queries: { retry: false } } } ) }
		>
			<AppProvider config={ config }>
				<AnalyticsProvider client={ { recordTracksEvent: jest.fn(), recordPageView: jest.fn() } }>
					<AuthContext.Provider
						value={ { user: { ID: 1, username: 'testuser' } as User, logout: jest.fn() } }
					>
						<RouterProvider router={ router } />
					</AuthContext.Provider>
				</AnalyticsProvider>
			</AppProvider>
		</QueryClientProvider>
	);
}

describe( '<Root>', () => {
	test( 'shows the sidebar on a regular route', async () => {
		renderRoot( '/regular' );

		expect( await screen.findByRole( 'heading', { name: 'Regular page' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Sites' } ) ).toBeVisible();
	} );

	test( 'leaves the sidebar out on a fullscreen route', async () => {
		renderRoot( '/fullscreen' );

		expect( await screen.findByRole( 'heading', { name: 'Fullscreen page' } ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: 'Sites' } ) ).not.toBeInTheDocument();
	} );
} );

/**
 * @vitest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
	Outlet,
	RouterProvider,
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
} from '@tanstack/react-router';
import { render as testingLibraryRender, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { Suspense } from 'react';
import { vi } from 'vitest';
import { AnalyticsProvider } from '../../../app/analytics';
import { AuthContext } from '../../../app/auth';
import { AppProvider, APP_CONTEXT_DEFAULT_CONFIG } from '../../../app/context';
import SiteRepositories from '../index';
import type { CodeDeploymentData, Site, User } from '@automattic/api-core';

const API_BASE = 'https://public-api.wordpress.com';

const site = {
	ID: 1,
	slug: 'test-site',
	is_wpcom_atomic: true,
	plan: { features: { active: [ 'atomic', 'github-deployments' ] } },
} as Site;

const deployment = {
	id: 5,
	repository_name: 'test-org/test-repo',
	branch_name: 'main',
	target_dir: '/wp-content/plugins/example',
	is_automated: false,
	updated_on: '2026-01-01T00:00:00+00:00',
} as CodeDeploymentData;

function mockApis( {
	deployments = [],
	hasGithubApp = true,
}: { deployments?: CodeDeploymentData[]; hasGithubApp?: boolean } = {} ) {
	nock( API_BASE )
		.persist()
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: {} } );
	nock( API_BASE ).get( `/rest/v1.1/sites/${ site.slug }` ).query( true ).reply( 200, site );
	nock( API_BASE )
		.get( `/wpcom/v2/sites/${ site.ID }/hosting/code-deployments` )
		.query( true )
		.reply( 200, deployments );
	nock( API_BASE )
		.get( '/wpcom/v2/hosting/github/installations' )
		.query( true )
		.reply( hasGithubApp ? 200 : 403, hasGithubApp ? [] : { code: 'missing_github_token' } );
}

// The screen reads the site from the URL and the view from the route search,
// so render it at its own route.
function renderRepositories() {
	const root = createRootRoute( {
		pendingMs: 0,
		component: () => (
			<Suspense fallback={ null }>
				<Outlet />
			</Suspense>
		),
	} );
	const repositoriesRoute = createRoute( {
		getParentRoute: () => root,
		path: 'sites/$siteSlug/settings/repositories',
		component: SiteRepositories,
	} );
	const router = createRouter( {
		routeTree: root.addChildren( [ repositoriesRoute ] ),
		history: createMemoryHistory( {
			initialEntries: [ `/sites/${ site.slug }/settings/repositories` ],
		} ),
	} );
	return testingLibraryRender(
		<QueryClientProvider
			client={ new QueryClient( { defaultOptions: { queries: { retry: false } } } ) }
		>
			<AppProvider config={ APP_CONTEXT_DEFAULT_CONFIG }>
				<AnalyticsProvider client={ { recordTracksEvent: vi.fn(), recordPageView: vi.fn() } }>
					<AuthContext.Provider value={ { user: { ID: 1 } as User, logout: vi.fn() } }>
						<RouterProvider router={ router } context={ { config: { basePath: '/' } } } />
					</AuthContext.Provider>
				</AnalyticsProvider>
			</AppProvider>
		</QueryClientProvider>
	);
}

describe( '<SiteRepositories>', () => {
	test( 'replaces the list with an empty state when no repository is connected', async () => {
		mockApis();

		renderRepositories();

		expect(
			await screen.findByRole( 'heading', { name: 'No repositories connected' } )
		).toBeVisible();
		expect( screen.getByText( 'Deploy code from GitHub to this site.' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Connect repository' } ) ).toBeVisible();
		expect( screen.queryByRole( 'searchbox' ) ).not.toBeInTheDocument();
	} );

	test( 'shows the same empty state when the GitHub app is not installed and nothing is connected', async () => {
		mockApis( { hasGithubApp: false } );

		renderRepositories();

		expect(
			await screen.findByRole( 'heading', { name: 'No repositories connected' } )
		).toBeVisible();
		expect(
			screen.queryByRole( 'heading', { name: 'Connect your GitHub account' } )
		).not.toBeInTheDocument();
	} );

	test( 'asks to connect GitHub when repositories exist but the GitHub app is not installed', async () => {
		mockApis( { deployments: [ deployment ], hasGithubApp: false } );

		renderRepositories();

		expect(
			await screen.findByRole( 'heading', { name: 'Connect your GitHub account' } )
		).toBeVisible();
		expect( screen.queryByText( 'test-repo' ) ).not.toBeInTheDocument();
	} );

	test( 'keeps the list and shows a search empty state when no repository matches', async () => {
		const user = userEvent.setup();
		mockApis( { deployments: [ deployment ] } );

		renderRepositories();

		expect( await screen.findByText( 'test-repo' ) ).toBeVisible();

		await user.type( screen.getByRole( 'searchbox', { name: 'Search' } ), 'nomatch' );

		expect(
			await screen.findByRole( 'heading', { name: 'No repositories match your search' } )
		).toBeVisible();
		expect( screen.getByText( 'Try a different search term.' ) ).toBeVisible();
		expect( screen.getByRole( 'searchbox', { name: 'Search' } ) ).toBeVisible();
	} );
} );

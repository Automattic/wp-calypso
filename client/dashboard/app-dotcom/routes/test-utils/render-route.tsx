import { queryClient } from '@automattic/api-queries';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createMemoryHistory, createRouter } from '@tanstack/react-router';
import { render } from '@testing-library/react';
import nock from 'nock';
import { beforeEach, vi } from 'vitest';
import { AnalyticsProvider } from '../../../app/analytics';
import { AUTH_QUERY_KEY, AuthContext } from '../../../app/auth';
import { APP_CONTEXT_DEFAULT_CONFIG, AppProvider } from '../../../app/context';
import { createRouteTree } from '../../../app/router';
import { defaultUser } from '../../../test-utils';
import type { AppConfig } from '../../../app/context';
import type { Site, User } from '@automattic/api-core';

const config: AppConfig = {
	...APP_CONTEXT_DEFAULT_CONFIG,
	supports: { ...APP_CONTEXT_DEFAULT_CONFIG.supports, sites: true },
};

vi.mock( '@automattic/calypso-config', async ( importOriginal ) => ( {
	...( await importOriginal< typeof import( '@automattic/calypso-config' ) >() ),
	serverEnvId: 'dashboard-development',
} ) );

queryClient.setDefaultOptions( {
	queries: { ...queryClient.getDefaultOptions().queries, retry: false },
} );

beforeEach( () => {
	window.localStorage.clear();
	queryClient.clear();
} );

export async function renderRoute( url: string, { user = defaultUser }: { user?: User } = {} ) {
	queryClient.setQueryData( AUTH_QUERY_KEY, user );

	const router = createRouter( {
		routeTree: createRouteTree( config ),
		history: createMemoryHistory( { initialEntries: [ url ] } ),
		context: { config },
	} );
	await router.load();

	const result = render(
		<QueryClientProvider client={ queryClient }>
			<AppProvider config={ config }>
				<AnalyticsProvider client={ { recordTracksEvent: vi.fn(), recordPageView: vi.fn() } }>
					<AuthContext.Provider value={ { user, logout: vi.fn() } }>
						<RouterProvider router={ router } />
					</AuthContext.Provider>
				</AnalyticsProvider>
			</AppProvider>
		</QueryClientProvider>
	);

	return { ...result, router };
}

export const testSite = {
	ID: 1,
	name: 'Test Site',
	slug: 'test-site.wordpress.com',
	URL: 'https://test-site.wordpress.com',
	site_migration: {},
	capabilities: { manage_options: true },
	plan: { features: { active: [] } },
} as unknown as Site;

export function mockSite( site: Site = testSite ) {
	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( `/rest/v1.1/sites/${ site.slug }` )
		.query( true )
		.reply( 200, site );
}

export function mockSiteSettings( site: Site = testSite ) {
	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( `/rest/v1.4/sites/${ site.ID }/settings` )
		.query( true )
		.reply( 200, { settings: {} } );
}

export function mockPreferences( preferences: Record< string, unknown > = {} ) {
	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: preferences } );
}

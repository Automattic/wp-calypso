/**
 * @jest-environment jsdom
 */

import { queryClient } from '@automattic/api-queries';
import { createMemoryHistory, createRouter } from '@tanstack/react-router';
import nock from 'nock';
import { isDashboardBackport } from '../../../utils/is-dashboard-backport';
import { APP_CONTEXT_DEFAULT_CONFIG, type AppConfig } from '../../context';
import { createMeRoutes, meRoute, purchaseSettingsIndexRoute } from '../me';
import { rootRoute } from '../root';

jest.mock( '../../../utils/is-dashboard-backport', () => ( {
	isDashboardBackport: jest.fn( () => false ),
} ) );

const mockIsDashboardBackport = jest.mocked( isDashboardBackport );

const dashboardConfig: AppConfig = {
	...APP_CONTEXT_DEFAULT_CONFIG,
	supports: {
		...APP_CONTEXT_DEFAULT_CONFIG.supports,
		me: {
			billing: false,
			security: false,
			apps: false,
		},
		colorScheme: true,
		darkMode: true,
	},
};

type RouteLike = {
	path?: string;
	options?: unknown;
	children?: unknown[];
};

function getRouteOptionsPath( route: RouteLike ): string | undefined {
	if (
		route.options &&
		typeof route.options === 'object' &&
		'path' in route.options &&
		typeof route.options.path === 'string'
	) {
		return route.options.path;
	}
}

function getRouteChildren( route: unknown ): unknown[] {
	if ( ! route || typeof route !== 'object' || ! ( 'children' in route ) ) {
		return [];
	}

	return Array.isArray( route.children ) ? route.children : [];
}

function hasRoutePath( routes: unknown[], path: string ): boolean {
	return routes.some(
		( route ) =>
			typeof route === 'object' &&
			route !== null &&
			( getRouteOptionsPath( route ) === path ||
				( 'path' in route && route.path === path ) ||
				( 'children' in route && hasRoutePath( getRouteChildren( route ), path ) ) )
	);
}

beforeEach( () => {
	mockIsDashboardBackport.mockReturnValue( false );
	queryClient.clear();
} );

test( 'registers the appearance route in the Dashboard backport so deep links can redirect', () => {
	mockIsDashboardBackport.mockReturnValue( true );

	expect( hasRoutePath( createMeRoutes( dashboardConfig ), 'appearance' ) ).toBe( true );
} );

test( 'does not register the appearance route when dark mode is not supported', () => {
	expect(
		hasRoutePath(
			createMeRoutes( {
				...dashboardConfig,
				supports: {
					...dashboardConfig.supports,
					darkMode: false,
				},
			} ),
			'appearance'
		)
	).toBe( false );
} );

test( 'does not register the appearance route when color scheme is not supported', () => {
	expect(
		hasRoutePath(
			createMeRoutes( {
				...dashboardConfig,
				supports: {
					...dashboardConfig.supports,
					colorScheme: false,
					darkMode: true,
				},
			} ),
			'appearance'
		)
	).toBe( false );
} );

test( 'loads the purchase settings when the user cannot read media storage', async () => {
	const purchaseId = 123;
	const site = {
		ID: 456,
		slug: 'test-site.wordpress.com',
		URL: 'https://test-site.wordpress.com',
		name: 'Test Site',
	};

	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.2/upgrades/${ purchaseId }` )
		.query( true )
		.reply( 200, {
			ID: purchaseId,
			blog_id: site.ID,
			site_slug: site.slug,
			is_plan: true,
			is_jetpack_plan_or_product: false,
		} );

	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ site.slug }` )
		.query( true )
		.reply( 200, site );

	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ site.ID }/media-storage` )
		.query( true )
		.reply( 403, { error: 'unauthorized', message: 'User cannot view media storage limits' } );

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const loader = purchaseSettingsIndexRoute.options.loader as any;

	await expect(
		loader( { params: { purchaseId: String( purchaseId ) } } )
	).resolves.toBeUndefined();
} );

// A route that fails in `beforeLoad` leaves the routes below it pending, and the router never
// settles. The dashboard then swaps the error screen for its slow-navigation loader.
test( 'settles every match when the session is dead', async () => {
	const unauthenticated = {
		error: 'authorization_required',
		message: 'An active access token must be used to query information about the current user.',
	};

	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/two-step' )
		.query( true )
		.reply( 403, unauthenticated );

	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/settings' )
		.query( true )
		.reply( 403, unauthenticated );

	const router = createRouter( {
		routeTree: rootRoute.addChildren( createMeRoutes( dashboardConfig ) ),
		history: createMemoryHistory( { initialEntries: [ '/me/notifications' ] } ),
		context: { config: dashboardConfig },
	} );

	await router.load();

	expect( router.state.matches.map( ( { routeId, status } ) => [ routeId, status ] ) ).toEqual( [
		[ '__root__', 'success' ],
		[ '/me', 'error' ],
		[ '/me/notifications', 'success' ],
		[ '/me/notifications/', 'success' ],
	] );
} );

test( 'loads the page when only the two-step check fails', async () => {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/two-step' )
		.query( true )
		.reply( 500, { error: 'internal_error', message: 'Something went wrong.' } );

	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/settings' )
		.query( true )
		.reply( 200, {} );

	const router = createRouter( {
		routeTree: rootRoute.addChildren( createMeRoutes( dashboardConfig ) ),
		history: createMemoryHistory( { initialEntries: [ '/me/notifications' ] } ),
		context: { config: dashboardConfig },
	} );

	await router.load();

	expect( router.state.matches.map( ( { status } ) => status ) ).toEqual( [
		'success',
		'success',
		'success',
		'success',
	] );
} );

test( 'redirects to reauthorize when the two-step session has expired', async () => {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/two-step' )
		.query( true )
		.reply( 200, { two_step_reauthorization_required: true } );

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const beforeLoad = meRoute.options.beforeLoad as any;

	await expect( beforeLoad( { cause: 'enter' } ) ).rejects.toMatchObject( {
		isRedirect: true,
		href: expect.stringContaining( '/me/reauth-required' ),
		reloadDocument: true,
	} );
} );

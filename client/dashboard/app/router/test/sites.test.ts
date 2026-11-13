/**
 * @vitest-environment jsdom
 */

import { queryClient, siteBySlugQuery } from '@automattic/api-queries';
import { createRouter, defaultParseSearch } from '@tanstack/react-router';
import nock from 'nock';
import { AUTH_QUERY_KEY } from '../../auth';
import { APP_CONTEXT_DEFAULT_CONFIG } from '../../context';
import { rootRoute } from '../root';
import {
	createSitesRoutes,
	siteBackupsRoute,
	siteLogsRoute,
	siteMigrationShareAccessRoute,
	siteOverviewRoute,
	siteRoute,
} from '../sites';
import type { Site, User } from '@automattic/api-core';

const site = {
	ID: 1,
	slug: 'test-site.wordpress.com',
	URL: 'https://test-site.wordpress.com',
	name: 'Test Site',
};

beforeEach( () => {
	queryClient.clear();

	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ site.slug }` )
		.query( true )
		.reply( 200, site );

	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: {} } );
} );

test( 'loads the site overview when the user cannot read media storage', async () => {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ site.ID }/media-storage` )
		.query( true )
		.reply( 403, { error: 'unauthorized', message: 'User cannot view media storage limits' } );

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const loader = siteOverviewRoute.options.loader as any;

	await expect(
		loader( { params: { siteSlug: site.slug }, deps: {}, preload: false } )
	).resolves.toBeUndefined();
} );

test( 'loads a move’s session before showing its site overview', async () => {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ site.ID }/media-storage` )
		.query( true )
		.reply( 200, {} );
	const sessionRequest = nock( 'https://public-api.wordpress.com' )
		.get( '/wpcom/v2/static-site-import-session/abc123' )
		.query( true )
		.reply( 200, { session_id: 'abc123', state: 'capturing' } );

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const loader = siteOverviewRoute.options.loader as any;
	await loader( {
		params: { siteSlug: site.slug },
		deps: { importSessionId: 'abc123' },
		preload: false,
	} );

	expect( sessionRequest.isDone() ).toBe( true );
} );

test( 'loads the site overview when a move’s session can’t be read', async () => {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ site.ID }/media-storage` )
		.query( true )
		.reply( 200, {} );
	nock( 'https://public-api.wordpress.com' )
		.get( '/wpcom/v2/static-site-import-session/abc123' )
		.query( true )
		.reply( 403, { code: 'static_site_import_session_forbidden', message: 'Not yours.' } );

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const loader = siteOverviewRoute.options.loader as any;

	await expect(
		loader( {
			params: { siteSlug: site.slug },
			deps: { importSessionId: 'abc123' },
			preload: false,
		} )
	).resolves.toBeUndefined();
} );

describe( 'siteOverviewRoute search', () => {
	type ValidateSearch = ( search: Record< string, unknown > ) => {
		difmOffer?: string;
		source?: string;
	};

	const validateSearch = siteOverviewRoute.options.validateSearch as unknown as ValidateSearch;

	test( 'keeps the params the DIFM offer deep link opens the modal with', () => {
		const search = validateSearch( defaultParseSearch( '?difmOffer=open&source=site-setup' ) );

		expect( search.difmOffer ).toBe( 'open' );
		expect( search.source ).toBe( 'site-setup' );
	} );

	test( 'keeps the param the DIFM offer thank-you modal opens with', () => {
		const search = validateSearch( defaultParseSearch( '?difmOffer=purchased' ) );

		expect( search.difmOffer ).toBe( 'purchased' );
	} );

	test( 'drops an unknown DIFM offer value', () => {
		const search = validateSearch( defaultParseSearch( '?difmOffer=unknown' ) );

		expect( search.difmOffer ).toBeUndefined();
	} );
} );

describe( 'date range routes search', () => {
	test.each( [
		[ 'siteLogsRoute', siteLogsRoute ],
		[ 'siteBackupsRoute', siteBackupsRoute ],
	] )( '%s normalizes millisecond from/to params to seconds', ( _, route ) => {
		const validateSearch = route.options.validateSearch as unknown as (
			search: Record< string, unknown >
		) => { from?: number; to?: number };

		const search = validateSearch( defaultParseSearch( '?from=1729987200000&to=1730159999000' ) );

		expect( search ).toMatchObject( { from: 1729987200, to: 1730159999 } );
	} );
} );

test( 'returns to the migration overview when Share access cannot read the site', async () => {
	const config = {
		...APP_CONTEXT_DEFAULT_CONFIG,
		supports: { ...APP_CONTEXT_DEFAULT_CONFIG.supports, sites: true },
	};
	createRouter( {
		routeTree: rootRoute.addChildren( createSitesRoutes( config ) ),
		context: { config },
	} );

	nock.cleanAll();
	const request = nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ site.slug }` )
		.query( true )
		.reply( 404, { error: 'unknown_blog', message: 'Unknown site' } );
	const beforeLoad = siteMigrationShareAccessRoute.options.beforeLoad as unknown as ( options: {
		cause: 'enter';
		params: { siteSlug: string };
	} ) => Promise< unknown >;

	await expect(
		beforeLoad( { cause: 'enter', params: { siteSlug: site.slug } } )
	).rejects.toMatchObject( {
		options: { to: '/sites/$siteSlug/migration-overview', params: { siteSlug: site.slug } },
	} );
	expect( request.isDone() ).toBe( true );
} );

describe( 'siteRoute while the site turns Atomic', () => {
	const owner = { ID: 7 } as User;
	const movingSite = {
		ID: 99,
		slug: 'moving-site.wpcomstaging.com',
		site_owner: owner.ID,
		is_wpcom_atomic: true,
		capabilities: {},
		site_migration: {},
	} as unknown as Site;

	const runSiteGuard = ( user: User ) => {
		queryClient.setQueryData( AUTH_QUERY_KEY, user );
		queryClient.setQueryData( siteBySlugQuery( movingSite.slug ).queryKey, movingSite );

		const beforeLoad = siteRoute.options.beforeLoad as unknown as ( options: {
			cause: string;
			params: { siteSlug: string };
			location: { pathname: string };
			matches: [];
		} ) => Promise< void >;

		return beforeLoad( {
			cause: 'enter',
			params: { siteSlug: movingSite.slug },
			location: { pathname: `/sites/${ movingSite.slug }` },
			matches: [],
		} );
	};

	const mockLatestTransfer = () =>
		nock( 'https://public-api.wordpress.com' ).get(
			`/wpcom/v2/sites/${ movingSite.ID }/atomic/transfers/latest`
		);

	afterEach( () => nock.cleanAll() );

	test( 'lets the owner in while the site’s transfer runs', async () => {
		mockLatestTransfer().query( true ).reply( 200, { status: 'active' } );

		await expect( runSiteGuard( owner ) ).resolves.toBeUndefined();
	} );

	test( 'lets the owner in until their capabilities reach the transferred site', async () => {
		mockLatestTransfer().query( true ).reply( 200, { status: 'completed' } );

		await expect( runSiteGuard( owner ) ).resolves.toBeUndefined();
	} );

	test( 'shows not found to the owner when the site isn’t turning Atomic', async () => {
		mockLatestTransfer().query( true ).reply( 200, { status: 'error' } );

		await expect( runSiteGuard( owner ) ).rejects.toMatchObject( { isNotFound: true } );
	} );

	test( 'shows not found to the owner when the site’s transfer can’t be read', async () => {
		mockLatestTransfer()
			.query( true )
			.reply( 403, { code: 'unauthorized', message: 'Not allowed.' } );

		await expect( runSiteGuard( owner ) ).rejects.toMatchObject( { isNotFound: true } );
	} );

	test( 'shows not found to someone else without asking for the transfer', async () => {
		const transferRequest = mockLatestTransfer().query( true ).reply( 200, { status: 'active' } );

		await expect( runSiteGuard( { ID: 8 } as User ) ).rejects.toMatchObject( {
			isNotFound: true,
		} );
		expect( transferRequest.isDone() ).toBe( false );
	} );
} );

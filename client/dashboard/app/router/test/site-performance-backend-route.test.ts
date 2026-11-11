/**
 * @jest-environment jsdom
 */

import { queryClient } from '@automattic/api-queries';
import { createRouter } from '@tanstack/react-router';
import nock from 'nock';
import { APP_CONTEXT_DEFAULT_CONFIG } from '../../context';
import { rootRoute } from '../root';
import {
	createSitesRoutes,
	sitePerformanceBackendIndexRoute,
	sitePerformanceBackendRoute,
	siteSettingsApmRoute,
} from '../sites';

jest.mock( '@automattic/calypso-config', () => {
	const fn = jest.fn( () => '' );
	const isEnabled = jest.fn( ( flag: string ) => flag === 'performance/apm' );
	return Object.assign( fn, { __esModule: true, default: fn, isEnabled } );
} );

const siteSlug = 'test-site.wordpress.com';
const siteId = 1;

function mockIsAutomattician( isAutomattician: boolean ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/read/teams' )
		.reply( 200, {
			number: isAutomattician ? 1 : 0,
			teams: isAutomattician ? [ { slug: 'a8c', title: 'Automatticians' } ] : [],
		} );
}

function mockSite( productSlug: string ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ siteSlug }` )
		.query( true )
		.reply( 200, { ID: siteId, slug: siteSlug, plan: { product_slug: productSlug } } );
}

function mockApmAggregate() {
	return nock( 'https://public-api.wordpress.com' )
		.get( `/wpcom/v2/sites/${ siteId }/hosting/apm/aggregate` )
		.query( true )
		.reply( 200, { aggregates: [] } );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteFn = ( args: any ) => Promise< unknown >;

beforeAll( () => {
	// Building the route tree resolves each route's `fullPath`, which the guards redirect to.
	const config = {
		...APP_CONTEXT_DEFAULT_CONFIG,
		supports: { ...APP_CONTEXT_DEFAULT_CONFIG.supports, sites: true },
	};
	createRouter( {
		routeTree: rootRoute.addChildren( createSitesRoutes( config ) ),
		context: { config },
	} );
} );

beforeEach( () => {
	queryClient.clear();
	nock.cleanAll();
} );

describe( 'sitePerformanceBackendRoute', () => {
	const beforeLoad = sitePerformanceBackendRoute.options.beforeLoad as unknown as RouteFn;

	test( 'sends users who are not Automatticians to Page speed', async () => {
		mockIsAutomattician( false );

		await expect( beforeLoad( { cause: 'enter', params: { siteSlug } } ) ).rejects.toMatchObject( {
			options: {
				to: '/sites/$siteSlug/performance/frontend',
				params: { siteSlug },
				search: { flash: 'route-not-allowed' },
			},
		} );
	} );

	test( 'sends users to Page speed when their teams cannot be read', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/read/teams' )
			.reply( 403, { error: 'unauthorized', message: 'User cannot read teams' } );

		await expect( beforeLoad( { cause: 'enter', params: { siteSlug } } ) ).rejects.toMatchObject( {
			options: {
				to: '/sites/$siteSlug/performance/frontend',
				params: { siteSlug },
				search: { flash: 'route-not-allowed' },
			},
		} );
	} );

	test( 'lets Automatticians through', async () => {
		mockIsAutomattician( true );

		await expect( beforeLoad( { cause: 'enter', params: { siteSlug } } ) ).resolves.toBeUndefined();
	} );

	test( 'skips the check when the route is only preloaded', async () => {
		const teams = mockIsAutomattician( false );

		await expect(
			beforeLoad( { cause: 'preload', params: { siteSlug } } )
		).resolves.toBeUndefined();
		expect( teams.isDone() ).toBe( false );
	} );
} );

describe( 'sitePerformanceBackendIndexRoute', () => {
	const loader = sitePerformanceBackendIndexRoute.options.loader as unknown as RouteFn;

	test( 'loads the APM data on a Business site', async () => {
		mockSite( 'business-bundle' );
		const aggregate = mockApmAggregate();

		await loader( { params: { siteSlug } } );

		expect( aggregate.isDone() ).toBe( true );
	} );

	test( 'skips the APM data on a plan that shows the upsell', async () => {
		mockSite( 'personal-bundle' );
		const aggregate = mockApmAggregate();

		await loader( { params: { siteSlug } } );

		expect( aggregate.isDone() ).toBe( false );
	} );
} );

describe( 'siteSettingsApmRoute', () => {
	const beforeLoad = siteSettingsApmRoute.options.beforeLoad as unknown as RouteFn;

	test( 'sends users who are not Automatticians back to Settings', async () => {
		mockIsAutomattician( false );

		await expect( beforeLoad( { cause: 'enter', params: { siteSlug } } ) ).rejects.toMatchObject( {
			options: {
				to: '/sites/$siteSlug/settings',
				params: { siteSlug },
				search: { flash: 'route-not-allowed' },
			},
		} );
	} );

	test( 'lets Automatticians through', async () => {
		mockIsAutomattician( true );

		await expect( beforeLoad( { cause: 'enter', params: { siteSlug } } ) ).resolves.toBeUndefined();
	} );
} );

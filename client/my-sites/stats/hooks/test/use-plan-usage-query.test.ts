/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import wpcom from 'calypso/lib/wp';
import usePlanUsageQuery, { getUsageLimitStatus, PlanUsage } from '../use-plan-usage-query';

jest.mock( 'calypso/lib/wp', () => ( { req: { get: jest.fn() } } ) );

const get = wpcom.req.get as jest.Mock;

const renderUsageQuery = ( siteId: number | null ) => {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false } },
	} );

	return renderHook( () => usePlanUsageQuery( siteId ), {
		wrapper: ( { children } ) =>
			createElement( QueryClientProvider, { client: queryClient }, children ),
	} );
};

const buildUsage = ( viewsLimit: number, viewsCount: number ): PlanUsage =>
	( {
		views_limit: viewsLimit,
		current_usage: { views_count: viewsCount },
	} ) as PlanUsage;

describe( 'getUsageLimitStatus', () => {
	it( 'is neither near nor over limit well below the threshold', () => {
		expect( getUsageLimitStatus( buildUsage( 100000, 1000 ) ) ).toEqual( {
			isNearLimit: false,
			isOverLimit: false,
		} );
	} );

	it( 'is near limit but not over limit at the 90% threshold', () => {
		expect( getUsageLimitStatus( buildUsage( 100000, 90000 ) ) ).toEqual( {
			isNearLimit: true,
			isOverLimit: false,
		} );
	} );

	it( 'is both near limit and over limit once usage reaches the tier limit', () => {
		expect( getUsageLimitStatus( buildUsage( 100000, 100000 ) ) ).toEqual( {
			isNearLimit: true,
			isOverLimit: true,
		} );
	} );

	it( 'is both near limit and over limit past the tier limit', () => {
		expect( getUsageLimitStatus( buildUsage( 100000, 150000 ) ) ).toEqual( {
			isNearLimit: true,
			isOverLimit: true,
		} );
	} );

	it( 'treats a missing tier limit as neither near nor over limit', () => {
		expect( getUsageLimitStatus( buildUsage( 0, 500 ) ) ).toEqual( {
			isNearLimit: false,
			isOverLimit: false,
		} );
	} );

	it( 'treats undefined usage as neither near nor over limit', () => {
		expect( getUsageLimitStatus( undefined ) ).toEqual( {
			isNearLimit: false,
			isOverLimit: false,
		} );
	} );
} );

describe( 'usePlanUsageQuery', () => {
	afterEach( () => get.mockReset() );

	it( 'does not ask for usage on a site that has no id', () => {
		// A site with no WordPress.com connection has no id and no recorded usage, so the
		// request could only ever 404 — and it fires on the pre-connection pricing screen,
		// where nothing can answer it.
		renderUsageQuery( null );

		expect( get ).not.toHaveBeenCalled();
	} );

	it( 'asks for usage once the site has an id', async () => {
		get.mockResolvedValue( { views_limit: 10000 } );

		renderUsageQuery( 1234 );

		await waitFor( () => expect( get ).toHaveBeenCalled() );
		expect( get ).toHaveBeenCalledWith(
			expect.objectContaining( { path: '/sites/1234/jetpack-stats/usage' } )
		);
	} );
} );

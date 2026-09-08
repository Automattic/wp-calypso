/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { createElement, ReactNode } from 'react';
import { DASHBOARD_SITES_QUERY_KEY } from 'calypso/data/agency-dashboard/use-fetch-dashboard-sites';
import useFetchActiveSites from '../use-fetch-active-sites';
import useIsSiteReady from '../use-is-site-ready';

jest.mock( '../use-fetch-active-sites' );

const mockActiveSites = ( data: unknown ) => {
	( useFetchActiveSites as jest.Mock ).mockReturnValue( { data } );
};

const activeSite = ( id: number ) => ( {
	id,
	url: `https://site-${ id }.wordpress.com`,
	features: { wpcom_atomic: { state: 'active', blog_id: id } },
} );

const provisioningSite = ( id: number ) => ( {
	id,
	features: { wpcom_atomic: { state: 'provisioning' } },
} );

const renderIsSiteReady = ( siteId: number ) => {
	const queryClient = new QueryClient();
	const invalidateQueries = jest.spyOn( queryClient, 'invalidateQueries' );
	const wrapper = ( { children }: { children: ReactNode } ) =>
		createElement( QueryClientProvider, { client: queryClient }, children );

	return { ...renderHook( () => useIsSiteReady( { siteId } ), { wrapper } ), invalidateQueries };
};

describe( 'useIsSiteReady', () => {
	it( 'reports the site once it is active', () => {
		mockActiveSites( [ activeSite( 1 ), activeSite( 2 ) ] );

		const { result } = renderIsSiteReady( 2 );

		expect( result.current.isReady ).toBe( true );
		expect( result.current.site?.id ).toBe( 2 );
	} );

	it( 'is not ready while the site is still provisioning', () => {
		mockActiveSites( [ provisioningSite( 1 ) ] );

		const { result } = renderIsSiteReady( 1 );

		expect( result.current.isReady ).toBe( false );
		expect( result.current.site ).toBeNull();
	} );

	it( 'is not ready while the request is still loading', () => {
		mockActiveSites( undefined );

		const { result } = renderIsSiteReady( 1 );

		expect( result.current.isReady ).toBe( false );
	} );

	it( 'ignores a response that is not a list instead of crashing the page', () => {
		mockActiveSites( { message: 'Something went wrong' } );

		const { result } = renderIsSiteReady( 1 );

		expect( result.current.isReady ).toBe( false );
		expect( result.current.site ).toBeNull();
	} );

	it( 'tolerates a matching site that arrives without feature details', () => {
		mockActiveSites( [ { id: 1 }, { id: 2, features: {} } ] );

		expect( renderIsSiteReady( 1 ).result.current.isReady ).toBe( false );
		expect( renderIsSiteReady( 2 ).result.current.isReady ).toBe( false );
	} );

	it( 'refreshes the sites dashboard list when the site becomes active', () => {
		mockActiveSites( [ provisioningSite( 1 ) ] );

		const { result, rerender, invalidateQueries } = renderIsSiteReady( 1 );

		expect( result.current.isReady ).toBe( false );
		expect( invalidateQueries ).not.toHaveBeenCalled();

		mockActiveSites( [ activeSite( 1 ) ] );
		rerender();

		expect( result.current.isReady ).toBe( true );
		expect( invalidateQueries ).toHaveBeenCalledTimes( 1 );
		expect( invalidateQueries ).toHaveBeenCalledWith( {
			queryKey: [ DASHBOARD_SITES_QUERY_KEY ],
		} );
	} );

	it( 'does not refresh the sites dashboard list while the site is still provisioning', () => {
		mockActiveSites( [ provisioningSite( 1 ) ] );

		const { rerender, invalidateQueries } = renderIsSiteReady( 1 );

		mockActiveSites( [ provisioningSite( 1 ) ] );
		rerender();

		expect( invalidateQueries ).not.toHaveBeenCalled();
	} );
} );

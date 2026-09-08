/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { createElement, ReactNode } from 'react';
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

const renderIsSiteReady = ( siteId: number ) => {
	const queryClient = new QueryClient();
	const wrapper = ( { children }: { children: ReactNode } ) =>
		createElement( QueryClientProvider, { client: queryClient }, children );

	return renderHook( () => useIsSiteReady( { siteId } ), { wrapper } );
};

describe( 'useIsSiteReady', () => {
	it( 'reports the site once it is active', () => {
		mockActiveSites( [ activeSite( 1 ), activeSite( 2 ) ] );

		const { result } = renderIsSiteReady( 2 );

		expect( result.current.isReady ).toBe( true );
		expect( result.current.site?.id ).toBe( 2 );
	} );

	it( 'is not ready while the site is still provisioning', () => {
		mockActiveSites( [ { id: 1, features: { wpcom_atomic: { state: 'provisioning' } } } ] );

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
} );

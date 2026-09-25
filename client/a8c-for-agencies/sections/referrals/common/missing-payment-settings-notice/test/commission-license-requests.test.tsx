/**
 * @jest-environment jsdom
 */

import { referralsQuery } from '@automattic/api-queries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type PropsWithChildren } from 'react';
import useHasCommissionActivity from '../use-has-commission-activity';

jest.mock( 'calypso/state', () => ( { useSelector: () => 1 } ) );
jest.mock(
	'calypso/dashboard/agency/earn/migrations/hooks/use-fetch-tagged-sites-for-migration',
	() => ( { __esModule: true, default: () => ( { data: [], isLoading: false } ) } )
);

const mockGet = jest.fn();
jest.mock( 'calypso/lib/wp', () => ( {
	req: { get: ( ...args: unknown[] ) => mockGet( ...args ) },
} ) );

beforeEach( () => mockGet.mockReset() );

test.each( [ 0, 1, 500 ] )(
	'determines commission activity from one license page when %i licenses match',
	async ( total ) => {
		mockGet.mockImplementation( ( { path }, options ) => {
			if ( path === '/agency/1/sites' ) {
				return Promise.resolve( [] );
			}
			const size = options.per_page;
			return Promise.resolve( {
				items: Array.from(
					{ length: Math.min( size, total - ( options.page - 1 ) * size ) },
					( _, index ) => ( { license_id: ( options.page - 1 ) * size + index, meta: null } )
				),
				total_items: total,
				items_per_page: size,
				total_pages: Math.ceil( total / size ),
			} );
		} );
		const queryClient = new QueryClient( {
			defaultOptions: { queries: { retry: false, staleTime: Infinity } },
		} );
		queryClient.setQueryData( referralsQuery( 1 ).queryKey, [] );
		const wrapper = ( { children }: PropsWithChildren ) =>
			createElement( QueryClientProvider, { client: queryClient }, children );
		const { result } = renderHook( () => useHasCommissionActivity(), { wrapper } );
		await waitFor( () => expect( result.current.isLoading ).toBe( false ) );
		expect( result.current.hasActivity ).toBe( total > 0 );
		const requests = mockGet.mock.calls.filter(
			( [ { path } ] ) => path === '/jetpack-licensing/licenses'
		);
		expect( requests ).toHaveLength( 1 );
		expect( requests[ 0 ][ 1 ] ).toEqual( {
			agency_id: 1,
			search: 'woopayments',
			filter: 'attached',
			page: 1,
			per_page: 1,
			sort_field: 'issued_at',
			sort_direction: 'desc',
		} );
	}
);

test( 'retains no-activity behavior when the license request fails', async () => {
	mockGet.mockImplementation( ( { path } ) =>
		path === '/agency/1/sites' ? Promise.resolve( [] ) : Promise.reject( new Error( 'Offline' ) )
	);
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false, staleTime: Infinity } },
	} );
	queryClient.setQueryData( referralsQuery( 1 ).queryKey, [] );
	const wrapper = ( { children }: PropsWithChildren ) =>
		createElement( QueryClientProvider, { client: queryClient }, children );
	const { result } = renderHook( () => useHasCommissionActivity(), { wrapper } );
	await waitFor( () => expect( result.current.isLoading ).toBe( false ) );
	expect( result.current.hasActivity ).toBe( false );
} );

/**
 * @jest-environment jsdom
 */

import { waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks/dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';
import { useSiteGoals } from '../src/queries/use-site-goals';

jest.mock( 'wpcom-proxy-request' );

const queryClient = new QueryClient();
const wrapper = ( { children } ) => (
	<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
);

const siteId = 1;

describe( 'useSiteGoals', () => {
	it( `returns empty array of goals if no goal was selected`, async () => {
		const goals = [];

		wpcomRequest.mockImplementation( () => Promise.resolve( goals ) );

		const { result } = renderHook( () => useSiteGoals( siteId ), { wrapper } );

		await waitFor( () => {
			return result.current.isSuccess;
		} );

		expect( result.current.data ).toHaveLength( 0 );
		expect( result.current.data ).toEqual( [] );
	} );

	it( `returns the array of goals if any`, async () => {
		const goals = [ 'promote', 'write' ];

		wpcomRequest.mockImplementation( () => Promise.resolve( goals ) );

		const { result } = renderHook( () => useSiteGoals( siteId ), { wrapper } );

		await waitFor( () => {
			return result.current.isSuccess;
		} );

		expect( result.current.data ).toHaveLength( 2 );
		expect( result.current.data ).toEqual( [ 'promote', 'write' ] );
	} );
} );

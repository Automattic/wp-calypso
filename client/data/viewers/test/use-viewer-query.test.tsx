/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import useViewerQuery from '../use-viewer-query';
import type { PropsWithChildren } from 'react';

const mockGet = jest.fn();
jest.mock( 'calypso/lib/wp', () => ( {
	req: { get: ( ...args: unknown[] ) => mockGet( ...args ) },
} ) );

let queryClient: QueryClient;
beforeEach( () => {
	queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	mockGet.mockReset();
} );
afterEach( () => queryClient.clear() );

function wrapper( { children }: PropsWithChildren ) {
	return <QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>;
}

test( 'keeps the same viewer’s site-specific invitation data separate', async () => {
	const first = { ID: 42, invite_key: 'site-one-invite' };
	const second = { ID: 42, invite_key: 'site-two-invite' };
	mockGet.mockImplementation( ( { path } ) =>
		Promise.resolve( path.includes( '/sites/1/' ) ? first : second )
	);
	const firstHook = renderHook( () => useViewerQuery( 1, 42 ), { wrapper } );
	const secondHook = renderHook( () => useViewerQuery( 2, 42 ), { wrapper } );
	await waitFor( () => {
		expect( firstHook.result.current.isSuccess ).toBe( true );
		expect( secondHook.result.current.isSuccess ).toBe( true );
	} );
	expect( firstHook.result.current.data ).toEqual( first );
	expect( secondHook.result.current.data ).toEqual( second );
	expect( mockGet ).toHaveBeenCalledTimes( 2 );
} );

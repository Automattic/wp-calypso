/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { fetchPressableReturn } from '../lib';
import usePressableReturn from '../use-pressable-return';
import type { ReactNode } from 'react';

jest.mock( '../lib', () => ( {
	...jest.requireActual( '../lib' ),
	fetchPressableReturn: jest.fn(),
} ) );

const fetchReturn = fetchPressableReturn as jest.Mock;
const assign = jest.fn();
const originalLocation = window.location;
const signedUrl =
	'https://my.pressable.com/titan_email/checkout_return?timestamp=123&signature=signed';

function wrapper( { children }: { children: ReactNode } ) {
	return <QueryClientProvider client={ new QueryClient() }>{ children }</QueryClientProvider>;
}

beforeAll( () => {
	Object.defineProperty( window, 'location', { value: { assign }, configurable: true } );
} );

afterAll( () => {
	Object.defineProperty( window, 'location', { value: originalLocation, configurable: true } );
} );

beforeEach( () => {
	fetchReturn.mockReset();
	assign.mockReset();
} );

it( 'waits for the fresh authenticated result before navigating', async () => {
	let resolve: ( url: string ) => void = () => {};
	fetchReturn.mockReturnValue( new Promise< string >( ( done ) => ( resolve = done ) ) );
	renderHook( () => usePressableReturn( { agencyId: '42', receiptId: '99' } ), { wrapper } );
	await waitFor( () => expect( fetchReturn ).toHaveBeenCalledTimes( 1 ) );
	expect( assign ).not.toHaveBeenCalled();
	await act( async () => resolve( signedUrl ) );
	expect( assign ).toHaveBeenCalledWith( signedUrl );
} );

it( 'keeps an error on the return page and retries with a fresh request', async () => {
	fetchReturn
		.mockRejectedValueOnce( new Error( 'Unavailable.' ) )
		.mockResolvedValueOnce( signedUrl );
	const { result } = renderHook( () => usePressableReturn( { agencyId: '42', canceled: '1' } ), {
		wrapper,
	} );
	await waitFor( () => expect( result.current.isError ).toBe( true ) );
	expect( assign ).not.toHaveBeenCalled();
	act( () => result.current.retry() );
	await waitFor( () => expect( assign ).toHaveBeenCalledWith( signedUrl ) );
	expect( fetchReturn ).toHaveBeenCalledTimes( 2 );
} );

it( 'ignores a response after leaving the return page', async () => {
	let resolve: ( url: string ) => void = () => {};
	fetchReturn.mockReturnValue( new Promise< string >( ( done ) => ( resolve = done ) ) );
	const { unmount } = renderHook( () => usePressableReturn( { agencyId: '42', receiptId: '99' } ), {
		wrapper,
	} );
	await waitFor( () => expect( fetchReturn ).toHaveBeenCalledTimes( 1 ) );
	unmount();
	await act( async () => resolve( signedUrl ) );
	expect( assign ).not.toHaveBeenCalled();
} );

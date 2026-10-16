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
	'https://my.pressable.com/titan_email/checkout_return?agency_id=42-cli-7&timestamp=123&signature=signed';

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

it( 'retains client receipt context on retry without a cart or stored URL', async () => {
	fetchReturn
		.mockRejectedValueOnce( new Error( 'Unavailable.' ) )
		.mockResolvedValueOnce( signedUrl );
	const { result } = renderHook(
		() => usePressableReturn( { agencyId: '42', referralId: '99', receiptId: '501' } ),
		{ wrapper }
	);
	await waitFor( () => expect( result.current.isError ).toBe( true ) );
	act( () => result.current.retry() );
	await waitFor( () => expect( assign ).toHaveBeenCalledWith( signedUrl ) );
	expect( fetchReturn ).toHaveBeenLastCalledWith( {
		agencyId: '42',
		referralId: '99',
		receiptId: '501',
		orderId: undefined,
	} );
} );

it( 'fetches client SUCCESS again after a reload using only receipt context', async () => {
	fetchReturn.mockResolvedValue( signedUrl );
	const params = { agencyId: '42', referralId: '99', receiptId: '501' };
	const initial = renderHook( () => usePressableReturn( params ), { wrapper } );
	await waitFor( () => expect( assign ).toHaveBeenCalledTimes( 1 ) );
	initial.unmount();
	renderHook( () => usePressableReturn( params ), { wrapper } );
	await waitFor( () => expect( assign ).toHaveBeenCalledTimes( 2 ) );
	expect( fetchReturn ).toHaveBeenCalledTimes( 2 );
	expect( fetchReturn ).toHaveBeenLastCalledWith( { ...params, orderId: undefined } );
} );

/**
 * @vitest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import { type Mock, vi } from 'vitest';
import wp from 'calypso/lib/wp';
import { logQrAppLoginError } from '../log-error';
import { useStatus } from '../use-status';

vi.mock( 'calypso/lib/wp', () => ( {
	__esModule: true,
	default: { req: { get: vi.fn() } },
} ) );

vi.mock( '../log-error', () => ( {
	logQrAppLoginError: vi.fn(),
} ) );

const mockedGet = wp.req.get as Mock;

function makeWrapper() {
	const client = new QueryClient( {
		defaultOptions: { queries: { retry: false } },
	} );
	const wrapper = ( { children }: { children: React.ReactNode } ) =>
		createElement( QueryClientProvider, { client }, children );
	return { wrapper, client };
}

beforeEach( () => {
	vi.clearAllMocks();
} );

describe( 'useStatus', () => {
	it( 'does not fire when token is undefined', () => {
		const { wrapper } = makeWrapper();
		renderHook( () => useStatus( undefined ), { wrapper } );

		expect( mockedGet ).not.toHaveBeenCalled();
	} );

	it( 'returns parsed data on a known status', async () => {
		mockedGet.mockResolvedValueOnce( { status: 'pending' } );
		const { wrapper } = makeWrapper();

		const { result } = renderHook( () => useStatus( 't' ), { wrapper } );

		await waitFor( () => expect( result.current.data?.status ).toBe( 'pending' ) );
	} );

	it( 'throws on an unknown status payload', async () => {
		mockedGet.mockResolvedValueOnce( { status: 'cancelled' } );
		const { wrapper } = makeWrapper();

		const { result } = renderHook( () => useStatus( 't' ), { wrapper } );

		await waitFor( () => expect( result.current.isError ).toBe( true ) );
		expect( result.current.error?.message ).toMatch( /Unrecognized.*cancelled/ );
	} );

	it( 'throws on a missing-status payload', async () => {
		mockedGet.mockResolvedValueOnce( { foo: 'bar' } );
		const { wrapper } = makeWrapper();

		const { result } = renderHook( () => useStatus( 't' ), { wrapper } );

		await waitFor( () => expect( result.current.isError ).toBe( true ) );
	} );

	it( 'changes the queryKey when the token changes (no cache leak)', async () => {
		mockedGet.mockResolvedValue( { status: 'pending' } );
		const { wrapper } = makeWrapper();

		const { result, rerender } = renderHook(
			( { token }: { token: string } ) => useStatus( token ),
			{ wrapper, initialProps: { token: 'a' } }
		);

		await waitFor( () => expect( result.current.data?.status ).toBe( 'pending' ) );
		expect( mockedGet ).toHaveBeenCalledWith( expect.anything(), { token: 'a' } );

		rerender( { token: 'b' } );

		await waitFor( () =>
			expect( mockedGet ).toHaveBeenCalledWith( expect.anything(), { token: 'b' } )
		);
	} );

	it( 'logs to logstash when the query errors', async () => {
		mockedGet.mockRejectedValueOnce( new Error( 'boom' ) );
		const { wrapper } = makeWrapper();

		const { result } = renderHook( () => useStatus( 't' ), { wrapper } );

		await waitFor( () => expect( result.current.isError ).toBe( true ) );
		expect( logQrAppLoginError ).toHaveBeenCalledWith( 'status', expect.any( Error ) );
	} );
} );

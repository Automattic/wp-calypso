/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act, waitFor } from '@testing-library/react';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import { useSiteTransferStatusQuery } from '../use-site-transfer-status-query';

const mockGetStatus = jest.fn();

jest.mock( 'calypso/lib/wp', () => ( {
	req: { get: ( ...args: unknown[] ) => mockGetStatus( ...args ) },
} ) );

// The hook's own test-mode constants: 300ms between polls, a 6s watch on `none`, a 30s deadline
// on a live transfer.
const POLL_MS = 300;

const respondWith = ( status: string ) => mockGetStatus.mockResolvedValue( { status } );

const renderQuery = () => {
	const client = new QueryClient( {
		defaultOptions: { queries: { retry: false, gcTime: 0 } },
	} );
	return renderHook( () => useSiteTransferStatusQuery( 1 ), {
		wrapper: ( { children } ) => (
			<QueryClientProvider client={ client }>{ children }</QueryClientProvider>
		),
	} );
};

// Advance a poll at a time, flushing between: each refetch has to resolve before the query can
// schedule the next one, so one big jump would silently count a single poll.
const elapse = async ( ms: number ) => {
	for ( let elapsed = 0; elapsed < ms; elapsed += POLL_MS ) {
		await act( async () => {
			jest.advanceTimersByTime( POLL_MS );
			await Promise.resolve();
		} );
	}
};

describe( 'useSiteTransferStatusQuery', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		jest.useFakeTimers();
	} );
	afterEach( () => jest.useRealTimers() );

	it( 'watches briefly for a transfer started in another tab', async () => {
		respondWith( transferStates.NONE );
		renderQuery();
		await waitFor( () => expect( mockGetStatus ).toHaveBeenCalled() );

		await elapse( POLL_MS * 4 );
		expect( mockGetStatus.mock.calls.length ).toBeGreaterThan( 1 );
	} );

	// The bug: a site with no transfer polled every 3s for as long as the tab lived. Eleven
	// forgotten tabs produced 96% of the traffic on this endpoint.
	it( 'stops polling a site that has no transfer', async () => {
		respondWith( transferStates.NONE );
		renderQuery();
		await waitFor( () => expect( mockGetStatus ).toHaveBeenCalled() );

		await elapse( 10_000 );
		const settled = mockGetStatus.mock.calls.length;

		await elapse( 60_000 );
		expect( mockGetStatus.mock.calls.length ).toBe( settled );
	} );

	it( 'keeps polling a transfer that is genuinely running', async () => {
		respondWith( transferStates.ACTIVE );
		renderQuery();
		await waitFor( () => expect( mockGetStatus ).toHaveBeenCalled() );

		await elapse( 10_000 );
		expect( mockGetStatus.mock.calls.length ).toBeGreaterThan( 5 );
	} );

	it( 'gives up on a transfer that never leaves its status', async () => {
		respondWith( transferStates.ACTIVE );
		renderQuery();
		await waitFor( () => expect( mockGetStatus ).toHaveBeenCalled() );

		await elapse( 40_000 );
		const settled = mockGetStatus.mock.calls.length;

		await elapse( 40_000 );
		expect( mockGetStatus.mock.calls.length ).toBe( settled );
	} );

	it( 'does not poll a site whose transfer already finished', async () => {
		respondWith( transferStates.COMPLETED );
		renderQuery();
		await waitFor( () => expect( mockGetStatus ).toHaveBeenCalled() );

		await elapse( 10_000 );
		expect( mockGetStatus ).toHaveBeenCalledTimes( 1 );
	} );
} );

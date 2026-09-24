/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act, waitFor } from '@testing-library/react';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import {
	getSiteTransferStatusQueryKey,
	useSiteTransferStatusQuery,
} from '../use-site-transfer-status-query';

const mockGetStatus = jest.fn();

jest.mock( 'calypso/lib/wp', () => ( {
	req: { get: ( ...args: unknown[] ) => mockGetStatus( ...args ) },
} ) );

// Test-mode constants: 300ms per poll, 6s watch on `none`, 30s transfer deadline.
const POLL_MS = 300;

const respondWith = ( status: string ) => mockGetStatus.mockResolvedValue( { status } );

const makeClient = () => new QueryClient( { defaultOptions: { queries: { gcTime: Infinity } } } );

const renderQuery = ( siteId = 1, client = makeClient() ) =>
	renderHook( ( props: { siteId: number } ) => useSiteTransferStatusQuery( props.siteId ), {
		initialProps: { siteId },
		wrapper: ( { children } ) => (
			<QueryClientProvider client={ client }>{ children }</QueryClientProvider>
		),
	} );

// One poll at a time, flushing between: a refetch must resolve before the next is scheduled.
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

	// The bug: 11 forgotten tabs made 96% of this endpoint's traffic.
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

	// Same phase for both sites, so an unkeyed window hands the second one a spent clock.
	it( 'gives a newly selected site its own watch window', async () => {
		respondWith( transferStates.NONE );
		const client = makeClient();
		client.setQueryData( getSiteTransferStatusQueryKey( 2 ), { status: transferStates.NONE } );

		const { rerender } = renderQuery( 1, client );
		await waitFor( () => expect( mockGetStatus ).toHaveBeenCalled() );

		await elapse( 10_000 );

		rerender( { siteId: 2 } );
		const afterFirstSite = mockGetStatus.mock.calls.length;

		// A full window of polls, not the handful a spent clock allows before stopping.
		await elapse( 3000 );
		expect( mockGetStatus.mock.calls.length - afterFirstSite ).toBeGreaterThanOrEqual( 8 );
	} );

	// Retries run on their own schedule, outliving the interval the window already closed.
	it( 'stops retrying a failing poll once the window has closed', async () => {
		respondWith( transferStates.NONE );
		renderQuery();
		await waitFor( () => expect( mockGetStatus ).toHaveBeenCalled() );

		mockGetStatus.mockRejectedValue( new Error( 'gateway timeout' ) );
		await elapse( 20_000 );
		const settled = mockGetStatus.mock.calls.length;

		await elapse( 60_000 );
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

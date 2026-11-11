/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useCheckSiteTransferStatus } from '../use-check-site-transfer-status';

const mockDispatch = jest.fn();
let mockTransfer: { status: string; is_stuck?: boolean } | undefined;

jest.mock( 'calypso/state', () => ( {
	useDispatch: () => mockDispatch,
	useSelector: ( selector: ( state: unknown ) => unknown ) => selector( {} ),
} ) );

jest.mock( 'calypso/state/atomic/transfers/selectors', () => ( {
	getLatestAtomicTransfer: () => ( { transfer: mockTransfer } ),
} ) );

jest.mock( 'calypso/state/atomic/transfers/actions', () => ( {
	requestLatestAtomicTransfer: ( siteId: number ) => ( { type: 'REQUEST_TRANSFER', siteId } ),
} ) );

jest.mock( 'calypso/state/sites/actions', () => ( {
	requestSite: ( siteId: number ) => ( { type: 'REQUEST_SITE', siteId } ),
} ) );

const POLL_MS = 5000;

// One interval at a time: a dispatch has to settle before the next tick is scheduled.
const elapse = async ( ms: number ) => {
	for ( let elapsed = 0; elapsed < ms; elapsed += POLL_MS ) {
		await act( async () => {
			jest.advanceTimersByTime( POLL_MS );
			await Promise.resolve();
		} );
	}
};

const pollCount = () =>
	mockDispatch.mock.calls.filter( ( [ action ] ) => action?.type === 'REQUEST_TRANSFER' ).length;

const renderStatus = ( siteId = 1 ) =>
	renderHook( ( props: { siteId: number } ) => useCheckSiteTransferStatus( props ), {
		initialProps: { siteId, intervalTime: POLL_MS },
	} );

describe( 'useCheckSiteTransferStatus', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		jest.useFakeTimers();
		mockTransfer = { status: 'active' };
	} );
	afterEach( () => jest.useRealTimers() );

	it( 'polls while the transfer is running', async () => {
		const { result } = renderStatus();
		await elapse( 30_000 );

		expect( result.current.isTransferring ).toBe( true );
		expect( pollCount() ).toBeGreaterThan( 4 );
	} );

	// The bug: nothing ever ended this poll, so a stalled transfer kept a request going every
	// five seconds for the life of the tab, under a notice that could never resolve.
	it( 'stops polling and stops claiming activation once the wait runs out', async () => {
		const { result } = renderStatus();
		await elapse( 60_000 );
		expect( result.current.wasTransferring ).toBe( true );

		await elapse( 5 * 60 * 1000 );
		const settled = pollCount();
		expect( result.current.isTransferring ).toBe( false );
		expect( result.current.wasTransferring ).toBe( false );

		await elapse( 60_000 );
		expect( pollCount() ).toBe( settled );
	} );

	it( 'never starts a poll for a transfer the server already calls stuck', async () => {
		mockTransfer = { status: 'active', is_stuck: true };
		const { result } = renderStatus();
		await elapse( 30_000 );

		expect( result.current.isTransferring ).toBe( false );
		// Only the mount request, no interval on top of it.
		expect( pollCount() ).toBe( 1 );
	} );

	it.each( [ 'reverted', 'reverting', 'relocating_revert', 'exporting', 'cleanup' ] )(
		'reports a transfer in %s as failed',
		async ( status ) => {
			mockTransfer = { status };
			const { result } = renderStatus();
			await elapse( 10_000 );

			expect( result.current.isErrored ).toBe( true );
			expect( result.current.isTransferring ).toBe( false );
		}
	);

	it( 'still treats a completed transfer as a success', async () => {
		mockTransfer = { status: 'completed' };
		const { result } = renderStatus();
		await elapse( 10_000 );

		expect( result.current.isTransferCompleted ).toBe( true );
		expect( result.current.isErrored ).toBe( false );
	} );

	// The hook outlives a site switch for any consumer that does not remount it by key.
	it( 'starts a newly selected site on its own clock', async () => {
		const { result, rerender } = renderStatus( 1 );
		await elapse( 5 * 60 * 1000 + 60_000 );
		expect( result.current.wasTransferring ).toBe( false );

		rerender( { siteId: 2, intervalTime: POLL_MS } );
		await elapse( 30_000 );

		expect( result.current.isTransferring ).toBe( true );
		expect( result.current.wasTransferring ).toBe( true );
	} );
} );

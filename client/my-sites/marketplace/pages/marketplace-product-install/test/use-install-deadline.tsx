/**
 * @jest-environment jsdom
 */
import { act } from '@testing-library/react';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import {
	INSTALL_DEADLINE_MS,
	clearInstallAnchor,
	useInstallDeadline,
} from '../use-install-deadline';

const mockFetchLatestAtomicTransfer = jest.fn();

jest.mock( '@automattic/api-core', () => ( {
	...jest.requireActual( '@automattic/api-core' ),
	fetchLatestAtomicTransfer: ( siteId: number ) => mockFetchLatestAtomicTransfer( siteId ),
} ) );

const SITE_ID = 1;
const SLUG = 'js-composer';

const renderDeadline = ( enabled = true ) =>
	renderHookWithProvider( () =>
		useInstallDeadline( { siteId: SITE_ID, productSlug: SLUG, enabled } )
	);

// Modern fake timers move the wall clock along with the timers, which is what the hook re-reads.
const advance = async ( ms: number ) => {
	await act( async () => {
		jest.advanceTimersByTime( ms );
	} );
};

describe( 'useInstallDeadline', () => {
	beforeEach( () => {
		jest.useFakeTimers();
		jest.setSystemTime( new Date( '2026-08-03T12:00:00Z' ) );
		window.sessionStorage.clear();
		mockFetchLatestAtomicTransfer.mockRejectedValue(
			Object.assign( new Error( '404' ), { status: 404 } )
		);
	} );
	afterEach( () => {
		jest.useRealTimers();
		jest.clearAllMocks();
	} );

	it( 'does not time out while the wait is still within the deadline', async () => {
		const { result } = renderDeadline();

		await advance( INSTALL_DEADLINE_MS - 10000 );

		expect( result.current.hasTimedOut ).toBe( false );
	} );

	it( 'times out once the wait passes the deadline', async () => {
		const { result } = renderDeadline();

		await advance( INSTALL_DEADLINE_MS + 10000 );

		expect( result.current.hasTimedOut ).toBe( true );
	} );

	// Refreshing is the natural reaction to a bar that has stopped moving, and a mount-anchored
	// timer would hand the customer a fresh five minutes every time they did it.
	it( 'keeps the deadline across a remount, so a refresh cannot restart the clock', async () => {
		const first = renderDeadline();
		await advance( INSTALL_DEADLINE_MS - 10000 );
		first.unmount();

		const { result } = renderDeadline();
		await advance( 20000 );

		expect( result.current.hasTimedOut ).toBe( true );
	} );

	it( 'starts a fresh clock once the previous attempt is retired', async () => {
		const first = renderDeadline();
		await advance( INSTALL_DEADLINE_MS - 10000 );
		first.unmount();
		clearInstallAnchor( SITE_ID, SLUG );

		const { result } = renderDeadline();
		await advance( 20000 );

		expect( result.current.hasTimedOut ).toBe( false );
	} );

	it( 'stays disarmed when the wait is not running', async () => {
		const { result } = renderDeadline( false );

		await advance( INSTALL_DEADLINE_MS * 2 );

		expect( result.current.hasTimedOut ).toBe( false );
		expect( result.current.hasTransferFailed ).toBe( false );
	} );

	it( 'reports a current transfer that failed', async () => {
		mockFetchLatestAtomicTransfer.mockResolvedValue( {
			status: 'error',
			created_at: new Date( Date.now() - 30000 ).toISOString(),
		} );

		const { result } = renderDeadline();
		await advance( 15000 );

		expect( result.current.hasTransferFailed ).toBe( true );
	} );

	// The trap the persisted Redux slice falls into: an old transfer's failure is not evidence
	// about the install running now.
	it( 'ignores a failure from a transfer too old to belong to this attempt', async () => {
		mockFetchLatestAtomicTransfer.mockResolvedValue( {
			status: 'error',
			created_at: new Date( Date.now() - 6 * 60 * 60 * 1000 ).toISOString(),
		} );

		const { result } = renderDeadline();
		await advance( 15000 );

		expect( result.current.hasTransferFailed ).toBe( false );
		expect( result.current.hasTimedOut ).toBe( false );
	} );

	// Checkout starts the transfer server-side, so the wait the customer sees began before the page
	// they are looking at ever mounted.
	it( 'counts the wait from the transfer the checkout already started', async () => {
		mockFetchLatestAtomicTransfer.mockResolvedValue( {
			status: 'active',
			created_at: new Date( Date.now() - ( INSTALL_DEADLINE_MS - 20000 ) ).toISOString(),
		} );

		const { result } = renderDeadline();
		await advance( 30000 );

		expect( result.current.hasTimedOut ).toBe( true );
	} );

	// A retry after a timed-out attempt must not inherit the old clock: the anchor is retired when
	// the wait is called off, so the next mount starts fresh.
	it( 'starts a fresh clock for a retry after the wait was called off', async () => {
		const first = renderDeadline();
		await advance( INSTALL_DEADLINE_MS + 10000 );
		expect( first.result.current.hasTimedOut ).toBe( true );
		first.unmount();

		const { result } = renderDeadline();
		await advance( 20000 );

		expect( result.current.hasTimedOut ).toBe( false );
	} );

	// A retry whose transfer is already visible server-side moves the clock to it, even if a stale
	// anchor from the previous attempt survived.
	it( 'moves the clock to a newer transfer instead of a stale anchor', async () => {
		window.sessionStorage.setItem(
			`marketplace-install-started-at:${ SITE_ID }:${ SLUG }`,
			String( Date.now() - ( INSTALL_DEADLINE_MS + 60000 ) )
		);
		mockFetchLatestAtomicTransfer.mockResolvedValue( {
			status: 'active',
			created_at: new Date( Date.now() - 30000 ).toISOString(),
		} );

		const { result } = renderDeadline();
		await advance( 15000 );

		expect( result.current.hasTimedOut ).toBe( false );
	} );

	// On the upload flow the new transfer is not created until the upload finishes, so early polls
	// still return the previous attempt's failed transfer. It is recent, but it is not this
	// attempt's failure. (Three minutes old: beyond the pre-mount grace, within the deadline.)
	it( 'does not report a recent failure from the previous attempt as this attempt failing', async () => {
		mockFetchLatestAtomicTransfer.mockResolvedValue( {
			status: 'error',
			created_at: new Date( Date.now() - 3 * 60 * 1000 ).toISOString(),
		} );

		const { result } = renderDeadline();
		await advance( 15000 );

		expect( result.current.hasTransferFailed ).toBe( false );
		expect( result.current.hasTimedOut ).toBe( false );
	} );

	// ...but once this mount has watched that transfer running, its failure is this attempt's.
	it( 'reports a failure after watching the transfer run', async () => {
		mockFetchLatestAtomicTransfer.mockResolvedValue( {
			status: 'active',
			created_at: new Date( Date.now() - 3 * 60 * 1000 ).toISOString(),
		} );

		const { result, rerender } = renderDeadline();
		await advance( 15000 );

		mockFetchLatestAtomicTransfer.mockResolvedValue( {
			status: 'error',
			created_at: new Date( Date.now() - 3 * 60 * 1000 ).toISOString(),
		} );
		rerender();
		await advance( 15000 );

		expect( result.current.hasTransferFailed ).toBe( true );
	} );
} );

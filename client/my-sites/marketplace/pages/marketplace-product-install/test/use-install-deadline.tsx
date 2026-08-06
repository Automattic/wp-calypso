/**
 * @jest-environment jsdom
 */
import { act } from '@testing-library/react';
import { useState } from 'react';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import { INSTALL_DEADLINE_MS, useInstallDeadline } from '../use-install-deadline';

const mockFetchLatestAtomicTransfer = jest.fn();

jest.mock( '@automattic/api-core', () => ( {
	...jest.requireActual( '@automattic/api-core' ),
	fetchLatestAtomicTransfer: ( siteId: number ) => mockFetchLatestAtomicTransfer( siteId ),
} ) );

const SITE_ID = 1;

const transfer = ( {
	id = 10,
	status,
	agoMs = 0,
}: {
	id?: number;
	status: string;
	agoMs?: number;
} ) => ( {
	atomic_transfer_id: id,
	blog_id: SITE_ID,
	status,
	created_at: new Date( Date.now() - agoMs ).toISOString(),
	is_stuck: false,
	is_stuck_reset: false,
	in_lossless_revert: false,
} );

const renderDeadline = ( enabled = true ) =>
	renderHookWithProvider( () => useInstallDeadline( { siteId: SITE_ID, enabled } ) );

// Lets a test flip `enabled`, which is what an async preflight error does to a live wait.
const renderSwitchableDeadline = () => {
	let setEnabled: ( value: boolean ) => void = () => {};
	const rendered = renderHookWithProvider( () => {
		const [ enabled, set ] = useState( true );
		setEnabled = set;
		return useInstallDeadline( { siteId: SITE_ID, enabled } );
	} );
	return { ...rendered, setEnabled: ( value: boolean ) => act( () => setEnabled( value ) ) };
};

// Modern fake timers move the wall clock along with the timers, which is what the hook re-reads.
const advance = async ( ms: number ) => {
	await act( async () => {
		jest.advanceTimersByTime( ms );
	} );
};

describe( 'useInstallDeadline', () => {
	beforeEach( () => {
		jest.useFakeTimers();
		jest.setSystemTime( new Date( '2026-08-06T12:00:00Z' ) );
		mockFetchLatestAtomicTransfer.mockRejectedValue(
			Object.assign( new Error( '404' ), { status: 404 } )
		);
	} );
	afterEach( () => {
		jest.useRealTimers();
		jest.clearAllMocks();
	} );

	it( 'does not time out inside the deadline', async () => {
		const { result } = renderDeadline();
		await advance( INSTALL_DEADLINE_MS - 10000 );
		expect( result.current.hasTimedOut ).toBe( false );
	} );

	it( 'times out once the deadline passes', async () => {
		const { result } = renderDeadline();
		await advance( INSTALL_DEADLINE_MS + 10000 );
		expect( result.current.hasTimedOut ).toBe( true );
	} );

	it( 'stays disarmed when the wait is not running', async () => {
		const { result } = renderDeadline( false );
		await advance( INSTALL_DEADLINE_MS * 2 );
		expect( result.current.hasTimedOut ).toBe( false );
		expect( result.current.hasTransferFailed ).toBe( false );
	} );

	// The transfer checkout started is the thing being waited on, and the server's own record of
	// when it began is what a refresh cannot reset.
	it( 'counts the wait from a running transfer that started before this page', async () => {
		mockFetchLatestAtomicTransfer.mockResolvedValue(
			transfer( { status: 'active', agoMs: INSTALL_DEADLINE_MS - 20000 } )
		);

		const { result } = renderDeadline();
		await advance( 30000 );

		expect( result.current.hasTimedOut ).toBe( true );
	} );

	it( 'reports a transfer that errored after this wait watched it running', async () => {
		mockFetchLatestAtomicTransfer.mockResolvedValue( transfer( { status: 'active' } ) );
		const { result, rerender } = renderDeadline();
		await advance( 6000 );

		mockFetchLatestAtomicTransfer.mockResolvedValue( transfer( { status: 'error' } ) );
		rerender();
		await advance( 6000 );

		expect( result.current.hasTransferFailed ).toBe( true );
	} );

	// The endpoint returns the site's latest transfer, not ours. On the upload flow no new transfer
	// exists until the upload finishes, so the previous attempt's failure is what comes back.
	it( 'ignores a failed transfer this wait never watched running', async () => {
		mockFetchLatestAtomicTransfer.mockResolvedValue(
			transfer( { id: 99, status: 'error', agoMs: 3 * 60 * 1000 } )
		);

		const { result } = renderDeadline();
		await advance( 10000 );

		expect( result.current.hasTransferFailed ).toBe( false );
	} );

	// Attribution is by transfer id, so a revert of a different transfer is not this wait's failure.
	it( 'ignores a revert of a transfer other than the one being watched', async () => {
		mockFetchLatestAtomicTransfer.mockResolvedValue( transfer( { id: 10, status: 'active' } ) );
		const { result, rerender } = renderDeadline();
		await advance( 6000 );

		mockFetchLatestAtomicTransfer.mockResolvedValue(
			transfer( { id: 77, status: 'reverted', agoMs: 60000 } )
		);
		rerender();
		await advance( 6000 );

		expect( result.current.hasTransferFailed ).toBe( false );
	} );

	it( 'reports a revert of the transfer it watched running', async () => {
		mockFetchLatestAtomicTransfer.mockResolvedValue( transfer( { id: 10, status: 'active' } ) );
		const { result, rerender } = renderDeadline();
		await advance( 6000 );

		mockFetchLatestAtomicTransfer.mockResolvedValue( transfer( { id: 10, status: 'reverted' } ) );
		rerender();
		await advance( 6000 );

		expect( result.current.hasTransferFailed ).toBe( true );
	} );

	// An async preflight error takes over mid-wait. The attempt is over, so whatever the customer
	// tries next must not inherit its elapsed clock.
	it( 'starts a fresh clock when the wait is disabled and then resumes', async () => {
		const { result, setEnabled } = renderSwitchableDeadline();
		await advance( INSTALL_DEADLINE_MS - 20000 );

		setEnabled( false );
		setEnabled( true );
		await advance( 40000 );

		expect( result.current.hasTimedOut ).toBe( false );
	} );
} );

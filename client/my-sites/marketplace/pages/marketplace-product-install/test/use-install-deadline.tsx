/**
 * @jest-environment jsdom
 */
import { siteLatestAtomicTransferQuery } from '@automattic/api-queries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import React, { useState } from 'react';
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

	// The wait is disabled for as long as the browser is sending a large upload. That time belongs
	// to the customer's connection, so the clock must start when the wait does, not carry the gap.
	it( 'does not charge time spent disabled to the wait that follows it', async () => {
		const { result, setEnabled } = renderSwitchableDeadline();
		setEnabled( false );

		await advance( INSTALL_DEADLINE_MS * 2 );
		setEnabled( true );
		await advance( 20000 );

		expect( result.current.hasTimedOut ).toBe( false );
	} );

	// A page that has been open a while can hold a transfer snapshot older than the deadline. Acting
	// on it would time out an install that has since finished, and the outcome latches.
	it( 'ignores a cached transfer until a fetch of its own has landed', async () => {
		const queryClient = new QueryClient( {
			defaultOptions: { queries: { retry: false } },
		} );
		queryClient.setQueryData(
			siteLatestAtomicTransferQuery( SITE_ID ).queryKey,
			transfer( { status: 'active', agoMs: INSTALL_DEADLINE_MS * 2 } )
		);
		// Whatever this mount asks for comes back settled: the install finished while the page sat.
		mockFetchLatestAtomicTransfer.mockResolvedValue( transfer( { status: 'completed' } ) );

		const wrapper = ( { children }: { children: React.ReactNode } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);
		const { result } = renderHook( () => useInstallDeadline( { siteId: SITE_ID, enabled: true } ), {
			wrapper,
		} );

		await advance( 100 );

		expect( result.current.hasTimedOut ).toBe( false );
	} );
} );

/**
 * @jest-environment jsdom
 */
let mockSessionId: string;
jest.mock( '../../contexts', () => ( {
	useAgentsManagerContext: () => ( { getTabSessionId: () => mockSessionId } ),
} ) );

import { renderHook } from '@testing-library/react';
import {
	markContinuationSent,
	NAVIGATION_PENDING_EVENT,
	savePendingNavigation,
} from '../../utils/wp-admin-navigation-state';
import { useNavigationContinuation } from '../use-navigation-continuation';

const STORAGE_KEY = 'agents-manager-pending-navigation';
const SENT_KEY = 'agents-manager-navigation-continuation-sent';

function renderContinuation(
	overrides: { isProcessing?: boolean; sendToolResult?: jest.Mock } = {}
) {
	const sendToolResult = overrides.sendToolResult ?? jest.fn().mockResolvedValue( undefined );

	const result = renderHook( () =>
		useNavigationContinuation( {
			isProcessing: false,
			...overrides,
			sendToolResult,
		} )
	);

	return { sendToolResult, ...result };
}

// Parks a navigation as an earlier page load would have left it —
// `savePendingNavigation` stamps the current load's id, which can never
// witness an arrival for its own navigation.
function parkNavigationFromPreviousLoad( overrides: Record< string, unknown > = {} ) {
	sessionStorage.setItem(
		STORAGE_KEY,
		JSON.stringify( {
			destination: '/wp-admin/plugins.php?paged=2',
			origin: '/wp-admin/options-general.php',
			pageLoadId: 'previous-load',
			timestamp: Date.now(),
			sessionId: 'session-1',
			toolCallId: 'call-1',
			toolId: 'wp_admin__navigate',
			...overrides,
		} )
	);
}

beforeEach( () => {
	jest.useFakeTimers();
	sessionStorage.clear();
	mockSessionId = 'session-1';
	window.history.replaceState( {}, '', '/wp-admin/plugins.php?paged=2' );
	parkNavigationFromPreviousLoad();
} );

afterEach( () => {
	jest.useRealTimers();
	jest.restoreAllMocks();
	Reflect.deleteProperty( document, 'visibilityState' );
} );

describe( 'useNavigationContinuation', () => {
	it( 'does nothing on an ordinary page load with no navigation pending', async () => {
		sessionStorage.clear();

		const { sendToolResult } = renderContinuation();
		await jest.runAllTimersAsync();

		expect( sendToolResult ).not.toHaveBeenCalled();
	} );

	it( 'reports the mount-captured parked navigation for the hydration guard', () => {
		expect( renderContinuation().result.current.hadParkedNavigation ).toBe( true );

		sessionStorage.clear();
		expect( renderContinuation().result.current.hadParkedNavigation ).toBe( false );
	} );

	it( 'sends the continuation for the stored call, then clears the state', async () => {
		const { sendToolResult } = renderContinuation();

		await jest.runAllTimersAsync();

		expect( sendToolResult ).toHaveBeenCalledTimes( 1 );
		const params = sendToolResult.mock.calls[ 0 ][ 0 ];
		expect( params ).toMatchObject( {
			toolCallId: 'call-1',
			toolId: 'wp_admin__navigate',
			sessionId: 'session-1',
		} );
		expect( JSON.parse( params.message ) ).toEqual( {
			success: true,
			navigated: true,
			matched: true,
			url: window.location.href,
			pathname: '/wp-admin/plugins.php',
		} );
		expect( sessionStorage.getItem( STORAGE_KEY ) ).toBeNull();
		expect( sessionStorage.getItem( SENT_KEY ) ).toBeNull();
	} );

	it( 'sends once across remounts', async () => {
		const first = renderContinuation();
		first.unmount();
		const second = renderContinuation();

		await jest.runAllTimersAsync();

		expect( first.sendToolResult.mock.calls.length + second.sendToolResult.mock.calls.length ).toBe(
			1
		);
	} );

	it( 'does not resend while the first send is still in flight — the sent flag decides', async () => {
		const inFlight = jest.fn().mockReturnValue( new Promise( () => {} ) );
		const first = renderContinuation( { sendToolResult: inFlight } );
		await jest.advanceTimersByTimeAsync( 500 );
		expect( inFlight ).toHaveBeenCalledTimes( 1 );

		first.unmount();
		const second = renderContinuation();
		await jest.runAllTimersAsync();

		expect( second.sendToolResult ).not.toHaveBeenCalled();
	} );

	it( 'answers on an unexpected page with matched: false, freeing the parked call', async () => {
		window.history.replaceState( {}, '', '/wp-admin/index.php' );

		const { sendToolResult } = renderContinuation();
		await jest.runAllTimersAsync();

		expect( sendToolResult ).toHaveBeenCalledWith(
			expect.objectContaining( {
				toolCallId: 'call-1',
				message: expect.stringContaining( '"matched":false' ),
			} )
		);
		expect( sessionStorage.getItem( STORAGE_KEY ) ).toBeNull();
	} );

	it.each( [
		[
			'the session has not loaded yet',
			() => ( mockSessionId = '' ),
			() => ( mockSessionId = 'session-1' ),
			false,
		],
		[ 'the agent is still processing', () => {}, () => {}, true ],
	] )(
		'waits while %s, then answers once unblocked',
		async ( _case, arrange, lift, processing ) => {
			arrange();
			const sendToolResult = jest.fn().mockResolvedValue( undefined );
			const { rerender } = renderHook(
				( { isProcessing }: { isProcessing: boolean } ) =>
					useNavigationContinuation( { isProcessing, sendToolResult } ),
				{ initialProps: { isProcessing: processing } }
			);

			await jest.runAllTimersAsync();
			expect( sendToolResult ).not.toHaveBeenCalled();
			expect( sessionStorage.getItem( STORAGE_KEY ) ).not.toBeNull();

			lift();
			rerender( { isProcessing: false } );
			await jest.runAllTimersAsync();
			expect( sendToolResult ).toHaveBeenCalledTimes( 1 );
		}
	);

	it( 'drops a navigation from another session instead of splitting the chat', async () => {
		const warn = jest.spyOn( console, 'warn' ).mockImplementation( () => {} );
		mockSessionId = 'session-2';
		const { sendToolResult } = renderContinuation();

		await jest.runAllTimersAsync();

		expect( sendToolResult ).not.toHaveBeenCalled();
		expect( sessionStorage.getItem( STORAGE_KEY ) ).toBeNull();
		expect( warn ).toHaveBeenCalled();
	} );

	it( 'sends the continuation for a navigation stored before the session was persisted', async () => {
		parkNavigationFromPreviousLoad( { sessionId: '' } );

		const { sendToolResult } = renderContinuation();
		await jest.runAllTimersAsync();

		expect( sendToolResult ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'drops a stored navigation that has no call ids to answer', async () => {
		savePendingNavigation( '/wp-admin/plugins.php', 'session-1' );

		const { sendToolResult } = renderContinuation();
		await jest.runAllTimersAsync();

		expect( sendToolResult ).not.toHaveBeenCalled();
		expect( sessionStorage.getItem( STORAGE_KEY ) ).toBeNull();
	} );

	it( 'ignores an expired navigation', async () => {
		jest.setSystemTime( Date.now() + 6 * 60 * 1000 );

		const { sendToolResult } = renderContinuation();
		await jest.runAllTimersAsync();

		expect( sendToolResult ).not.toHaveBeenCalled();
	} );

	it( 'does not delete a successor navigation saved while the send resolves', async () => {
		const sendToolResult = jest.fn().mockImplementation( async () => {
			savePendingNavigation(
				'/wp-admin/options-general.php',
				'session-1',
				'call-2',
				'wp_admin__navigate'
			);
		} );

		renderContinuation( { sendToolResult } );
		await jest.runAllTimersAsync();

		const stored = JSON.parse( sessionStorage.getItem( STORAGE_KEY ) ?? 'null' );
		expect( stored?.toolCallId ).toBe( 'call-2' );
		expect( sessionStorage.getItem( SENT_KEY ) ).toBeNull();
	} );

	it( 'a failed send does not unmark a successor navigation’s sent flag', async () => {
		jest.spyOn( console, 'error' ).mockImplementation( () => {} );
		const sendToolResult = jest.fn().mockImplementation( async () => {
			jest.advanceTimersByTime( 1 );
			savePendingNavigation(
				'/wp-admin/options-general.php',
				'session-1',
				'call-2',
				'wp_admin__navigate'
			);
			markContinuationSent( JSON.parse( sessionStorage.getItem( STORAGE_KEY ) ?? '{}' ) );
			throw new Error( 'network' );
		} );

		renderContinuation( { sendToolResult } );
		await jest.runAllTimersAsync();

		const stored = JSON.parse( sessionStorage.getItem( STORAGE_KEY ) ?? 'null' );
		expect( stored?.toolCallId ).toBe( 'call-2' );
		expect( sessionStorage.getItem( SENT_KEY ) ).toContain( String( stored?.timestamp ) );
	} );

	it( 'does not clear a successor navigation’s sent flag either', async () => {
		const sendToolResult = jest.fn().mockImplementation( async () => {
			jest.advanceTimersByTime( 1 );
			savePendingNavigation(
				'/wp-admin/options-general.php',
				'session-1',
				'call-2',
				'wp_admin__navigate'
			);
			markContinuationSent( JSON.parse( sessionStorage.getItem( STORAGE_KEY ) ?? '{}' ) );
		} );

		renderContinuation( { sendToolResult } );
		await jest.runAllTimersAsync();

		const stored = JSON.parse( sessionStorage.getItem( STORAGE_KEY ) ?? 'null' );
		expect( stored?.toolCallId ).toBe( 'call-2' );
		expect( sessionStorage.getItem( SENT_KEY ) ).toContain( String( stored?.timestamp ) );
	} );

	it( 'a successor navigation on a resumed page does not inherit the arrival witness', async () => {
		// This load began with navigation A (answered normally); a successor B
		// created on this page, whose destination the current URL contains,
		// must not be answered as an arrival before its redirect fires.
		const { sendToolResult } = renderContinuation();
		await jest.runAllTimersAsync();
		expect( sendToolResult ).toHaveBeenCalledTimes( 1 );

		jest.advanceTimersByTime( 1 );
		savePendingNavigation( '/wp-admin/plugins.php', 'session-1', 'call-2', 'wp_admin__navigate' );
		await jest.runAllTimersAsync();

		expect( sendToolResult ).toHaveBeenCalledTimes( 1 );
		expect( sessionStorage.getItem( STORAGE_KEY ) ).not.toBeNull();
	} );

	it( 'the origin page never reports an arrival for a destination its own URL contains', async () => {
		// The chat mounts before the navigation is called (no parked state),
		// then a navigation to a destination that is a substring of the
		// current URL is declined — `matched` alone must not read as arrival.
		sessionStorage.clear();
		const { sendToolResult } = renderContinuation();
		savePendingNavigation( '/wp-admin/plugins.php', 'session-1', 'call-1', 'wp_admin__navigate' );

		window.dispatchEvent( new Event( 'beforeunload' ) );
		jest.setSystemTime( Date.now() + 3000 );
		await jest.runAllTimersAsync();

		expect( sendToolResult ).toHaveBeenCalledTimes( 1 );
		const { message } = sendToolResult.mock.calls[ 0 ][ 0 ];
		expect( JSON.parse( message ) ).toMatchObject( { success: false, navigated: false } );
		expect( message ).toContain( 'NOT on /wp-admin/plugins.php' );
	} );

	it( 'a history-API URL rewrite on the origin page is not an arrival', async () => {
		// An editor autosave `replaceState` between the save and the answer
		// must not turn a declined navigation into a reported arrival.
		sessionStorage.clear();
		const { result, sendToolResult } = renderContinuation();
		savePendingNavigation( '/wp-admin/edit.php', 'session-1', 'call-1', 'wp_admin__navigate' );
		window.history.replaceState( {}, '', '/wp-admin/post.php?post=7&action=edit' );

		await result.current.flushPendingNavigation();

		expect( sendToolResult ).toHaveBeenCalledTimes( 1 );
		const { message } = sendToolResult.mock.calls[ 0 ][ 0 ];
		expect( JSON.parse( message ) ).toMatchObject( { success: false, navigated: false } );
	} );

	it( 'a stalled probe in a hidden tab is throttling, not a dialog — no decline arms', async () => {
		sessionStorage.clear();
		Object.defineProperty( document, 'visibilityState', {
			value: 'hidden',
			configurable: true,
		} );
		const { sendToolResult } = renderContinuation();
		savePendingNavigation( '/wp-admin/edit.php', 'session-1', 'call-1', 'wp_admin__navigate' );

		window.dispatchEvent( new Event( 'beforeunload' ) );
		jest.setSystemTime( Date.now() + 3000 );
		await jest.runAllTimersAsync();

		expect( sendToolResult ).not.toHaveBeenCalled();
		expect( sessionStorage.getItem( STORAGE_KEY ) ).not.toBeNull();
	} );

	it( 'without a dialog stall, leaves the decline to the flush', async () => {
		savePendingNavigation( '/wp-admin/edit.php', 'session-1', 'call-1', 'wp_admin__navigate' );
		const sendToolResult = jest.fn().mockResolvedValue( undefined );
		const { result, rerender } = renderHook(
			( { isProcessing }: { isProcessing: boolean } ) =>
				useNavigationContinuation( { isProcessing, sendToolResult } ),
			{ initialProps: { isProcessing: false } }
		);

		// On-time checks carry no dialog proof — a slow accepted navigation
		// still committing looks identical, so nothing auto-sends.
		await jest.runAllTimersAsync();
		expect( sendToolResult ).not.toHaveBeenCalled();
		expect( sessionStorage.getItem( STORAGE_KEY ) ).not.toBeNull();

		// Effect re-runs must not send either.
		rerender( { isProcessing: true } );
		rerender( { isProcessing: false } );
		await jest.runAllTimersAsync();
		expect( sendToolResult ).not.toHaveBeenCalled();

		await result.current.flushPendingNavigation();
		expect( sendToolResult ).toHaveBeenCalledTimes( 1 );
		expect( sessionStorage.getItem( STORAGE_KEY ) ).toBeNull();
	} );

	it( 'the destination corrects an interrupted decline answer with the arrival', async () => {
		// The origin page's false decline for a slow accepted navigation
		// marks the flag, then the unload interrupts the send. Arriving at
		// the destination disproves the decline.
		const { timestamp } = JSON.parse( sessionStorage.getItem( STORAGE_KEY ) ?? '{}' );
		sessionStorage.setItem( SENT_KEY, `${ timestamp }:other-page-load` );

		const { sendToolResult } = renderContinuation();
		await jest.runAllTimersAsync();

		expect( sendToolResult ).toHaveBeenCalledTimes( 1 );
		const { message } = sendToolResult.mock.calls[ 0 ][ 0 ];
		expect( JSON.parse( message ) ).toMatchObject( { success: true, navigated: true } );
		expect( sessionStorage.getItem( STORAGE_KEY ) ).toBeNull();
		expect( sessionStorage.getItem( SENT_KEY ) ).toBeNull();
	} );

	it( 'a dialog stall arms the decline; hands-off, it answers after the long fallback', async () => {
		sessionStorage.clear();
		const { sendToolResult } = renderContinuation();
		savePendingNavigation( '/wp-admin/edit.php', 'session-1', 'call-1', 'wp_admin__navigate' );

		// The blocking dialog stalls timers: the probe lands well past its
		// zero-delay schedule, proving the user dismissed a dialog.
		window.dispatchEvent( new Event( 'beforeunload' ) );
		jest.setSystemTime( Date.now() + 3000 );
		await jest.advanceTimersByTimeAsync( 500 );
		expect( sendToolResult ).not.toHaveBeenCalled();

		// Hands-off, the short delay is not enough — a slow accepted
		// navigation may still be committing, and its reply belongs on the
		// destination page.
		await jest.advanceTimersByTimeAsync( 3000 );
		expect( sendToolResult ).not.toHaveBeenCalled();

		await jest.runAllTimersAsync();
		expect( sendToolResult ).toHaveBeenCalledTimes( 1 );
		expect( sessionStorage.getItem( STORAGE_KEY ) ).toBeNull();
	} );

	it( 'a fast reject still arms — the beforeunload probe measures the whole dialog dwell', async () => {
		// The hook mounts on the origin page before the navigation is called;
		// the save's pending event arms the probe listener.
		sessionStorage.clear();
		const { sendToolResult } = renderContinuation();
		savePendingNavigation( '/wp-admin/edit.php', 'session-1', 'call-1', 'wp_admin__navigate' );

		// The dialog opens right after `beforeunload`; even a sub-second
		// dismissal stalls the zero-delay probe past its threshold.
		window.dispatchEvent( new Event( 'beforeunload' ) );
		jest.setSystemTime( Date.now() + 700 );
		await jest.runAllTimersAsync();

		expect( sendToolResult ).toHaveBeenCalledTimes( 1 );
		const { message } = sendToolResult.mock.calls[ 0 ][ 0 ];
		expect( JSON.parse( message ) ).toMatchObject( { success: false, navigated: false } );
	} );

	it( 'a beforeunload without a dialog dwell does not arm the decline', async () => {
		sessionStorage.clear();
		const { sendToolResult } = renderContinuation();
		savePendingNavigation( '/wp-admin/edit.php', 'session-1', 'call-1', 'wp_admin__navigate' );

		window.dispatchEvent( new Event( 'beforeunload' ) );
		await jest.runAllTimersAsync();

		expect( sendToolResult ).not.toHaveBeenCalled();
		expect( sessionStorage.getItem( STORAGE_KEY ) ).not.toBeNull();
	} );

	it( 'an interaction confirms the user stayed and accelerates the armed answer', async () => {
		sessionStorage.clear();
		const { sendToolResult } = renderContinuation();
		savePendingNavigation( '/wp-admin/edit.php', 'session-1', 'call-1', 'wp_admin__navigate' );

		window.dispatchEvent( new Event( 'beforeunload' ) );
		jest.setSystemTime( Date.now() + 3000 );
		await jest.advanceTimersByTimeAsync( 500 );
		window.dispatchEvent( new Event( 'pointerdown' ) );

		await jest.advanceTimersByTimeAsync( 2000 );
		expect( sendToolResult ).toHaveBeenCalledTimes( 1 );
		expect( sessionStorage.getItem( STORAGE_KEY ) ).toBeNull();
	} );

	it( 'a stale armed answer never fires for a successor navigation', async () => {
		sessionStorage.clear();
		const { result, sendToolResult } = renderContinuation();
		savePendingNavigation( '/wp-admin/edit.php', 'session-1', 'call-1', 'wp_admin__navigate' );

		// A stalled probe arms the answer for the first navigation…
		window.dispatchEvent( new Event( 'beforeunload' ) );
		jest.setSystemTime( Date.now() + 3000 );
		await jest.advanceTimersByTimeAsync( 500 );

		// …but a flush answers it first, and a successor gets parked.
		await result.current.flushPendingNavigation();
		expect( sendToolResult ).toHaveBeenCalledTimes( 1 );
		savePendingNavigation(
			'/wp-admin/options-general.php',
			'session-1',
			'call-2',
			'wp_admin__navigate'
		);

		// The stale armed timer fires but must not answer the successor.
		await jest.runAllTimersAsync();
		expect( sendToolResult ).toHaveBeenCalledTimes( 1 );
		expect( sessionStorage.getItem( STORAGE_KEY ) ).not.toBeNull();
	} );

	it( 'an interrupted send with the user still on the origin stays parked', async () => {
		// No navigation is witnessed, so the interrupted decline may already
		// have reached the server — hold instead of risking a wrong resend.
		parkNavigationFromPreviousLoad( {
			destination: '/wp-admin/edit.php',
			origin: '/wp-admin/plugins.php?paged=2',
		} );
		const { timestamp } = JSON.parse( sessionStorage.getItem( STORAGE_KEY ) ?? '{}' );
		sessionStorage.setItem( SENT_KEY, `${ timestamp }:other-page-load` );

		const { sendToolResult } = renderContinuation();
		await jest.runAllTimersAsync();

		expect( sendToolResult ).not.toHaveBeenCalled();
		expect( sessionStorage.getItem( STORAGE_KEY ) ).not.toBeNull();
		expect( sessionStorage.getItem( SENT_KEY ) ).toContain( 'other-page-load' );
	} );

	it( 'the correction also answers from an unexpected landing page', async () => {
		// The witnessed navigation disproves the interrupted decline even off
		// the destination — holding would strand the call until the expiry.
		parkNavigationFromPreviousLoad( { destination: '/wp-admin/edit.php' } );
		const { timestamp } = JSON.parse( sessionStorage.getItem( STORAGE_KEY ) ?? '{}' );
		sessionStorage.setItem( SENT_KEY, `${ timestamp }:other-page-load` );

		const { sendToolResult } = renderContinuation();
		await jest.runAllTimersAsync();

		expect( sendToolResult ).toHaveBeenCalledTimes( 1 );
		const { message } = sendToolResult.mock.calls[ 0 ][ 0 ];
		expect( JSON.parse( message ) ).toMatchObject( { navigated: true, matched: false } );
		expect( sessionStorage.getItem( STORAGE_KEY ) ).toBeNull();
	} );

	it( 'a flush retries a send that failed earlier', async () => {
		jest.spyOn( console, 'error' ).mockImplementation( () => {} );
		savePendingNavigation( '/wp-admin/edit.php', 'session-1', 'call-1', 'wp_admin__navigate' );
		const sendToolResult = jest
			.fn()
			.mockRejectedValueOnce( new Error( 'network' ) )
			.mockResolvedValue( undefined );
		const { result } = renderContinuation( { sendToolResult } );

		await result.current.flushPendingNavigation();
		expect( sendToolResult ).toHaveBeenCalledTimes( 1 );
		expect( sessionStorage.getItem( STORAGE_KEY ) ).not.toBeNull();

		await result.current.flushPendingNavigation();
		expect( sendToolResult ).toHaveBeenCalledTimes( 2 );
		expect( sessionStorage.getItem( STORAGE_KEY ) ).toBeNull();
	} );

	it( 'flush answers a declined redirect on the spot', async () => {
		savePendingNavigation( '/wp-admin/edit.php', 'session-1', 'call-1', 'wp_admin__navigate' );

		const { result, sendToolResult } = renderContinuation();
		await result.current.flushPendingNavigation();

		expect( sendToolResult ).toHaveBeenCalledTimes( 1 );
		const { toolCallId, message } = sendToolResult.mock.calls[ 0 ][ 0 ];
		expect( toolCallId ).toBe( 'call-1' );
		expect( JSON.parse( message ) ).toMatchObject( {
			success: false,
			navigated: false,
			matched: false,
		} );
		expect( message ).toContain( 'NOT on /wp-admin/edit.php' );
		expect( message ).toContain( 'without asking' );
		expect( sessionStorage.getItem( STORAGE_KEY ) ).toBeNull();
	} );

	it( 'flush waits for an in-flight decline send instead of double-sending', async () => {
		savePendingNavigation( '/wp-admin/edit.php', 'session-1', 'call-1', 'wp_admin__navigate' );
		let resolveSend: () => void = () => {};
		const sendToolResult = jest.fn().mockReturnValue(
			new Promise< void >( ( resolve ) => {
				resolveSend = resolve;
			} )
		);
		const { result } = renderContinuation( { sendToolResult } );

		const first = result.current.flushPendingNavigation();
		let secondDone = false;
		const second = result.current.flushPendingNavigation().then( () => {
			secondDone = true;
		} );

		await Promise.resolve();
		await Promise.resolve();
		expect( sendToolResult ).toHaveBeenCalledTimes( 1 );
		expect( secondDone ).toBe( false );

		resolveSend();
		await first;
		await second;
		expect( secondDone ).toBe( true );
		expect( sendToolResult ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'a page unload cancels an armed decline send, leaving the call parked', async () => {
		sessionStorage.clear();
		const { sendToolResult, unmount } = renderContinuation();
		savePendingNavigation( '/wp-admin/edit.php', 'session-1', 'call-1', 'wp_admin__navigate' );

		window.dispatchEvent( new Event( 'beforeunload' ) );
		jest.setSystemTime( Date.now() + 3000 );
		await jest.advanceTimersByTimeAsync( 500 );
		unmount();
		await jest.runAllTimersAsync();

		expect( sendToolResult ).not.toHaveBeenCalled();
		expect( sessionStorage.getItem( STORAGE_KEY ) ).not.toBeNull();
	} );

	it( 'a second dialog proof does not restart an already armed answer', async () => {
		sessionStorage.clear();
		const { sendToolResult } = renderContinuation();
		savePendingNavigation( '/wp-admin/edit.php', 'session-1', 'call-1', 'wp_admin__navigate' );

		window.dispatchEvent( new Event( 'beforeunload' ) );
		jest.setSystemTime( Date.now() + 3000 );
		await jest.advanceTimersByTimeAsync( 100 );
		window.dispatchEvent( new Event( 'pointerdown' ) );

		// A second stalled proof for the same navigation must not reset the
		// accelerated timer back to the hands-off fallback.
		window.dispatchEvent( new Event( NAVIGATION_PENDING_EVENT ) );
		window.dispatchEvent( new Event( 'beforeunload' ) );
		jest.setSystemTime( Date.now() + 3000 );
		await jest.advanceTimersByTimeAsync( 2000 );

		expect( sendToolResult ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'flushes the pending continuation immediately, and the timer does not resend', async () => {
		const { result, sendToolResult } = renderContinuation();

		await result.current.flushPendingNavigation();

		expect( sendToolResult ).toHaveBeenCalledTimes( 1 );
		expect( sessionStorage.getItem( STORAGE_KEY ) ).toBeNull();

		await jest.runAllTimersAsync();
		expect( sendToolResult ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'flushes a second navigation answered on the same page load', async () => {
		const { result, sendToolResult } = renderContinuation();
		await result.current.flushPendingNavigation();

		jest.advanceTimersByTime( 1 );
		savePendingNavigation(
			'/wp-admin/plugins.php?paged=2',
			'session-1',
			'call-2',
			'wp_admin__navigate'
		);
		await result.current.flushPendingNavigation();

		expect( sendToolResult ).toHaveBeenCalledTimes( 2 );
		expect( sessionStorage.getItem( STORAGE_KEY ) ).toBeNull();
	} );

	it( 'flush is a no-op without a pending navigation', async () => {
		sessionStorage.clear();
		const { result, sendToolResult } = renderContinuation();

		await result.current.flushPendingNavigation();

		expect( sendToolResult ).not.toHaveBeenCalled();
	} );

	it( 'flush never throws — a failed send re-arms for a later page load', async () => {
		jest.spyOn( console, 'error' ).mockImplementation( () => {} );
		const { result } = renderContinuation( {
			sendToolResult: jest.fn().mockRejectedValue( new Error( 'network' ) ),
		} );

		await expect( result.current.flushPendingNavigation() ).resolves.toBeUndefined();

		expect( sessionStorage.getItem( STORAGE_KEY ) ).not.toBeNull();
		expect( sessionStorage.getItem( SENT_KEY ) ).toBeNull();
	} );

	it( 'does not loop retrying within the same mount after a failed send', async () => {
		jest.spyOn( console, 'error' ).mockImplementation( () => {} );
		const sendToolResult = jest.fn().mockRejectedValue( new Error( 'network' ) );
		const { rerender } = renderHook(
			( { isProcessing }: { isProcessing: boolean } ) =>
				useNavigationContinuation( {
					isProcessing,
					sendToolResult,
				} ),
			{ initialProps: { isProcessing: false } }
		);
		await jest.runAllTimersAsync();
		expect( sendToolResult ).toHaveBeenCalledTimes( 1 );

		// The failed send flips `isProcessing`, re-running the effect.
		rerender( { isProcessing: true } );
		rerender( { isProcessing: false } );
		await jest.runAllTimersAsync();

		expect( sendToolResult ).toHaveBeenCalledTimes( 1 );
		// The unmarked flag still lets a later mount retry.
		expect( sessionStorage.getItem( SENT_KEY ) ).toBeNull();
	} );

	it( 'retries on a later mount after a failed send, bounded by the expiry', async () => {
		const error = jest.spyOn( console, 'error' ).mockImplementation( () => {} );
		const failing = renderContinuation( {
			sendToolResult: jest.fn().mockRejectedValue( new Error( 'network' ) ),
		} );
		await jest.runAllTimersAsync();

		// The failure unmarks the sent flag and keeps the state for a retry.
		expect( sessionStorage.getItem( STORAGE_KEY ) ).not.toBeNull();
		expect( sessionStorage.getItem( SENT_KEY ) ).toBeNull();
		expect( error ).toHaveBeenCalled();

		failing.unmount();
		const retry = renderContinuation();
		await jest.runAllTimersAsync();

		expect( retry.sendToolResult ).toHaveBeenCalledTimes( 1 );
		expect( sessionStorage.getItem( STORAGE_KEY ) ).toBeNull();
	} );
} );

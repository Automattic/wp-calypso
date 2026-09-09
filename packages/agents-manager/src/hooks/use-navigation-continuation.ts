import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import { useAgentsManagerContext } from '../contexts';
import {
	completePendingNavigation,
	isContinuationSent,
	isNavigationSessionValid,
	markContinuationSent,
	NAVIGATION_PENDING_EVENT,
	getPendingNavigation,
	unmarkContinuationSent,
	wasContinuationSentThisLoad,
	wasNavigationCreatedThisLoad,
} from '../utils/wp-admin-navigation-state';

// Gives the user a moment to orient on the new page before the chat resumes.
const CONTINUATION_DELAY_MS = 500;

// How long a confirmed decline waits after an interaction — interactions
// come from users who stayed, so a short floor suffices; a fast accepted
// navigation's unload still wins and cancels the timer.
const DECLINE_SEND_DELAY_MS = 1000;

// The hands-off fallback: without an interaction confirming the user stayed,
// the answer waits this long so an accepted navigation's unload wins and the
// agent's reply starts on the destination page instead of flashing here.
const DECLINE_SEND_FALLBACK_DELAY_MS = 8000;

// A zero-delay timer scheduled inside `beforeunload` fires this late only
// when the blocking dialog held the page — even a fast dismissal dwells
// longer than timer jank.
const DIALOG_DWELL_THRESHOLD_MS = 300;

// Tells the model a declined redirect is not a failure to retry blindly.
// Naming both pages heads off the model claiming an arrival that never
// happened — an explicit negation it cannot skim past.
function buildDeclinedMessage( origin: string, destination: string ): string {
	return (
		`The user declined the redirect and is still on ${ origin } — they are NOT on ${ destination }. ` +
		'They may have unsaved changes to keep. Do not claim the navigation happened, and do not retry it without asking first.'
	);
}

interface UseNavigationContinuationProps {
	isProcessing: boolean;
	sendToolResult: ( params: {
		toolCallId: string;
		toolId: string;
		message: string;
		sessionId: string;
	} ) => Promise< void >;
}

interface UseNavigationContinuationResult {
	hadParkedNavigation: boolean;
	flushPendingNavigation: () => Promise< void >;
}

/**
 * Answers a parked `wp-admin-navigate` call with a continuation tool result —
 * the arrival after the reload, or the redirect the user declined. Guards and
 * a `sessionStorage` sent flag keep remounts and re-runs from double-sending;
 * a failed send retries via the flush or a later mount, bounded by the
 * 5-minute expiry.
 *
 * Declines are confirmed by the blocking dialog itself: it stalls the page's
 * timers, so a `beforeunload`-anchored zero-delay probe firing measurably
 * late proves a dialog was dismissed with the page still here — its lateness
 * is the dialog's whole dwell, and only that proof arms the answer. The armed
 * send waits a short delay once a deliberate interaction confirms the user
 * stayed, or a long hands-off fallback otherwise, so an accepted
 * navigation's unload wins and the reply starts on the destination page.
 * Without that proof nothing auto-sends; the flush answers with the user's
 * next message. Should a false
 * decline still slip out, its unload-interrupted send is recognized on the
 * destination — the arrival disproves it — and answered with the truth.
 *
 * Returns `hadParkedNavigation` — the caller skips history hydration while a
 * resume is pending, since server history lacks tool-call rows and would
 * erase the parked call — and `flushPendingNavigation`, awaited before each
 * user message so it meets an already-answered conversation; a fast no-op
 * when nothing is pending, and it never throws.
 */
export function useNavigationContinuation( {
	isProcessing,
	sendToolResult,
}: UseNavigationContinuationProps ): UseNavigationContinuationResult {
	const { getTabSessionId } = useAgentsManagerContext();
	const sessionId = getTabSessionId();

	// Captured at mount, before the caller's history fetch can resolve.
	const [ hadParkedNavigation ] = useState( () => {
		const pendingNavigation = getPendingNavigation();
		return Boolean(
			pendingNavigation?.toolCallId && isNavigationSessionValid( pendingNavigation, sessionId )
		);
	} );

	// Refs, so the shared callback reads live values without re-creating.
	const sendToolResultRef = useRef( sendToolResult );
	sendToolResultRef.current = sendToolResult;
	const isProcessingRef = useRef( isProcessing );
	isProcessingRef.current = isProcessing;

	// One attempt per navigation — a fresh navigation gets its own, and after
	// a failure the flush or a later mount retries.
	const attemptedForRef = useRef< number | null >( null );

	// The armed decline answer; a page unload cancels it with the page.
	const declineArmedForRef = useRef< number | null >( null );
	const cancelDeclineArmRef = useRef< ( () => void ) | undefined >( undefined );
	useEffect( () => () => cancelDeclineArmRef.current?.(), [] );

	// The in-flight continuation send — a pre-submit flush awaits it so a user
	// message never overtakes the answer it depends on.
	const inFlightSendRef = useRef< Promise< void > | undefined >( undefined );

	// Shared by the destination page's timer and the pre-submit flush. Every
	// guard reads live state at call time, so either caller can run it safely:
	// it sends each navigation at most once and never throws.
	const sendContinuation = useCallback(
		async ( { deferDeclined = false, dialogStalled = false } = {} ) => {
			const pendingNavigation = getPendingNavigation();
			if ( ! pendingNavigation ) {
				return;
			}

			// Without the call ids there is no tool result to answer.
			const { toolCallId, toolId } = pendingNavigation;
			if ( ! toolCallId || ! toolId ) {
				completePendingNavigation( pendingNavigation );
				return;
			}

			// The parked tool call is always answered — the WooCommerce AI flow
			// leaves the task in `input-required` until a result arrives, so an
			// unanswered call would strand the conversation. `matched: false`
			// flags an unexpected landing page; `navigated: false` means the
			// redirect never happened (the user declined it), and the `message`
			// tells the model to ask before retrying instead of looping the
			// decline dialog. Only a page load other than the one that created
			// the navigation can witness an arrival: on the creating page,
			// neither a substring `matched` hit nor a history-API rewrite (an
			// editor autosave `replaceState`) proves the browser navigated.
			const matched = window.location.href.includes( pendingNavigation.destination );
			const navigated =
				! wasNavigationCreatedThisLoad( pendingNavigation ) &&
				( matched ||
					window.location.pathname + window.location.search !== pendingNavigation.origin );

			if (
				attemptedForRef.current === pendingNavigation.timestamp ||
				isContinuationSent( pendingNavigation )
			) {
				// A sent flag from another page load with a navigation now
				// witnessed means the origin's decline answer for this slow
				// navigation was interrupted by the unload — the landing,
				// expected or not, disproves it, so unmark and report the
				// truth instead.
				if (
					attemptedForRef.current !== pendingNavigation.timestamp &&
					! wasContinuationSentThisLoad( pendingNavigation ) &&
					navigated
				) {
					unmarkContinuationSent( pendingNavigation );
				} else {
					await inFlightSendRef.current;
					return;
				}
			}

			// A send during an active turn would hit the chat's send-lock and
			// resolve without delivering — skip; the effect or a later flush
			// retries.
			if ( isProcessingRef.current ) {
				return;
			}

			const sessionId = getTabSessionId();
			if ( ! sessionId ) {
				return;
			}

			if ( ! isNavigationSessionValid( pendingNavigation, sessionId ) ) {
				completePendingNavigation( pendingNavigation );
				return;
			}

			// Only a stalled probe proves a dismissed dialog (see the hook
			// docblock), so only it arms the decline answer — once per
			// navigation, and the armed send answers only the navigation that
			// armed it. A deliberate interaction confirms the user stayed and
			// answers at the short delay; hands-off, the long fallback runs
			// instead, so an accepted navigation's unload wins and the reply
			// starts on the destination page.
			if ( ! navigated && deferDeclined ) {
				if ( ! dialogStalled || declineArmedForRef.current === pendingNavigation.timestamp ) {
					return;
				}
				cancelDeclineArmRef.current?.();
				declineArmedForRef.current = pendingNavigation.timestamp;

				const { timestamp } = pendingNavigation;
				const armedAt = Date.now();
				const send = () => {
					cancelDeclineArmRef.current?.();
					if ( getPendingNavigation()?.timestamp === timestamp ) {
						sendContinuation();
					}
				};
				let timerId = window.setTimeout( send, DECLINE_SEND_FALLBACK_DELAY_MS );
				const onActivity = () => {
					window.clearTimeout( timerId );
					timerId = window.setTimeout(
						send,
						Math.max( 0, DECLINE_SEND_DELAY_MS - ( Date.now() - armedAt ) )
					);
				};

				window.addEventListener( 'pointerdown', onActivity, { once: true } );
				window.addEventListener( 'keydown', onActivity, { once: true } );
				cancelDeclineArmRef.current = () => {
					window.clearTimeout( timerId );
					window.removeEventListener( 'pointerdown', onActivity );
					window.removeEventListener( 'keydown', onActivity );
					cancelDeclineArmRef.current = undefined;
					declineArmedForRef.current = null;
				};
				return;
			}

			attemptedForRef.current = pendingNavigation.timestamp;
			markContinuationSent( pendingNavigation );

			const message = JSON.stringify( {
				success: navigated,
				...( ! navigated && {
					message: buildDeclinedMessage( pendingNavigation.origin, pendingNavigation.destination ),
				} ),
				navigated,
				matched,
				url: window.location.href,
				pathname: window.location.pathname,
			} );

			const sendPromise = ( async () => {
				try {
					await sendToolResultRef.current( { toolCallId, toolId, message, sessionId } );
					completePendingNavigation( pendingNavigation );
				} catch ( error ) {
					// Unmark, so a later mount retries; the 5-minute expiry bounds it.
					unmarkContinuationSent( pendingNavigation );
					// eslint-disable-next-line no-console
					console.error( '[AgentsManager] Error sending the navigation continuation:', error );
				}
			} )();
			inFlightSendRef.current = sendPromise;
			await sendPromise;
		},
		[ getTabSessionId ]
	);

	// The save changes no React state, so it announces itself with an event,
	// which arms the `beforeunload` probe: the dialog opens right after that
	// handler returns, so a zero-delay timer scheduled inside it measures the
	// dialog's whole dwell as lateness — the decline proof. A hidden document
	// cannot have shown a dialog, so background-tab timer throttling never
	// forges it.
	useEffect( () => {
		let probeId: number | undefined;

		const onBeforeUnload = () => {
			const scheduledAt = Date.now();
			window.clearTimeout( probeId );
			probeId = window.setTimeout( () => {
				sendContinuation( {
					deferDeclined: true,
					dialogStalled:
						document.visibilityState === 'visible' &&
						Date.now() - scheduledAt > DIALOG_DWELL_THRESHOLD_MS,
				} );
			} );
		};
		const onPending = () => {
			window.addEventListener( 'beforeunload', onBeforeUnload, { once: true } );
		};

		window.addEventListener( NAVIGATION_PENDING_EVENT, onPending );

		return () => {
			window.clearTimeout( probeId );
			window.removeEventListener( NAVIGATION_PENDING_EVENT, onPending );
			window.removeEventListener( 'beforeunload', onBeforeUnload );
		};
	}, [ sendContinuation ] );

	// The destination page's resume: while a navigation is pending, answer
	// after a short delay — the guards all live in `sendContinuation`, and
	// the deps retry whenever the session or turn state changes. Declines
	// carry no proof here; only the probe supplies one.
	useEffect( () => {
		if ( ! getPendingNavigation() ) {
			return;
		}

		const timeoutId = window.setTimeout( () => {
			sendContinuation( { deferDeclined: true } );
		}, CONTINUATION_DELAY_MS );

		return () => clearTimeout( timeoutId );
	}, [ isProcessing, sessionId, sendContinuation ] );

	// The flush may retry a send that failed earlier this page load — bounded
	// by user submits, so it cannot loop the way an effect-driven retry would.
	const flushPendingNavigation = useCallback( async () => {
		attemptedForRef.current = null;
		await sendContinuation();
	}, [ sendContinuation ] );

	return { hadParkedNavigation, flushPendingNavigation };
}

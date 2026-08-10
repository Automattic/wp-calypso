import { useCallback, useEffect, useRef, useState } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useInterval } from 'calypso/lib/interval';

/**
 * Which wait screen is beating. The transfer waits are spread across three clients with nothing in
 * common, so this is what lets one query compare them.
 */
export type WaitSurface =
	| 'marketplace_install'
	| 'checkout_thank_you_transfer'
	| 'stepper_processing';

/** Why a beat fired. A browser that throttles hidden tabs produces only the visibility ones. */
type BeatTrigger = 'interval' | 'visibility';

/**
 * How a wait stopped. Anything other than these is a wait whose end was never observed — which is
 * the abandonment signal, but only once `is_visible` says the tab was still in front of someone.
 */
type EndReason = 'stopped' | 'capped' | 'page_hidden';

const HEARTBEAT_MS = 20 * 1000;

// A wait screen left open in a forgotten tab would beat indefinitely. Past this nobody is waiting
// in any sense this signal can use, so close the wait rather than inflate the tail.
const HEARTBEAT_CAP_MS = 15 * 60 * 1000;

const isDocumentVisible = () =>
	typeof document === 'undefined' || document.visibilityState !== 'hidden';

/**
 * Prefers `crypto.randomUUID`, falling back for environments that lack it (jest defaults among
 * them). Only collision resistance matters here — this correlates one wait's events, nothing more.
 */
function createWaitId(): string {
	if ( typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ) {
		return crypto.randomUUID();
	}
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, ( c ) => {
		const r = ( Math.random() * 16 ) | 0;
		const v = c === 'x' ? r : ( r & 0x3 ) | 0x8;
		return v.toString( 16 );
	} );
}

type Wait = {
	id: string;
	startedAt: number;
	beats: number;
	lastEventAt: number;
	// Visible time already banked, plus when the current visible stretch began. Split this way
	// because the total has to be readable mid-stretch, on every beat.
	visibleMs: number;
	visibleSince: number | null;
	hasEnded: boolean;
};

/**
 * Reports whether someone is still watching a transfer wait.
 *
 * The server records that a transfer finished, never whether the person stayed, so abandonment can
 * only be inferred from the client: a wait whose heartbeats stop while the tab was still in front
 * of someone is a wait they walked away from.
 *
 * Two things make that inference harder than it sounds, and shape everything below.
 *
 * Hidden tabs are not abandoned tabs — switching away during a minute-long wait is ordinary — but
 * browsers throttle background timers to about once a minute and may suspend them outright, so an
 * interval cannot be trusted to mark the moment a tab was hidden. Every visibility change emits a
 * beat of its own, so there is always an `is_visible: false` marker before the gap. Read the gap
 * that follows one as censored, never as abandonment. `seconds_since_previous` carries the real
 * distance from the last event, so a throttled beat is visible as a stretched one rather than
 * silently assumed to be regular.
 *
 * A wait ends explicitly or not at all. `..._ended` fires once per wait, from whichever comes
 * first: the caller retiring it, the cap, or the page being torn down. That last one is best effort — delivery
 * during unload is not guaranteed — so callers whose flow finishes in a full-page redirect must
 * retire the wait themselves on success, before navigating. Without that a completed install is
 * indistinguishable from someone closing the tab.
 */
export function useWaitHeartbeat( {
	surface,
	enabled,
	properties,
}: {
	surface: WaitSurface;
	/**
	 * True while the wait is running. Flipping it to false ends the wait, and is the only reliable
	 * way to record an outcome the customer navigated away from.
	 */
	enabled: boolean;
	/** Flow context to ride along on every event. Read at emit time, so late arrivals still land. */
	properties?: Record< string, unknown >;
} ): void {
	const propertiesRef = useRef( properties );
	propertiesRef.current = properties;

	// Null while no wait is running. A ref rather than state because the effect that ends a wait
	// has to see the same object the one that started it wrote.
	const waitRef = useRef< Wait | null >( null );
	const [ isBeating, setIsBeating ] = useState( false );

	const emit = useCallback(
		( name: string, extra?: Record< string, unknown > ) => {
			const wait = waitRef.current;
			if ( ! wait ) {
				return;
			}
			const now = Date.now();
			const visibleMs =
				wait.visibleMs + ( wait.visibleSince === null ? 0 : now - wait.visibleSince );

			recordTracksEvent( name, {
				...propertiesRef.current,
				// Spread after the caller's context, never before: a surface that happened to pass its
				// own `surface` or `wait_id` would silently break the correlation every query here
				// depends on. The hook owns these.
				surface,
				wait_id: wait.id,
				waited_seconds: Math.round( ( now - wait.startedAt ) / 1000 ),
				visible_seconds: Math.round( visibleMs / 1000 ),
				is_visible: wait.visibleSince !== null,
				heartbeat_count: wait.beats,
				seconds_since_previous: Math.round( ( now - wait.lastEventAt ) / 1000 ),
				...extra,
			} );
			wait.lastEventAt = now;
		},
		[ surface ]
	);

	const endWait = useCallback(
		( reason: EndReason ) => {
			const wait = waitRef.current;
			if ( ! wait || wait.hasEnded ) {
				return;
			}
			wait.hasEnded = true;
			emit( 'calypso_transfer_wait_ended', { reason } );
			setIsBeating( false );
		},
		[ emit ]
	);

	useEffect( () => {
		if ( ! enabled ) {
			return;
		}

		const startedAt = Date.now();
		waitRef.current = {
			id: createWaitId(),
			startedAt,
			beats: 0,
			lastEventAt: startedAt,
			visibleMs: 0,
			visibleSince: isDocumentVisible() ? startedAt : null,
			hasEnded: false,
		};
		emit( 'calypso_transfer_wait_started' );
		setIsBeating( true );

		return () => {
			endWait( 'stopped' );
			waitRef.current = null;
		};
	}, [ enabled, emit, endWait ] );

	useEffect( () => {
		if ( ! enabled || typeof document === 'undefined' ) {
			return;
		}

		// The only marker a throttled or suspended background timer cannot swallow.
		const onVisibilityChange = () => {
			const wait = waitRef.current;
			if ( ! wait || wait.hasEnded ) {
				return;
			}
			const now = Date.now();
			if ( isDocumentVisible() ) {
				wait.visibleSince = now;
			} else if ( wait.visibleSince !== null ) {
				wait.visibleMs += now - wait.visibleSince;
				wait.visibleSince = null;
			}
			emit( 'calypso_transfer_wait_heartbeat', { trigger: 'visibility' as BeatTrigger } );
		};

		// `pagehide` rather than `beforeunload`: it fires for the bfcache path too, and is the only
		// chance to close a bracket a full-page navigation would otherwise leave open.
		//
		// A persisted one is not that: the document is frozen, not torn down, and can come back to a
		// wait that is still running. Ending it there would retire a wait the customer returns to and
		// leave the restored screen beating for nobody. It is the hidden case, which the pair above
		// already covers — visible time stops, the gap reads as censored.
		const onPageHide = ( event: PageTransitionEvent ) => {
			if ( event.persisted ) {
				return;
			}
			endWait( 'page_hidden' );
		};

		// Not every browser fires `visibilitychange` on the way out of the back-forward cache, so this
		// is the fallback that marks the return. Skipped when the pair above already did.
		const onPageShow = ( event: PageTransitionEvent ) => {
			const wait = waitRef.current;
			if ( ! event.persisted || ! wait || wait.hasEnded || wait.visibleSince !== null ) {
				return;
			}
			onVisibilityChange();
		};

		document.addEventListener( 'visibilitychange', onVisibilityChange );
		window.addEventListener( 'pagehide', onPageHide );
		window.addEventListener( 'pageshow', onPageShow );
		return () => {
			document.removeEventListener( 'visibilitychange', onVisibilityChange );
			window.removeEventListener( 'pagehide', onPageHide );
			window.removeEventListener( 'pageshow', onPageShow );
		};
	}, [ enabled, emit, endWait ] );

	useInterval(
		() => {
			const wait = waitRef.current;
			if ( ! wait || wait.hasEnded ) {
				return;
			}
			if ( Date.now() - wait.startedAt >= HEARTBEAT_CAP_MS ) {
				endWait( 'capped' );
				return;
			}
			wait.beats += 1;
			emit( 'calypso_transfer_wait_heartbeat', { trigger: 'interval' as BeatTrigger } );
		},
		enabled && isBeating ? HEARTBEAT_MS : null
	);
}

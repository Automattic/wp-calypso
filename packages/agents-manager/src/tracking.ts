/**
 * Tracking module for `@automattic/agents-manager`.
 *
 * Wraps Calypso's `recordTracksEvent` so that all tracks events fired by
 * the agents-manager package flow through a single gateway. Hosts can
 * inject a tracking handler to receive the same events (e.g. for routing
 * into their own telemetry pipeline) and optionally disable the default
 * Calypso tracks path entirely.
 *
 * See `hooks/use-setup-custom-actions/README.md` for the host-side API.
 */

import { recordTracksEvent as calypsoRecordTracksEvent } from '@automattic/calypso-analytics';

export type TrackingHandler = (
	event: string,
	props?: Record< string, string | number | boolean >
) => void;

let handler: TrackingHandler | undefined;
let defaultTracksEnabled = true;

// ---------------------------------------------------------------------------
// Host-controlled switches
// ---------------------------------------------------------------------------

/**
 * Register a tracking handler. Hosts inject a function that receives every
 * event fired by the package. Passing `undefined` clears the handler.
 *
 * @param fn - Handler function, or `undefined` to clear.
 */
export function setTrackingHandler( fn: TrackingHandler | undefined ): void {
	handler = fn;
}

/**
 * Enable or disable the default Calypso tracks path. When disabled, events
 * fired via `recordTracksEvent` below are no longer forwarded to Calypso's
 * analytics pipeline; only the registered handler (if any) receives them.
 *
 * Does not affect `trackEvent` (which has no default path).
 *
 * @param enabled - `true` to enable the default path (initial state), `false` to disable.
 */
export function setDefaultTracksEnabled( enabled: boolean ): void {
	defaultTracksEnabled = enabled;
}

// ---------------------------------------------------------------------------
// Tracking entry points
// ---------------------------------------------------------------------------

/**
 * Fire a tracks event with a default Calypso tracks path.
 *
 * The event name MUST NOT include the `calypso_` prefix — it's prepended
 * when firing through the default path. This keeps the handler contract
 * clean: handlers always receive the unprefixed semantic name.
 *
 * Behavior:
 * - If the default path is enabled (initial state), fires
 *   `recordTracksEvent( 'calypso_' + eventName, props )` via
 *   `@automattic/calypso-analytics`.
 * - If a handler is registered, it's also called with the unprefixed
 *   event name and the same props.
 *
 * Use this as a drop-in replacement for the `recordTracksEvent` import
 * from `@automattic/calypso-analytics` at call sites where events were
 * already firing as `calypso_<something>`.
 *
 * @param eventName - Event name without `calypso_` prefix (e.g. `agents_manager_link_click`).
 * @param props     - Optional event properties.
 */
export function recordTracksEvent(
	eventName: string,
	props?: Record< string, string | number | boolean >
): void {
	if ( defaultTracksEnabled ) {
		calypsoRecordTracksEvent( `calypso_${ eventName }`, props );
	}
	handler?.( eventName, props );
}

/**
 * Fire a tracks event through the host handler only.
 *
 * No default Calypso tracks path — these events are invisible to hosts
 * that haven't registered a tracking handler. Use for events that have
 * never existed in the Calypso namespace (e.g. new chat-shell events
 * like panel_view, panel_close, button_click).
 *
 * @param eventName - Event name (passed to the handler as-is).
 * @param props     - Optional event properties.
 */
export function trackEvent(
	eventName: string,
	props?: Record< string, string | number | boolean >
): void {
	handler?.( eventName, props );
}

// ---------------------------------------------------------------------------
// Test helpers (not part of the public API)
// ---------------------------------------------------------------------------

/**
 * Reset the tracking module to its initial state. Intended for test teardown.
 */
export function __resetTrackingForTests(): void {
	handler = undefined;
	defaultTracksEnabled = true;
}

import userEvent, { PointerEventsCheckLevel } from '@testing-library/user-event';

/**
 * Skips user-event's `pointer-events` check, which reads the computed style of every ancestor on
 * each pointer action. With checkout's styles that is slow enough in jsdom to time tests out in CI.
 */
export function setupUserNoPointerEvents() {
	return userEvent.setup( { pointerEventsCheck: PointerEventsCheckLevel.Never } );
}

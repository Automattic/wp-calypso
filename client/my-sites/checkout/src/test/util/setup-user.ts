import userEvent, { PointerEventsCheckLevel } from '@testing-library/user-event';

/**
 * Sets up `userEvent` without its `pointer-events` check. Before each pointer action, the check
 * reads the computed style of the target and of every ancestor, which jsdom works out by matching
 * all the styles checkout injects. In the contact step tests, that took half of the time, and on
 * busy CI agents it pushed them past their timeouts.
 */
export function setupUser() {
	return userEvent.setup( { pointerEventsCheck: PointerEventsCheckLevel.Never } );
}

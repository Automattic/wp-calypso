/** @format **/

/**
 * Internal dependencies
 */
import getLastActivityTimestamp from 'state/happychat/selectors/get-last-activity-timestamp';

// How much time needs to pass before we consider the session inactive:
const HAPPYCHAT_INACTIVE_TIMEOUT_MS = 1000 * 60 * 10;

export default function( state ) {
	const lastActive = getLastActivityTimestamp( state );
	const now = Date.now();

	return now - lastActive < HAPPYCHAT_INACTIVE_TIMEOUT_MS;
}

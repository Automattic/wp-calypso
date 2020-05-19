/**
 * Internal dependencies
 */
import getHappychatLastActivityTimestamp from 'state/happychat/selectors/get-happychat-lastactivitytimestamp';

// How much time needs to pass before we consider the session inactive:
const HAPPYCHAT_INACTIVE_TIMEOUT_MS = 1000 * 60 * 10;

export default ( state ) => {
	const lastActive = getHappychatLastActivityTimestamp( state );
	const now = Date.now();
	return now - lastActive < HAPPYCHAT_INACTIVE_TIMEOUT_MS;
};

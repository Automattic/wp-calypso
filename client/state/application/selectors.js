/**
 * Internal dependencies
 */
import 'calypso/state/application/init';

export function isOffline( state ) {
	return state.application.connectionState === 'OFFLINE';
}

export function isOnline( state ) {
	return state.application.connectionState === 'ONLINE';
}

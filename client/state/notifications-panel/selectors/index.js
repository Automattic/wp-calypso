/**
 * Internal dependencies
 */
import 'state/notifications-panel/init';

export function shouldForceRefresh( state ) {
	return state?.notifications?.shouldForceRefresh || false;
}

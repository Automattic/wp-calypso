/**
 * Internal dependencies
 */
import { getCurrentUserId } from 'state/current-user/selectors';

export default function isLoggedOut( state ) {
	return ! getCurrentUserId( state );
}

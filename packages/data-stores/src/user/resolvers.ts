/**
 * Internal dependencies
 */
import { fetchCurrentUser, receiveCurrentUser, receiveCurrentUserFailed } from './actions';

export function* getCurrentUser() {
	try {
		const currentUser = yield fetchCurrentUser();
		return receiveCurrentUser( currentUser );
	} catch ( err ) {
		return receiveCurrentUserFailed();
	}
}

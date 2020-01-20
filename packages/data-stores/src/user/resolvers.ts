/**
 * Internal dependencies
 */
import { wpcomRequest } from '../wpcom-request-controls';
import { receiveCurrentUser, receiveCurrentUserFailed } from './actions';

export function* getCurrentUser() {
	try {
		const currentUser = yield wpcomRequest( {
			path: '/me',
			apiVersion: '1.1',
		} );
		return receiveCurrentUser( currentUser );
	} catch ( err ) {
		return receiveCurrentUserFailed();
	}
}

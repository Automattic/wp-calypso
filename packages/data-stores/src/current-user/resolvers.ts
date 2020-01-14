/**
 * Internal dependencies
 */
import { receiveCurrentUser, receiveCurrentUserFailed } from './actions';
import { wpcomRequest } from '../utils';

export async function getCurrentUser() {
	try {
		const currentUser = await wpcomRequest( { path: '/me', apiVersion: '1.1' } );
		return receiveCurrentUser( currentUser );
	} catch ( err ) {
		return receiveCurrentUserFailed();
	}
}

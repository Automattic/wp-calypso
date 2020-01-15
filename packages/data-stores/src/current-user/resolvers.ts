/**
 * Internal dependencies
 */
import { receiveCurrentUser, receiveCurrentUserFailed } from './actions';
import { wpcomRequest } from '../utils';
import { CurrentUser } from './types';

export async function getCurrentUser() {
	try {
		const currentUser: CurrentUser = await wpcomRequest< CurrentUser >( {
			path: '/me',
			apiVersion: '1.1',
		} );
		return receiveCurrentUser( currentUser );
	} catch ( err ) {
		return receiveCurrentUserFailed();
	}
}

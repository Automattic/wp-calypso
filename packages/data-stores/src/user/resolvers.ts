/**
 * Internal dependencies
 */
import { wpcomRequest } from '../wpcom-request-controls';
import { createActions } from './actions';
import { WpcomClientCredentials } from '../shared-types';

export function createResolvers( clientCreds: WpcomClientCredentials ) {
	const { receiveCurrentUser, receiveCurrentUserFailed } = createActions( clientCreds );

	function* getCurrentUser() {
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

	return {
		getCurrentUser,
	};
}

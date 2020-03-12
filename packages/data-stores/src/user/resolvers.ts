/**
 * Internal dependencies
 */
import { wpcomRequest, WpcomClientCredentials } from '../wpcom-request-controls';
import { createActions } from './actions';

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

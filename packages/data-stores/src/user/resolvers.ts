import { wpcomRequest } from '../wpcom-request-controls';
import { createActions } from './actions';
import type { CurrentUser } from './types';

declare global {
	interface Window {
		currentUser?: CurrentUser;
	}
}

export function createResolvers() {
	const { receiveCurrentUser, receiveCurrentUserFailed } = createActions();

	function* getCurrentUser() {
		// In environments where `wpcom-user-bootstrap` is set to true, the currentUser
		// object will be server-side rendered to window.currentUser. In these cases,
		// return that object instead of performing another API request to `/me`.
		if ( window.currentUser ) {
			return receiveCurrentUser( window.currentUser );
		}
		try {
			const currentUser: CurrentUser = yield wpcomRequest( {
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

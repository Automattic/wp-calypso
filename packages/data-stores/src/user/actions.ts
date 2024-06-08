import type { AuthRedirectParams, CurrentUser } from './types';

export function createActions() {
	const receiveCurrentUser = ( currentUser: CurrentUser ) => ( {
		type: 'RECEIVE_CURRENT_USER' as const,
		currentUser,
	} );

	const receiveAuthRedirectParams = ( authRedirectParams: AuthRedirectParams ) => ( {
		type: 'RECEIVE_AUTH_REDIRECT' as const,
		authRedirectParams,
	} );

	const receiveCurrentUserFailed = () => ( {
		type: 'RECEIVE_CURRENT_USER_FAILED' as const,
	} );

	return {
		receiveCurrentUser,
		receiveCurrentUserFailed,
		receiveAuthRedirectParams,
	};
}

export type ActionCreators = ReturnType< typeof createActions >;

export type Action =
	| ReturnType<
			| ActionCreators[ 'receiveCurrentUser' ]
			| ActionCreators[ 'receiveCurrentUserFailed' ]
			| ActionCreators[ 'receiveAuthRedirectParams' ]
	  >
	// Type added so we can dispatch actions in tests, but has no runtime cost
	| { type: 'TEST_ACTION' };

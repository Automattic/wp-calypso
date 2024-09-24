import type { CurrentUser } from './types';

export function createActions() {
	const receiveCurrentUser = ( currentUser: CurrentUser ) => ( {
		type: 'RECEIVE_CURRENT_USER' as const,
		currentUser,
	} );

	const receiveCurrentUserFailed = () => ( {
		type: 'RECEIVE_CURRENT_USER_FAILED' as const,
	} );

	const setIsNewUser = ( isNewUser: boolean ) => ( {
		type: 'SET_IS_NEW_USER' as const,
		isNewUser,
	} );

	return {
		receiveCurrentUser,
		receiveCurrentUserFailed,
		setIsNewUser,
	};
}

export type ActionCreators = ReturnType< typeof createActions >;

export type Action =
	| ReturnType<
			| ActionCreators[ 'receiveCurrentUser' ]
			| ActionCreators[ 'receiveCurrentUserFailed' ]
			| ActionCreators[ 'setIsNewUser' ]
	  >
	// Type added so we can dispatch actions in tests, but has no runtime cost
	| { type: 'TEST_ACTION' };

/**
 * Internal dependencies
 */
import { ActionType, CurrentUser } from './types';

export const receiveCurrentUser = ( currentUser: CurrentUser ) => ( {
	type: ActionType.RECEIVE_CURRENT_USER as const,
	currentUser,
} );

export const receiveCurrentUserFailed = () => ( {
	type: ActionType.RECEIVE_CURRENT_USER_FAILED as const,
} );

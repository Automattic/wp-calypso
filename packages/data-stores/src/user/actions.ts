/**
 * Internal dependencies
 */
import { ActionType, User } from './types';

export const receiveUser = ( user: User ) => ( {
	type: ActionType.RECEIVE_USER as const,
	user,
} );

/** @format */
/**
 * Internal dependencies
 */
import { ACCOUNT_CLOSE } from 'state/action-types';
import { createReducer } from 'state/utils';

export const isClosed = createReducer( false, {
	[ ACCOUNT_CLOSE ]: ( state, action ) => {
		return !! action.payload.success;
	},
} );

export default isClosed;

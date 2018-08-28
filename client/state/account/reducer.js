/** @format */
/**
 * Internal dependencies
 */
import { ACCOUNT_CLOSE_SUCCESS } from 'state/action-types';
import { createReducer, combineReducers } from 'state/utils';
import twoFactorAuthentication from './two-factor-auth/reducer';

export const isClosed = createReducer( false, {
	[ ACCOUNT_CLOSE_SUCCESS ]: () => {
		return true;
	},
} );

export default combineReducers( { isClosed, twoFactorAuthentication } );

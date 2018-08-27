/** @format */

/**
 * Internal dependencies
 */
import {
	ACCOUNT_HEALTH_CHECK_DIALOG_HIDE,
	ACCOUNT_HEALTH_CHECK_DIALOG_SHOW,
} from 'state/action-types';
import { combineReducers, createReducer } from 'state/utils';

export const isDialogShowing = createReducer( false, {
	[ ACCOUNT_HEALTH_CHECK_DIALOG_HIDE ]: () => false,
	[ ACCOUNT_HEALTH_CHECK_DIALOG_SHOW ]: () => true,
} );

export default combineReducers( {
	isDialogShowing,
} );

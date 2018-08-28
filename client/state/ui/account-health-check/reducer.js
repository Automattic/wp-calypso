/** @format */
/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import {
	ACCOUNT_HEALTH_CHECK_DIALOG_HIDE,
	ACCOUNT_HEALTH_CHECK_DIALOG_SHOW,
} from 'state/action-types';
import { combineReducers, createReducer } from 'state/utils';

const debug = debugFactory( 'calypso:account-health-check' );

export const isDialogShowing = createReducer( false, {
	[ ACCOUNT_HEALTH_CHECK_DIALOG_HIDE ]: () => {
		debug( 'Hiding dialog' );
		return false;
	},
	[ ACCOUNT_HEALTH_CHECK_DIALOG_SHOW ]: () => {
		debug( 'Showing dialog' );
		return true;
	},
} );

export default combineReducers( {
	isDialogShowing,
} );

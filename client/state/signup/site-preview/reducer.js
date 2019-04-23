/** @format */

/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import { SIGNUP_SITE_PREVIEW_SHOW } from 'state/action-types';

const lastShown = createReducer( null, {
	[ SIGNUP_SITE_PREVIEW_SHOW ]: () => new Date().getTime(),
} );

export default combineReducers( {
	lastShown,
} );

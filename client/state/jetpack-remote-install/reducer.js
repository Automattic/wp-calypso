/** @format */

/**
 * Internal dependencies
 */
import { createReducer, combineReducers, keyedReducer } from 'state/utils';
import {
	JETPACK_REMOTE_INSTALL,
	JETPACK_REMOTE_INSTALL_FAILURE,
	JETPACK_REMOTE_INSTALL_SUCCESS,
} from 'state/action-types';

export const isComplete = keyedReducer(
	'url',
	createReducer( false, {
		[ JETPACK_REMOTE_INSTALL_SUCCESS ]: () => true,
		[ JETPACK_REMOTE_INSTALL ]: () => false,
	} )
);

export const error = keyedReducer(
	'url',
	createReducer( '', {
		[ JETPACK_REMOTE_INSTALL_FAILURE ]: ( state, { errorCode } ) => errorCode,
		[ JETPACK_REMOTE_INSTALL_SUCCESS ]: () => '',
		[ JETPACK_REMOTE_INSTALL ]: () => '',
	} )
);

export default combineReducers( {
	isComplete,
	error,
} );

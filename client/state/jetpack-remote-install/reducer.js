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

export const inProgress = keyedReducer(
	'url',
	createReducer( false, {
		[ JETPACK_REMOTE_INSTALL ]: () => true,
		[ JETPACK_REMOTE_INSTALL_SUCCESS ]: () => false,
		[ JETPACK_REMOTE_INSTALL_FAILURE ]: () => false,
	} )
);

export const error = keyedReducer(
	'url',
	createReducer( null, {
		[ JETPACK_REMOTE_INSTALL_FAILURE ]: ( state, { errorCode } ) => errorCode,
		[ JETPACK_REMOTE_INSTALL_SUCCESS ]: () => null,
		[ JETPACK_REMOTE_INSTALL ]: () => null,
	} )
);

export default combineReducers( {
	error,
	inProgress,
	isComplete,
} );

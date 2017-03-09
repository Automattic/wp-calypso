/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	DIRECTLY_INITIALIZATION_START,
	DIRECTLY_INITIALIZATION_SUCCESS,
	DIRECTLY_INITIALIZATION_ERROR,
} from 'state/action-types';
import {
	STATUS_UNINITIALIZED,
	STATUS_INITIALIZING,
	STATUS_READY,
	STATUS_ERROR,
} from './constants';

export const status = createReducer( STATUS_UNINITIALIZED, {
	[ DIRECTLY_INITIALIZATION_START ]: () => STATUS_INITIALIZING,
	[ DIRECTLY_INITIALIZATION_SUCCESS ]: () => STATUS_READY,
	[ DIRECTLY_INITIALIZATION_ERROR ]: () => STATUS_ERROR,
} );

export default combineReducers( {
	status,
} );

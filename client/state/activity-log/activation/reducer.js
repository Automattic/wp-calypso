/**
 * External dependencies
 */
import {
	stubFalse,
	stubTrue,
} from 'lodash';

/**
 * Internal dependencies
 */
import {
	REWIND_ACTIVATE_FAILURE,
	REWIND_ACTIVATE_REQUEST,
	REWIND_ACTIVATE_SUCCESS,
	REWIND_DEACTIVATE_FAILURE,
	REWIND_DEACTIVATE_REQUEST,
	REWIND_DEACTIVATE_SUCCESS,
} from 'state/action-types';
import {
	createReducer,
	keyedReducer,
} from 'state/utils';

export const activationRequesting = keyedReducer( 'siteId', createReducer( {}, {
	[ REWIND_ACTIVATE_REQUEST ]: stubTrue,
	[ REWIND_ACTIVATE_FAILURE ]: stubFalse,
	[ REWIND_ACTIVATE_SUCCESS ]: stubFalse,
	[ REWIND_DEACTIVATE_REQUEST ]: stubTrue,
	[ REWIND_DEACTIVATE_FAILURE ]: stubFalse,
	[ REWIND_DEACTIVATE_SUCCESS ]: stubFalse,
} ) );

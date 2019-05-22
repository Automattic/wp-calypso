/** @format */

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { SIGNUP_SEGMENTS_SET } from 'state/action-types';

export default createReducer( null, {
	[ SIGNUP_SEGMENTS_SET ]: ( state, action ) => action.segments,
} );

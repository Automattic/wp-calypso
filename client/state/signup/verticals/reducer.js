/** @format */

/**
 * Internal dependencies
 */
import { createReducer, keyedReducer } from 'state/utils';
import { SIGNUP_VERTICALS_SET } from 'state/action-types';

const verticals = createReducer( null, {
	[ SIGNUP_VERTICALS_SET ]: ( state, action ) => action.verticals,
} );

export default keyedReducer( 'search', verticals );

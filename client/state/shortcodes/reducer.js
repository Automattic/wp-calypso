/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { merge } from 'lodash';

/**
 * Internal dependencies
 */
import { shortcodesSchema } from './schema';
import { createReducer } from 'state/utils';
import {
	SHORTCODE_RECEIVE,
	SHORTCODE_REQUEST,
	SHORTCODE_REQUEST_FAILURE,
	SHORTCODE_REQUEST_SUCCESS
} from 'state/action-types';

const createRequestingReducer = ( requesting ) => {
	return ( state, { siteId, shortcode } ) => {
		return merge( {}, state, {
			[ siteId ]: {
				[ shortcode ]: requesting
			}
		} );
	};
};

/**
 * Returns the updated requests state after an action has been dispatched. The
 * state maps site ID keys to the object with the site's shortcodes. Each shortcode
 * is true if it's being currently requested, false otherwise.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const requesting = createReducer( {}, {
	[ SHORTCODE_REQUEST ]: createRequestingReducer( true ),
	[ SHORTCODE_REQUEST_FAILURE ]: createRequestingReducer( false ),
	[ SHORTCODE_REQUEST_SUCCESS ]: createRequestingReducer( false ),
} );

/**
 * Returns the updated items state after an action has been dispatched. The
 * state maps site ID keys to an object that contains the site shortcodes.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const items = createReducer( {}, {
	[ SHORTCODE_RECEIVE ]: ( state, { siteId, shortcode, data } ) => {
		return merge( {}, state, {
			[ siteId ]: {
				[ shortcode ]: data
			}
		} );
	}
}, shortcodesSchema );

export default combineReducers( {
	requesting,
	items
} );

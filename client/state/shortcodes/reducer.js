/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { has } from 'lodash';

/**
 * Internal dependencies
 */
import { shortcodesSchema } from './schema';
import { createReducer } from 'state/utils';
import {
	SHORTCODE_FETCH,
	SHORTCODE_RECEIVE
} from 'state/action-types';

const requestingShortcode = ( state, siteId, shortcode, requesting ) => {
	const siteShortcodes = has( state, siteId ) ? state[ siteId ] : {};
	return {
		...state,
		[ siteId ]: {
			...siteShortcodes,
			[ shortcode ]: requesting
		}
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
	[ SHORTCODE_FETCH ]: ( state, { siteId, shortcode } ) => requestingShortcode( state, siteId, shortcode, true ),
	[ SHORTCODE_RECEIVE ]: ( state, { siteId, shortcode } ) => requestingShortcode( state, siteId, shortcode, false ),
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
		const siteShortcodes = has( state, siteId ) ? state[ siteId ] : {};
		return {
			...state,
			[ siteId ]: {
				...siteShortcodes,
				[ shortcode ]: data
			}
		};
	}
}, shortcodesSchema );

export default combineReducers( {
	requesting,
	items
} );

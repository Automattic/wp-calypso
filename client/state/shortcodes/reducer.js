/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { merge, intersection, pickBy } from 'lodash';

/**
 * Internal dependencies
 */
import { shortcodesSchema } from './schema';
import { createReducer } from 'state/utils';
import {
	SHORTCODE_MEDIA_UPDATE,
	SHORTCODE_RECEIVE,
	SHORTCODE_REQUEST,
	SHORTCODE_REQUEST_FAILURE,
	SHORTCODE_REQUEST_SUCCESS
} from 'state/action-types';
import Shortcode from 'lib/shortcode';

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
	[ SHORTCODE_REQUEST_SUCCESS ]: createRequestingReducer( false )
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
	[ SHORTCODE_MEDIA_UPDATE ]: ( state, { siteId, data } ) => {
		if ( ! state.hasOwnProperty( siteId ) ) {
			return state;
		}

		let media;
		if ( Array.isArray( data.media ) ) {
			media = data.media;
		} else {
			media = [ data ];
		}

		const updatedIds = media.map( ( item ) => item.ID.toString() );

		return Object.assign( {}, state, {
			[ siteId ]: pickBy( state[ siteId ], ( shortcode ) => {
				const parsed = Shortcode.parse( shortcode.shortcode );
				if ( parsed.tag !== 'gallery' || ! parsed.attrs.named || ! parsed.attrs.named.ids ) {
					return true;
				}

				const ids = parsed.attrs.named.ids.split( ',' );
				return ! intersection( ids, updatedIds ).length;
			} )
		} );
	},
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

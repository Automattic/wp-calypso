/**
 * External dependencies
 */
import { intersection, merge, pickBy } from 'lodash';

/**
 * Internal dependencies
 */
import { shortcodesSchema } from './schema';
import { combineReducers, createReducer, createReducerWithValidation } from 'state/utils';
import {
	SHORTCODE_RECEIVE,
	SHORTCODE_REQUEST,
	SHORTCODE_REQUEST_FAILURE,
	SHORTCODE_REQUEST_SUCCESS,
} from 'state/action-types';
import { registerActionForward } from 'lib/redux-bridge';
import { parse } from 'lib/shortcode';

registerActionForward( 'RECEIVE_MEDIA_ITEMS' );
registerActionForward( 'RECEIVE_MEDIA_ITEM' );

const createRequestingReducer = requesting => {
	return ( state, { siteId, shortcode } ) => {
		return merge( {}, state, {
			[ siteId ]: {
				[ shortcode ]: requesting,
			},
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
export const requesting = createReducer(
	{},
	{
		[ SHORTCODE_REQUEST ]: createRequestingReducer( true ),
		[ SHORTCODE_REQUEST_FAILURE ]: createRequestingReducer( false ),
		[ SHORTCODE_REQUEST_SUCCESS ]: createRequestingReducer( false ),
	}
);

function mediaItemsReducer( state, { siteId, data } ) {
	if ( ! state.hasOwnProperty( siteId ) ) {
		return state;
	}

	if ( ! data ) {
		return state;
	}
	const media = Array.isArray( data.media ) ? data.media : [ data ];
	const updatedIds = media.map( item => String( item.ID ) );

	return {
		...state,
		[ siteId ]: pickBy( state[ siteId ], shortcode => {
			const parsed = parse( shortcode.shortcode );
			if (
				parsed.tag !== 'gallery' ||
				! parsed.attrs ||
				! parsed.attrs.named ||
				! parsed.attrs.named.ids
			) {
				return true;
			}

			const ids = parsed.attrs.named.ids.split( ',' );
			return ! intersection( ids, updatedIds ).length;
		} ),
	};
}

/**
 * Returns the updated items state after an action has been dispatched. The
 * state maps site ID keys to an object that contains the site shortcodes.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const items = createReducerWithValidation(
	{},
	{
		FLUX_RECEIVE_MEDIA_ITEM: mediaItemsReducer,
		FLUX_RECEIVE_MEDIA_ITEMS: mediaItemsReducer,
		[ SHORTCODE_RECEIVE ]: ( state, { siteId, shortcode, data } ) => {
			return merge( {}, state, {
				[ siteId ]: {
					[ shortcode ]: data,
				},
			} );
		},
	},
	shortcodesSchema
);

export default combineReducers( {
	requesting,
	items,
} );

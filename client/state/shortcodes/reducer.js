/**
 * External dependencies
 */
import { merge } from 'lodash';

/**
 * Internal dependencies
 */
import { shortcodesSchema } from './schema';
import {
	combineReducers,
	withoutPersistence,
	withSchemaValidation,
	withStorageKey,
} from 'calypso/state/utils';
import {
	SHORTCODE_RECEIVE,
	SHORTCODE_REQUEST,
	SHORTCODE_REQUEST_FAILURE,
	SHORTCODE_REQUEST_SUCCESS,
} from 'calypso/state/action-types';

const createRequestingReducer = ( requesting ) => {
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
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const requesting = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case SHORTCODE_REQUEST:
			return createRequestingReducer( true )( state, action );
		case SHORTCODE_REQUEST_FAILURE:
			return createRequestingReducer( false )( state, action );
		case SHORTCODE_REQUEST_SUCCESS:
			return createRequestingReducer( false )( state, action );
	}

	return state;
} );

/**
 * Returns the updated items state after an action has been dispatched. The
 * state maps site ID keys to an object that contains the site shortcodes.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const items = withSchemaValidation( shortcodesSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case SHORTCODE_RECEIVE: {
			const { siteId, shortcode, data } = action;
			return merge( {}, state, {
				[ siteId ]: {
					[ shortcode ]: data,
				},
			} );
		}
	}

	return state;
} );

const combinedReducer = combineReducers( {
	requesting,
	items,
} );
export default withStorageKey( 'shortcodes', combinedReducer );

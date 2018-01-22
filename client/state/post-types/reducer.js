/** @format */

/**
 * External dependencies
 */

import { keyBy } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers, isValidStateWithSchema } from 'state/utils';
import * as schema from './schema';
import taxonomies from './taxonomies/reducer';
import { SERIALIZE, DESERIALIZE, POST_TYPES_RECEIVE } from 'state/action-types';

/**
 * Returns the updated items state after an action has been dispatched. The
 * state maps site ID keys to an object of post type name to post type for all
 * supported post types on the site.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function items( state = {}, action ) {
	switch ( action.type ) {
		case POST_TYPES_RECEIVE:
			return Object.assign( {}, state, {
				[ action.siteId ]: keyBy( action.types, 'name' ),
			} );

		case DESERIALIZE:
			if ( isValidStateWithSchema( state, schema.items ) ) {
				return state;
			}
			return {};
		case SERIALIZE:
			return state;
	}

	return state;
}
items.hasCustomPersistence = true;

export default combineReducers( {
	items,
	taxonomies,
} );

/** @format */

/**
 * External dependencies
 */

import { keyBy } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers, withSchemaValidation } from 'state/utils';
import { items as itemsSchema } from './schema';
import taxonomies from './taxonomies/reducer';
import { POST_TYPES_RECEIVE } from 'state/action-types';

/**
 * Returns the updated items state after an action has been dispatched. The
 * state maps site ID keys to an object of post type name to post type for all
 * supported post types on the site.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const items = withSchemaValidation( itemsSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case POST_TYPES_RECEIVE:
			return Object.assign( {}, state, {
				[ action.siteId ]: keyBy( action.types, 'name' ),
			} );

		default:
			return state;
	}
} );

export default combineReducers( {
	items,
	taxonomies,
} );

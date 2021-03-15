/**
 * External dependencies
 */
import { keyBy } from 'lodash';

/**
 * Internal dependencies
 */
import { withStorageKey } from '@automattic/state-utils';
import {
	combineReducers,
	keyedReducer,
	withSchemaValidation,
	withPersistence,
} from 'calypso/state/utils';
import { items as itemsSchema } from './schema';
import taxonomies from './taxonomies/reducer';
import { POST_TYPES_RECEIVE } from 'calypso/state/action-types';

/**
 * Returns the updated items state after an action has been dispatched. The
 * state maps site ID keys to an object of post type name to post type for all
 * supported post types on the site.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const items = withSchemaValidation(
	itemsSchema,
	keyedReducer(
		'siteId',
		withPersistence( ( state = null, action ) => {
			switch ( action.type ) {
				case POST_TYPES_RECEIVE:
					return keyBy( action.types, 'name' );
				default:
					return state;
			}
		} )
	)
);

const combinedReducer = combineReducers( {
	items,
	taxonomies,
} );

export default withStorageKey( 'postTypes', combinedReducer );

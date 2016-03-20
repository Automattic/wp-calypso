/**
 * External dependencies
 */
import filter from 'lodash/filter';
import includes from 'lodash/includes';
import sortBy from 'lodash/sortBy';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

/**
 * Returns true if currently requesting Reader lists, or
 * false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @return {Boolean}        Whether lists are being requested
 */
export function isRequestingSubscribedLists( state ) {
	return !! state.reader.lists.isRequesting;
}

/**
 * Returns the user's subscribed Reader lists.
 *
 * @param  {Object}  state  Global state tree
 * @return {?Object}        Reader lists
 */
export const getSubscribedLists = createSelector(
	( state ) => sortBy(
		filter( state.reader.lists.items, ( item ) => {
			// Is the user subscribed to this list?
			return includes( state.reader.lists.subscribedLists, item.ID );
		} ), 'slug' ),
	( state ) => [ state.reader.lists.items ]
);
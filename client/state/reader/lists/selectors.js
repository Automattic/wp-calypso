/**
 * External dependencies
 */
import filter from 'lodash/filter';
import includes from 'lodash/includes';
import get from 'lodash/get';

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
export function getSubscribedLists( state ) {
	if ( ! get( state, 'reader.lists.items' ) || ! get( state, 'reader.lists.subscribedLists' ) ) {
		return null;
	}

	return filter( state.reader.lists.items, ( item ) => {
		// Is the user subscribed to this list?
		return includes( state.reader.lists.subscribedLists, item.ID );
	} );
}

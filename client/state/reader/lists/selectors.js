/**
 * External dependencies
 */
import toArray from 'lodash/toArray';

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
	if ( ! state.reader.lists.items ) {
		return null;
	}

	return toArray( state.reader.lists.items );
}

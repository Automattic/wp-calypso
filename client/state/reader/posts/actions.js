/**
 * Internal dependencies
 */
import {
	READER_POSTS_RECEIVE
} from 'state/action-types';

/**
 * Returns an action object to signal that post objects have been received.
 *
 * @param  {Array}  posts Posts received
 * @return {Object} Action object
 */
export function receivePosts( posts ) {
	return {
		type: READER_POSTS_RECEIVE,
		posts
	};
}

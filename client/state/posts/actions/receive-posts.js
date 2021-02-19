/**
 * Internal dependencies
 */
import { POSTS_RECEIVE } from 'calypso/state/action-types';

import 'calypso/state/posts/init';

/**
 * Returns an action object to be used in signalling that post objects have
 * been received.
 *
 * @param  {Array}   posts      Posts received
 * @param  {?string} saveMarker Save marker in the edits log
 * @returns {object}             Action object
 */
export function receivePosts( posts, saveMarker ) {
	const action = { type: POSTS_RECEIVE, posts };
	if ( saveMarker ) {
		action.saveMarker = saveMarker;
	}
	return action;
}

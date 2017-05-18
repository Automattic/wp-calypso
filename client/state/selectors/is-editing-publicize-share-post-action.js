/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * @param  {Object}   state    Global state tree
 * @param  {Number}   siteId   The ID of the site we're querying
 * @param  {Number}   postId   The ID of the post we're querying
 * @param  {Number}   actionId   The ID of specific share post action we're querying
 * @return {?Boolean}          Whether currently editing sharePost action.
 */
export default function isEditingPublicizeSharePostAction( state, siteId, postId, actionId ) {
	return get( state, [ 'sharing', 'sharePostActions', 'items', siteId, postId, actionId ], false );
}

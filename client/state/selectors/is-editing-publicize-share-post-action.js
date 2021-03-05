/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/sharing/init';

/**
 * @param  {object}   state    Global state tree
 * @param  {number}   siteId   The ID of the site we're querying
 * @param  {number}   postId   The ID of the post we're querying
 * @param  {number}   actionId   The ID of specific share post action we're querying
 * @returns {?boolean}          Whether currently editing sharePost action.
 */
export default function isEditingPublicizeSharePostAction( state, siteId, postId, actionId ) {
	return get( state, [ 'sharing', 'sharePostActions', 'items', siteId, postId, actionId ], false );
}

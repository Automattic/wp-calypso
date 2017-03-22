/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { mergeShareActionWithPublicizeConnections } from './get-post-share-scheduled-actions';

/**
 * Return a sharing-actions array propagaring data from publicize connections,
 * creating a Date (moment) instance for the shareDate, etc.
 *
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @param {Number} postId Shared Post ID
 * @return {Object} sharing actions array
 */
export default function getPostSharePublishedActions( state, siteId, postId ) {
	const postShareActions = get( state, [ 'sharing', 'publicize', 'sharePostActions', 'published', siteId, postId ], [] );
	return mergeShareActionWithPublicizeConnections( state, postShareActions );
}

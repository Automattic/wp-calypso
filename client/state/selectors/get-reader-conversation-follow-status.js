/*
 * @format
 */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { key } from 'state/reader/conversations/utils';

/*
 * Get the follow status for a given post
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number} siteId
 * @param  {Number} postId
 * @return {String} Follow status
 */
export default function getReaderConversationFollowStatus( state, { siteId, postId } ) {
	return get( state, [ 'reader', 'conversations', 'items', key( siteId, postId ) ], null );
}

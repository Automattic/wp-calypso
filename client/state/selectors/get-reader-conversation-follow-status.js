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
 * Get the conversation following status for a given post
 *
 * @param  {Object}  state  Global state tree
 * @param  {Object} params Params including siteId and postId
 * @return {String|null} Conversation follow status (F for following, M for muting, or null)
 */
export default function getReaderConversationFollowStatus( state, { siteId, postId } ) {
	return get( state, [ 'reader', 'conversations', 'items', key( siteId, postId ) ], null );
}

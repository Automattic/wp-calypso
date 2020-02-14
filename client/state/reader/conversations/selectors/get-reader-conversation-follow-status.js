/**
 * Internal dependencies
 */
import { key } from 'state/reader/conversations/utils';

import 'state/reader/init';

/*
 * Get the conversation following status for a given post
 *
 * @param  {object}  state  Global state tree
 * @param  {object} params Params including siteId and postId
 * @returns {string|null} Conversation follow status (F for following, M for muting, or null)
 */
export default function getReaderConversationFollowStatus( state, { siteId, postId } ) {
	return state?.reader?.conversations?.items?.[ key( siteId, postId ) ] ?? null;
}

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
import { key } from 'state/reader/remembered-posts/utils';
import { READER_REMEMBERED_POSTS_STATUS } from 'state/reader/remembered-posts/status';

/*
 * Get the conversation following status for a given post
 *
 * @param  {Object}  state  Global state tree
 * @param  {Object} params Params including siteId and postId
 * @return {Boolean} Is the user following this conversation?
 */
export default function isRememberedPost( state, { siteId, postId } ) {
	return (
		get( state, [ 'reader', 'remembered-posts', 'items', key( siteId, postId ) ] ) ===
		READER_REMEMBERED_POSTS_STATUS.remembered
	);
}

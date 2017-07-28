/**
 * Internal dependencies
 */
import {
	POST_SHARE_A_DRAFT_REQUEST,
	POST_SHARE_A_DRAFT_RECEIVE,
	POST_SHARE_A_DRAFT_ENABLE,
	POST_SHARE_A_DRAFT_DISABLE,
} from 'state/action-types';

export const requestDraftSharing = ( siteId, postId ) => ( {
	type: POST_SHARE_A_DRAFT_REQUEST,
	siteId,
	postId,
} );

export const receiveDraftSharing = ( siteId, postId, { isEnabled, link } ) => ( {
	type: POST_SHARE_A_DRAFT_RECEIVE,
	siteId,
	postId,
	isEnabled,
	link,
} );

export const enableDraftSharing = ( siteId, postId ) => ( {
	type: POST_SHARE_A_DRAFT_ENABLE,
	siteId,
	postId,
} );

export const disableDraftSharing = ( siteId, postId ) => ( {
	type: POST_SHARE_A_DRAFT_DISABLE,
	siteId,
	postId,
} );

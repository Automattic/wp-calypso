/**
 * Internal dependencies
 */
import {
	POST_SHARE_A_DRAFT_REQUEST,
	POST_SHARE_A_DRAFT_ADD,
	POST_SHARE_A_DRAFT_ENABLE,
	POST_SHARE_A_DRAFT_DISABLE,
	POST_SHARE_A_DRAFT_SET_ENABLED,
} from 'state/action-types';

export const requestDraftSharing = ( siteId, postId ) => ( {
	type: POST_SHARE_A_DRAFT_REQUEST,
	siteId,
	postId,
} );

export const addDraftSharing = ( siteId, postId, { isEnabled, link } ) => ( {
	type: POST_SHARE_A_DRAFT_ADD,
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

export const setDraftSharingEnabled = ( siteId, postId, isEnabled ) => ( {
	type: POST_SHARE_A_DRAFT_SET_ENABLED,
	siteId,
	postId,
	isEnabled,
} );

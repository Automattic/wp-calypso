/** @format */
/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	POST_SHARE_A_DRAFT_REQUEST,
	POST_SHARE_A_DRAFT_ENABLE,
	POST_SHARE_A_DRAFT_DISABLE,
} from 'state/action-types';
import { addDraftSharing, setDraftSharingEnabled } from 'state/draft-sharing/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';

function draftSharingPath( siteId, postId ) {
	return `/sites/${ siteId }/posts/${ postId }/draft-sharing`;
}

// Expose for unit test
export const fromApi = data => ( {
	isEnabled: data.is_enabled,
	link: data.link,
} );

export const validate = ( { is_enabled, link } ) => {
	return typeof is_enabled === 'boolean' && typeof link === 'string';
};

export const fetchDraftSharing = ( { dispatch }, { siteId, postId } ) => {
	dispatch(
		http( {
			method: 'GET',
			path: draftSharingPath( siteId, postId ),
		} )
	);
};
export const fetchDraftSharingSuccess = ( { dispatch }, { siteId, postId }, response ) => {
	if ( ! validate( response ) ) {
		throw new Error( 'Unexpected response from draft-sharing endpoint' );
	}

	dispatch( addDraftSharing( siteId, postId, fromApi( response ) ) );
};
export const fetchDraftSharingFailure = ( { dispatch } ) => {
	dispatch( errorNotice( translate( 'There was a problem retrieving Share a Draft settings' ) ) );
};

export const enableDraftSharing = ( { dispatch }, { siteId, postId } ) => {
	dispatch(
		http( {
			method: 'PATCH',
			path: draftSharingPath( siteId, postId ),
			body: { is_enabled: true },
		} )
	);
};
export const enableDraftSharingSuccess = ( { dispatch }, { siteId, postId } ) => {
	dispatch( setDraftSharingEnabled( { siteId, postId, isEnabled: true } ) );
};
export const enableDraftSharingFailure = ( { dispatch } ) => {
	dispatch( errorNotice( translate( 'There was a problem enabling Share a Draft' ) ) );
};

export const disableDraftSharing = ( { dispatch }, { siteId, postId } ) => {
	dispatch(
		http( {
			method: 'PATCH',
			path: draftSharingPath( siteId, postId ),
			body: { is_enabled: false },
		} )
	);
};
export const disableDraftSharingSuccess = ( { dispatch }, { siteId, postId } ) => {
	dispatch( setDraftSharingEnabled( { siteId, postId, isEnabled: true } ) );
};
export const disableDraftSharingFailure = ( { dispatch } ) => {
	dispatch( errorNotice( translate( 'There was a problem disabling Share a Draft' ) ) );
};

export default {
	[ POST_SHARE_A_DRAFT_REQUEST ]: [
		dispatchRequest( fetchDraftSharing, fetchDraftSharingSuccess, fetchDraftSharingFailure ),
	],
	[ POST_SHARE_A_DRAFT_ENABLE ]: [
		dispatchRequest( enableDraftSharing, enableDraftSharingSuccess, enableDraftSharingFailure ),
	],
	[ POST_SHARE_A_DRAFT_DISABLE ]: [
		dispatchRequest( disableDraftSharing, disableDraftSharingSuccess, disableDraftSharingFailure ),
	],
};

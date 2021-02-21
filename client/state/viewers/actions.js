/**
 * Internal dependencies
 */
import {
	VIEWER_REMOVE,
	VIEWER_REMOVE_SUCCESS,
	VIEWERS_REQUEST,
	VIEWERS_REQUEST_SUCCESS,
	VIEWERS_REQUEST_FAILURE,
} from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/viewers';
import 'calypso/state/viewers/init';

export const requestViewers = ( siteId, page, number ) => ( {
	type: VIEWERS_REQUEST,
	siteId,
	page,
	number,
} );

export const requestViewersSuccess = ( siteId, data ) => ( {
	type: VIEWERS_REQUEST_SUCCESS,
	siteId,
	data,
} );

export const requestViewersFailure = ( siteId, error ) => ( {
	type: VIEWERS_REQUEST_FAILURE,
	siteId,
	error,
} );

export const removeViewer = ( siteId, viewerId ) => ( {
	type: VIEWER_REMOVE,
	siteId,
	viewerId,
} );

export const removeViewerSuccess = ( siteId, viewerId, data ) => ( {
	type: VIEWER_REMOVE_SUCCESS,
	siteId,
	viewerId,
	data,
} );

/**
 * Internal dependencies
 */
import {
	VIEWER_REMOVE,
	VIEWER_REMOVE_SUCCESS,
	VIEWER_REMOVE_FAILURE,
	VIEWERS_REQUEST,
	VIEWERS_REQUEST_SUCCESS,
	VIEWERS_REQUEST_FAILURE,
} from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/viewers';
import 'calypso/state/viewers/init';

export const requestViewers = ( siteId, query ) => ( {
	type: VIEWERS_REQUEST,
	siteId,
	query,
} );

export const requestViewersSuccess = ( siteId, query, data ) => ( {
	type: VIEWERS_REQUEST_SUCCESS,
	siteId,
	query,
	data,
} );

export const requestViewersFailure = ( siteId, query, error ) => ( {
	type: VIEWERS_REQUEST_FAILURE,
	siteId,
	query,
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

export const removeViewerFailure = ( siteId, viewerId, error ) => ( {
	type: VIEWER_REMOVE_FAILURE,
	siteId,
	viewerId,
	error,
} );

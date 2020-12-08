/**
 * Internal dependencies
 */
import {
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

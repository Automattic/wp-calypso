/**
 * Internal dependencies
 */
import {
	SITE_UPDATES_RECEIVE,
	SITE_UPDATES_REQUEST,
	SITE_UPDATES_REQUEST_SUCCESS,
	SITE_UPDATES_REQUEST_FAILURE,
} from 'state/action-types';

export const siteUpdatesReceiveAction = ( siteId, updates ) => ( {
	type: SITE_UPDATES_RECEIVE,
	siteId,
	updates
} );

export const siteUpdatesRequestAction = siteId => ( {
	type: SITE_UPDATES_REQUEST,
	siteId
} );

export const siteUpdatesRequestSuccessAction = siteId => ( {
	type: SITE_UPDATES_REQUEST_SUCCESS,
	siteId
} );

export const siteUpdatesRequestFailureAction = ( siteId, error ) => ( {
	type: SITE_UPDATES_REQUEST_FAILURE,
	siteId,
	error
} );

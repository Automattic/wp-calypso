/**
 * Internal dependencies
 */
import {
	SITE_UPDATES_RECEIVE,
	SITE_UPDATES_REQUEST,
	SITE_UPDATES_REQUEST_SUCCESS,
	SITE_UPDATES_REQUEST_FAILURE,
	SITE_WORDPRESS_UPDATE_REQUEST,
	SITE_WORDPRESS_UPDATE_REQUEST_SUCCESS,
	SITE_WORDPRESS_UPDATE_REQUEST_FAILURE,
} from 'state/action-types';
import wpcom from 'lib/wp';

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

export const updateWordPress = ( siteId ) => {
	return ( dispatch ) => {
		dispatch( {
			type: SITE_WORDPRESS_UPDATE_REQUEST,
			siteId,
		} );

		return wpcom.undocumented().updateWordPressCore( siteId )
			.then( () => {
				dispatch( {
					type: SITE_WORDPRESS_UPDATE_REQUEST_SUCCESS,
					siteId,
				} );
			} ).catch( ( error ) => {
				dispatch( {
					type: SITE_WORDPRESS_UPDATE_REQUEST_FAILURE,
					siteId,
					error,
				} );
			} );
	};
};

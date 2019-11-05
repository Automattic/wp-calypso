/**
 * External dependencies
 */
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import wpcom from 'lib/wp';
import {
	SITE_REDIRECT_FETCH,
	SITE_REDIRECT_FETCH_COMPLETED,
	SITE_REDIRECT_FETCH_FAILED,
	SITE_REDIRECT_NOTICE_CLOSE,
	SITE_REDIRECT_UPDATE,
	SITE_REDIRECT_UPDATE_COMPLETED,
	SITE_REDIRECT_UPDATE_FAILED,
} from './action-types';

export function closeSiteRedirectNotice( siteId ) {
	Dispatcher.handleViewAction( {
		type: SITE_REDIRECT_NOTICE_CLOSE,
		siteId,
	} );
}

export function fetchSiteRedirect( siteId ) {
	Dispatcher.handleViewAction( {
		type: SITE_REDIRECT_FETCH,
		siteId,
	} );

	wpcom.undocumented().getSiteRedirect( siteId, ( error, data ) => {
		if ( data && data.location ) {
			Dispatcher.handleServerAction( {
				type: SITE_REDIRECT_FETCH_COMPLETED,
				location: data.location,
				siteId,
			} );
		} else if ( error && error.message ) {
			Dispatcher.handleServerAction( {
				type: SITE_REDIRECT_FETCH_FAILED,
				error: error.message,
				siteId,
			} );
		} else {
			Dispatcher.handleServerAction( {
				type: SITE_REDIRECT_FETCH_FAILED,
				error: i18n.translate(
					'There was a problem retrieving the redirect settings. Please try again later or contact support.'
				),
				siteId,
			} );
		}
	} );
}

export function updateSiteRedirect( siteId, location, onComplete ) {
	Dispatcher.handleViewAction( {
		type: SITE_REDIRECT_UPDATE,
		siteId,
	} );

	wpcom.undocumented().setSiteRedirect( siteId, location, ( error, data ) => {
		let success = false;

		if ( data && data.success ) {
			Dispatcher.handleServerAction( {
				type: SITE_REDIRECT_UPDATE_COMPLETED,
				location,
				siteId,
				success: i18n.translate( 'The redirect settings were updated successfully.' ),
			} );

			success = true;
		} else if ( error && error.message ) {
			Dispatcher.handleServerAction( {
				type: SITE_REDIRECT_UPDATE_FAILED,
				error: error.message,
				siteId,
			} );
		} else {
			Dispatcher.handleServerAction( {
				type: SITE_REDIRECT_UPDATE_FAILED,
				error: i18n.translate(
					'There was a problem updating the redirect settings. Please try again later or contact support.'
				),
				siteId,
			} );
		}

		onComplete( success );
	} );
}

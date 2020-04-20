/**
 * External dependencies
 */
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	DOMAINS_SITE_REDIRECT_FETCH,
	DOMAINS_SITE_REDIRECT_FETCH_COMPLETED,
	DOMAINS_SITE_REDIRECT_FETCH_FAILED,
	DOMAINS_SITE_REDIRECT_NOTICE_CLOSE,
	DOMAINS_SITE_REDIRECT_UPDATE,
	DOMAINS_SITE_REDIRECT_UPDATE_COMPLETED,
	DOMAINS_SITE_REDIRECT_UPDATE_FAILED,
} from 'state/action-types';

export function closeSiteRedirectNotice( siteId ) {
	return {
		type: DOMAINS_SITE_REDIRECT_NOTICE_CLOSE,
		siteId,
	};
}

export const fetchSiteRedirect = ( siteId ) => ( dispatch ) => {
	dispatch( { type: DOMAINS_SITE_REDIRECT_FETCH, siteId } );

	wpcom
		.undocumented()
		.getSiteRedirect( siteId )
		.then(
			( { location } ) => {
				dispatch( { type: DOMAINS_SITE_REDIRECT_FETCH_COMPLETED, siteId, location } );
			},
			( error ) => {
				dispatch( {
					type: DOMAINS_SITE_REDIRECT_FETCH_FAILED,
					siteId,
					error: error
						? error.message
						: i18n.translate(
								'There was a problem retrieving the redirect settings. Please try again later or contact support.'
						  ),
				} );
			}
		);
};

export const updateSiteRedirect = ( siteId, location ) => ( dispatch ) => {
	dispatch( { type: DOMAINS_SITE_REDIRECT_UPDATE, siteId } );

	return wpcom
		.undocumented()
		.setSiteRedirect( siteId, location )
		.then(
			( data ) => {
				if ( data.success ) {
					dispatch( {
						type: DOMAINS_SITE_REDIRECT_UPDATE_COMPLETED,
						siteId,
						location,
						success: i18n.translate( 'The redirect settings were updated successfully.' ),
					} );
					return true;
				}

				dispatch( {
					type: DOMAINS_SITE_REDIRECT_UPDATE_FAILED,
					siteId,
					error: i18n.translate(
						'There was a problem updating the redirect settings. Please try again later or contact support.'
					),
				} );
				return false;
			},
			( error ) => {
				dispatch( {
					type: DOMAINS_SITE_REDIRECT_UPDATE_FAILED,
					siteId,
					error: error.message,
				} );
				return false;
			}
		);
};

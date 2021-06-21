/**
 * External dependencies
 */

import debugFactory from 'debug';
import i18n from 'i18n-calypso';

const debug = debugFactory( 'calypso:site-features:actions' );

/**
 * Internal dependencies
 */
import { createSiteFeaturesObject } from './assembler';
import {
	SITE_FEATURES_FETCH,
	SITE_FEATURES_FETCH_COMPLETED,
	SITE_FEATURES_FETCH_FAILED,
	SITE_FEATURES_REMOVE,
} from 'calypso/state/action-types';
import wpcom from 'calypso/lib/wp';

/**
 * Returns an action object to be used in signalling that features for the given site have been cleared.
 *
 * @param {number} siteId identifier of the site
 * @returns {object} the corresponding action object
 */
export function clearSiteFeatures( siteId ) {
	return {
		type: SITE_FEATURES_REMOVE,
		siteId,
	};
}

/**
 * Fetches features for the given site.
 *
 * @param {number} siteId identifier of the site
 * @returns {Function} a promise that will resolve once fetching is completed
 */
export function fetchSiteFeatures( siteId ) {
	return ( dispatch ) => {
		dispatch( {
			type: SITE_FEATURES_FETCH,
			siteId,
		} );

		return new Promise( ( resolve ) => {
			wpcom.undocumented().getSiteFeatures( siteId, ( error, data ) => {
				if ( error ) {
					debug( 'Fetching site features failed: ', error );

					const errorMessage =
						error.message ||
						i18n.translate(
							'There was a problem fetching site features. Please try again later or contact support.'
						);

					dispatch( {
						type: SITE_FEATURES_FETCH_FAILED,
						siteId,
						error: errorMessage,
					} );
				} else {
					dispatch( fetchSiteFeaturesCompleted( siteId, data ) );
				}

				resolve();
			} );
		} );
	};
}

/**
 * Returns an action object to be used in signalling that an object containing
 * the features for a given site have been received.
 *
 * @param {number} siteId - identifier of the site
 * @param {object} features - list of features received from the API
 * @returns {object} the corresponding action object
 */
export function fetchSiteFeaturesCompleted( siteId, features ) {
	return {
		type: SITE_FEATURES_FETCH_COMPLETED,
		siteId,
		features: createSiteFeaturesObject( features ),
	};
}

/**
 * Clears features and fetches them for the given site.
 *
 * @param {number} siteId identifier of the site
 * @returns {Function} the corresponding action thunk
 */
export function refreshSiteFeatures( siteId ) {
	return ( dispatch ) => {
		dispatch( clearSiteFeatures( siteId ) );
		dispatch( fetchSiteFeatures( siteId ) );
	};
}

/**
 * External dependencies
 */

import debugFactory from 'debug';
import { mapValues } from 'lodash';
import i18n from 'i18n-calypso';

const debug = debugFactory( 'calypso:site-products:actions' );

/**
 * Internal dependencies
 */
import { createSiteProductObject } from './assembler';
import {
	SITE_PRODUCTS_FETCH,
	SITE_PRODUCTS_FETCH_COMPLETED,
	SITE_PRODUCTS_FETCH_FAILED,
	SITE_PRODUCTS_REMOVE,
} from 'state/action-types';
import wpcom from 'lib/wp';

/**
 * Returns an action object to be used in signalling that products for the given site have been cleared.
 *
 * @param {number} siteId identifier of the site
 * @returns {object} the corresponding action object
 */
export function clearSiteProducts( siteId ) {
	return {
		type: SITE_PRODUCTS_REMOVE,
		siteId,
	};
}

/**
 * Fetches products for the given site.
 *
 * @param {number} siteId identifier of the site
 * @returns {Function} a promise that will resolve once fetching is completed
 */
export function fetchSiteProducts( siteId ) {
	return ( dispatch ) => {
		dispatch( {
			type: SITE_PRODUCTS_FETCH,
			siteId,
		} );

		return new Promise( ( resolve ) => {
			wpcom.undocumented().getSiteProducts( siteId, ( error, data ) => {
				if ( error ) {
					debug( 'Fetching site products failed: ', error );

					const errorMessage =
						error.message ||
						i18n.translate(
							'There was a problem fetching site products. Please try again later or contact support.'
						);

					dispatch( {
						type: SITE_PRODUCTS_FETCH_FAILED,
						siteId,
						error: errorMessage,
					} );
				} else {
					dispatch( fetchSiteProductsCompleted( siteId, data ) );
				}

				resolve();
			} );
		} );
	};
}

/**
 * Returns an action object to be used in signalling that an object containing
 * the products for a given site have been received.
 *
 * @param {number} siteId - identifier of the site
 * @param {object} products - list of products received from the API
 * @returns {object} the corresponding action object
 */
export function fetchSiteProductsCompleted( siteId, products ) {
	return {
		type: SITE_PRODUCTS_FETCH_COMPLETED,
		siteId,
		products: mapValues( products, createSiteProductObject ),
	};
}

/**
 * Clears products and fetches them for the given site.
 *
 * @param {number} siteId identifier of the site
 * @returns {Function} the corresponding action thunk
 */
export function refreshSiteProducts( siteId ) {
	return ( dispatch ) => {
		dispatch( clearSiteProducts( siteId ) );
		dispatch( fetchSiteProducts( siteId ) );
	};
}

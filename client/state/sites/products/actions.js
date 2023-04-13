import debugFactory from 'debug';
import i18n from 'i18n-calypso';
import { mapValues } from 'lodash';
import wpcom from 'calypso/lib/wp';
import {
	SITE_PRODUCTS_FETCH,
	SITE_PRODUCTS_FETCH_COMPLETED,
	SITE_PRODUCTS_FETCH_FAILED,
} from 'calypso/state/action-types';
import { createSiteProductObject } from './assembler';

import 'calypso/state/currency-code/init';

const debug = debugFactory( 'calypso:site-products:actions' );

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

		return wpcom.req
			.get( `/sites/${ siteId }/products` )
			.then( ( data ) => {
				dispatch( fetchSiteProductsCompleted( siteId, data ) );
			} )
			.catch( ( error ) => {
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
			} );
	};
}

/**
 * Returns an action object to be used in signalling that an object containing
 * the products for a given site have been received.
 *
 * @param {number} siteId - identifier of the site
 * @param {Object} products - list of products received from the API
 * @returns {Object} the corresponding action object
 */
export function fetchSiteProductsCompleted( siteId, products ) {
	return {
		type: SITE_PRODUCTS_FETCH_COMPLETED,
		siteId,
		products: mapValues( products, createSiteProductObject ),
	};
}

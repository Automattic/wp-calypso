/**
 * External dependencies
 */

import { pickBy } from 'lodash';

/**
 * Internal dependencies
 */
import { initialSiteState } from './reducer';

export function getProductsBySiteId( state, siteId ) {
	if ( ! siteId ) {
		return initialSiteState;
	}
	return state.sites.products[ siteId ] || initialSiteState;
}

export function getAvailableProductsBySiteId( state, siteId ) {
	const products = getProductsBySiteId( state, siteId );
	if ( products.data ) {
		products.data = pickBy( products.data, ( product ) => product.available );
	}
	return products;
}

export function isRequestingSiteProducts( state, siteId ) {
	const products = getProductsBySiteId( state, siteId );
	return products.isRequesting;
}

/**
 * Internal dependencies
 */
import { get } from 'lodash';
import {
	WOOCOMMERCE_API_CREATE_PRODUCT,
} from 'woocommerce/state/action-types';

export default {
	[ WOOCOMMERCE_API_CREATE_PRODUCT ]: productCreate,
};

function productCreate( siteData, action ) {
	const data = get( action, 'meta.dataLayer.data.data' );

	if ( data ) {
		return updateCachedProduct( siteData, data );
	}

	return siteData;
}

function updateCachedProduct( siteData, product ) {
	const products = siteData.products || [];

	let found = false;
	const newProducts = products.map( ( p ) => {
		if ( p.id === product.id ) {
			found = true;
			return product;
		}
		return p;
	} );

	if ( ! found ) {
		newProducts.push( product );
	}

	return { ...siteData, products: newProducts };
}


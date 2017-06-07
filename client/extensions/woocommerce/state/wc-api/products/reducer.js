/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_PRODUCT_UPDATED,
} from '../../action-types';

export default {
	[ WOOCOMMERCE_PRODUCT_UPDATED ]: productUpdated,
};

function productUpdated( siteData, action ) {
	const { data } = action.payload;

	return updateCachedProduct( siteData, data );
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


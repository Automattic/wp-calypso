import 'calypso/state/products-list/init';
import { getProductsList } from '../selectors/get-products-list';

export const isSaasProduct = ( state, productSlug ) => {
	if ( ! productSlug ) {
		return false;
	}

	const productsList = getProductsList( state );

	// storeProductSlug is from the legacy store_products system, billing_product_slug is from
	// the non-legacy billing system and for marketplace plugins will match the slug of the plugin
	// by convention.
	return Object.entries( productsList ).some(
		( [ storeProductSlug, { product_type, billing_product_slug } ] ) =>
			( productSlug === storeProductSlug || productSlug === billing_product_slug ) &&
			typeof product_type === 'string' &&
			product_type === 'saas_plugin'
	);
};

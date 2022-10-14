import 'calypso/state/products-list/init';
import { getProductsList } from '../selectors/get-products-list';

export const isSaasProduct = ( state, productSlug ) => {
	if ( ! productSlug ) return false;

	// Note: Converting the slug and accessing the productsList by key
	// is more than 10 times faster than traversing the list
	const snakeCaseSlug = productSlug.replace( /-/g, '_' );
	const productsList = getProductsList( state );

	return productsList[ snakeCaseSlug ]?.product_type === 'saas_plugin';
};

import 'calypso/state/products-list/init';
import { getProductsList } from '../selectors/get-products-list';

export const isSaasProduct = ( state, productSlug ) => {
	// TODO: Check if there is a better way to transform between kebab-case and snake_case
	if ( ! productSlug ) return false;
	const camelSlug = productSlug.replace( /-/g, '_' );
	const productsList = getProductsList( state );
	return productsList[ camelSlug ]?.product_type === 'saas_plugin';
};

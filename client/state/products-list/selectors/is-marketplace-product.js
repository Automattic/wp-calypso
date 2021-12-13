import 'calypso/state/products-list/init';
import { hasMarketplaceProduct } from '@automattic/calypso-products';
import { getProductsList } from '../selectors/get-products-list';

export const isMarketplaceProduct = ( state, productSlug ) => {
	const productsList = getProductsList( state );
	return hasMarketplaceProduct( productsList, productSlug );
};

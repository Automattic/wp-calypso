import { JETPACK_PRODUCTS_INCLUDED_IN_PLAN_MAP } from '@automattic/calypso-products';
import { SelectorProduct } from '../types';

export const getSlugsOfProductsInludedInBundle = (
	product: SelectorProduct
): ReadonlyArray< string > => {
	const planSlug = product.productSlug as keyof typeof JETPACK_PRODUCTS_INCLUDED_IN_PLAN_MAP;

	return JETPACK_PRODUCTS_INCLUDED_IN_PLAN_MAP[ planSlug ] || [];
};

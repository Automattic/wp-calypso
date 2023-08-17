import type { ResponseCartProduct } from '@automattic/shopping-cart';

/**
 * @param product Product to check.
 * @returns boolean indicating whether the product is a multi-year domain product.
 */
export function isMultiYearDomainProduct( product: ResponseCartProduct ): boolean {
	return Boolean( product?.is_domain_registration ) && 'volume' in product;
}

/**
 * Internal dependencies
 */
import * as ProductConstants from 'calypso/lib/products-values/constants';
import { BillingTerm, ItemType } from '../attributes';
import { PurchasableProduct } from '../types';

const commonAttributes = {
	itemType: ItemType.PRODUCT,
	family: ProductConstants.PRODUCT_JETPACK_SEARCH,
};

export const SearchAnnual: PurchasableProduct = {
	slug: ProductConstants.PRODUCT_JETPACK_SEARCH,
	attributes: {
		...commonAttributes,
		billingTerm: BillingTerm.ANNUAL,
	},
} as const;

export const SearchMonthly: PurchasableProduct = {
	slug: ProductConstants.PRODUCT_JETPACK_SEARCH_MONTHLY,
	attributes: {
		...commonAttributes,
		billingTerm: BillingTerm.MONTHLY,
	},
} as const;

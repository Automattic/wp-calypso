/**
 * Internal dependencies
 */
import * as ProductConstants from 'calypso/lib/products-values/constants';
import { BillingTerm, ItemType } from '../attributes';
import { PurchasableProduct } from '../types';

const commonAttributes = {
	itemType: ItemType.PRODUCT,
	family: ProductConstants.PRODUCT_JETPACK_ANTI_SPAM,
};

export const AntispamAnnual: PurchasableProduct = {
	slug: ProductConstants.PRODUCT_JETPACK_ANTI_SPAM,
	attributes: {
		...commonAttributes,
		billingTerm: BillingTerm.ANNUAL,
	},
} as const;

export const AntispamMonthly: PurchasableProduct = {
	slug: ProductConstants.PRODUCT_JETPACK_ANTI_SPAM_MONTHLY,
	attributes: {
		...commonAttributes,
		billingTerm: BillingTerm.MONTHLY,
	},
} as const;

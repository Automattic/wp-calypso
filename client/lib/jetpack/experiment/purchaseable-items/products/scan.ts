/**
 * Internal dependencies
 */
import * as ProductConstants from 'calypso/lib/products-values/constants';
import { BillingTerm, ItemType } from '../attributes';
import { PurchaseableProduct } from '../types';

const commonAttributes = {
	itemType: ItemType.PRODUCT,
	family: ProductConstants.PRODUCT_JETPACK_SCAN,
};

export const ScanAnnual: PurchaseableProduct = {
	slug: ProductConstants.PRODUCT_JETPACK_SCAN,
	attributes: {
		...commonAttributes,
		billingTerm: BillingTerm.ANNUAL,
	},
} as const;

export const ScanMonthly: PurchaseableProduct = {
	slug: ProductConstants.PRODUCT_JETPACK_SCAN_MONTHLY,
	attributes: {
		...commonAttributes,
		billingTerm: BillingTerm.MONTHLY,
	},
} as const;

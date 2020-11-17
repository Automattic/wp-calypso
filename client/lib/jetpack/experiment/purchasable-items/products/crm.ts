/**
 * Internal dependencies
 */
import * as MySitesPlansV2 from 'calypso/my-sites/plans-v2/constants';
import { BillingTerm, ItemType } from '../attributes';
import type { PurchasableProduct } from '../types';

const commonAttributes = {
	itemType: ItemType.PRODUCT,
	family: MySitesPlansV2.EXTERNAL_PRODUCT_CRM.productSlug,
};

export const CrmAnnual: PurchasableProduct = {
	slug: MySitesPlansV2.EXTERNAL_PRODUCT_CRM.productSlug,
	attributes: {
		...commonAttributes,
		billingTerm: BillingTerm.ANNUAL,
	},
} as const;

export const CrmMonthly: PurchasableProduct = {
	slug: MySitesPlansV2.EXTERNAL_PRODUCT_CRM_MONTHLY.productSlug,
	attributes: {
		...commonAttributes,
		billingTerm: BillingTerm.MONTHLY,
	},
} as const;

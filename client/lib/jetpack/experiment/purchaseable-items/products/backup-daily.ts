/**
 * Internal dependencies
 */
import * as ProductConstants from 'calypso/lib/products-values/constants';
import { BillingTerm, DailyRealtimeOption, ItemType } from '../attributes';
import type { PurchaseableProduct } from '../types';

const commonAttributes = {
	itemType: ItemType.PRODUCT,
	family: ProductConstants.PRODUCT_JETPACK_BACKUP,
	dailyOrRealtime: DailyRealtimeOption.DAILY,
};

export const BackupDailyAnnual: PurchaseableProduct = {
	slug: ProductConstants.PRODUCT_JETPACK_BACKUP_DAILY,
	attributes: {
		...commonAttributes,
		billingTerm: BillingTerm.ANNUAL,
	},
} as const;

export const BackupDailyMonthly: PurchaseableProduct = {
	slug: ProductConstants.PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	attributes: {
		...commonAttributes,
		billingTerm: BillingTerm.MONTHLY,
	},
} as const;

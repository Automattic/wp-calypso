/**
 * Internal dependencies
 */
import * as ProductConstants from 'calypso/lib/products-values/constants';
import { BillingTerm, DailyRealtimeOption, ItemType } from '../attributes';
import type { PurchaseableProduct } from '../types';

const commonAttributes = {
	itemType: ItemType.PRODUCT,
	family: ProductConstants.PRODUCT_JETPACK_BACKUP,
	dailyOrRealtime: DailyRealtimeOption.REALTIME,
};

export const BackupRealtimeAnnual: PurchaseableProduct = {
	slug: ProductConstants.PRODUCT_JETPACK_BACKUP_REALTIME,
	attributes: {
		...commonAttributes,
		billingTerm: BillingTerm.ANNUAL,
	},
} as const;

export const BackupRealtimeMonthly: PurchaseableProduct = {
	slug: ProductConstants.PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
	attributes: {
		...commonAttributes,
		billingTerm: BillingTerm.MONTHLY,
	},
} as const;

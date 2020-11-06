/**
 * Internal dependencies
 */
import * as PlanConstants from 'calypso/lib/plans/constants';
import { BillingTerm, DailyRealtimeOption, ItemType } from '../attributes';
import * as Products from '../products';
import type { PurchaseableBundle } from '../types';

const commonAttributes = {
	itemType: ItemType.BUNDLE,
	family: 'jetpack_security',
	dailyOrRealtime: DailyRealtimeOption.DAILY,
};

export const SecurityDailyAnnual: PurchaseableBundle = {
	slug: PlanConstants.PLAN_JETPACK_SECURITY_DAILY,
	attributes: {
		...commonAttributes,
		billingTerm: BillingTerm.ANNUAL,
	},
	includedProducts: [ Products.BackupDailyAnnual, Products.ScanAnnual ],
} as const;

export const SecurityDailyMonthly: PurchaseableBundle = {
	slug: PlanConstants.PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	attributes: {
		...commonAttributes,
		billingTerm: BillingTerm.MONTHLY,
	},
	includedProducts: [ Products.BackupDailyMonthly, Products.ScanMonthly ],
} as const;

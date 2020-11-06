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
	dailyOrRealtime: DailyRealtimeOption.REALTIME,
};

export const SecurityRealtimeAnnual: PurchaseableBundle = {
	slug: PlanConstants.PLAN_JETPACK_SECURITY_REALTIME,
	attributes: {
		...commonAttributes,
		billingTerm: BillingTerm.ANNUAL,
	},
	includedProducts: [ Products.BackupRealtimeAnnual, Products.ScanAnnual ],
} as const;

export const SecurityRealtimeMonthly: PurchaseableBundle = {
	slug: PlanConstants.PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
	attributes: {
		...commonAttributes,
		billingTerm: BillingTerm.MONTHLY,
	},
	includedProducts: [ Products.BackupRealtimeMonthly, Products.ScanMonthly ],
} as const;

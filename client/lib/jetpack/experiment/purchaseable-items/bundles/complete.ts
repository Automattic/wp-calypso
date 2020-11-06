/**
 * Internal dependencies
 */
import * as PlanConstants from 'calypso/lib/plans/constants';
import { ItemType, BillingTerm } from '../attributes';
import * as Products from '../products';
import type { PurchaseableBundle } from '../types';

const commonAttributes = {
	itemType: ItemType.BUNDLE,
	family: PlanConstants.PLAN_JETPACK_COMPLETE,
};

export const CompleteAnnual: PurchaseableBundle = {
	slug: PlanConstants.PLAN_JETPACK_COMPLETE,
	attributes: {
		...commonAttributes,
		billingTerm: BillingTerm.ANNUAL,
	},
	includedProducts: [
		Products.BackupRealtimeAnnual,
		Products.ScanAnnual,
		Products.CrmAnnual,
		Products.SearchAnnual,
	],
} as const;

export const CompleteMonthly: PurchaseableBundle = {
	slug: PlanConstants.PLAN_JETPACK_COMPLETE_MONTHLY,
	attributes: {
		...commonAttributes,
		billingTerm: BillingTerm.MONTHLY,
	},
	includedProducts: [
		Products.BackupRealtimeMonthly,
		Products.ScanMonthly,
		Products.CrmMonthly,
		Products.SearchMonthly,
	],
} as const;

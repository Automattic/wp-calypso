/**
 * Internal dependencies
 */
import * as PlanConstants from 'calypso/lib/plans/constants';
import { getPlan } from 'calypso/lib/plans';
import { BillingTerm, ItemType } from '../attributes';
import * as Products from '../products';
import type { PurchasableLegacyPlan } from '../types';

const commonAttributes = {
	itemType: ItemType.LEGACY_PLAN,
	family: PlanConstants.PLAN_JETPACK_BUSINESS,
};

export const ProfessionalAnnual: PurchasableLegacyPlan = {
	productId: getPlan( PlanConstants.PLAN_JETPACK_BUSINESS ).getProductId(),
	slug: PlanConstants.PLAN_JETPACK_BUSINESS,
	attributes: {
		...commonAttributes,
		billingTerm: BillingTerm.ANNUAL,
	},
	includedProducts: [ Products.BackupRealtimeAnnual, Products.ScanAnnual, Products.AntispamAnnual ],
} as const;

export const ProfessionalMonthly: PurchasableLegacyPlan = {
	productId: getPlan( PlanConstants.PLAN_JETPACK_BUSINESS_MONTHLY ).getProductId(),
	slug: PlanConstants.PLAN_JETPACK_BUSINESS_MONTHLY,
	attributes: {
		...commonAttributes,
		billingTerm: BillingTerm.MONTHLY,
	},
	includedProducts: [
		Products.BackupRealtimeMonthly,
		Products.ScanMonthly,
		Products.AntispamMonthly,
	],
} as const;

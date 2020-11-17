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
	family: PlanConstants.PLAN_JETPACK_PREMIUM,
};

export const PremiumAnnual: PurchasableLegacyPlan = {
	productId: getPlan( PlanConstants.PLAN_JETPACK_PREMIUM ).getProductId(),
	slug: PlanConstants.PLAN_JETPACK_PREMIUM,
	attributes: {
		...commonAttributes,
		billingTerm: BillingTerm.ANNUAL,
	},
	includedProducts: [ Products.BackupDailyAnnual, Products.ScanAnnual, Products.AntispamAnnual ],
} as const;

export const PremiumMonthly: PurchasableLegacyPlan = {
	productId: getPlan( PlanConstants.PLAN_JETPACK_PREMIUM_MONTHLY ).getProductId(),
	slug: PlanConstants.PLAN_JETPACK_PREMIUM_MONTHLY,
	attributes: {
		...commonAttributes,
		billingTerm: BillingTerm.MONTHLY,
	},
	includedProducts: [ Products.BackupDailyMonthly, Products.ScanMonthly, Products.AntispamMonthly ],
} as const;

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
	family: PlanConstants.PLAN_JETPACK_PERSONAL,
};

export const PersonalAnnual: PurchasableLegacyPlan = {
	productId: getPlan( PlanConstants.PLAN_JETPACK_PERSONAL ).getProductId(),
	slug: PlanConstants.PLAN_JETPACK_PERSONAL,
	attributes: {
		...commonAttributes,
		billingTerm: BillingTerm.ANNUAL,
	},
	includedProducts: [ Products.BackupDailyAnnual, Products.AntispamAnnual ],
} as const;

export const PersonalMonthly: PurchasableLegacyPlan = {
	productId: getPlan( PlanConstants.PLAN_JETPACK_PERSONAL_MONTHLY ).getProductId(),
	slug: PlanConstants.PLAN_JETPACK_PERSONAL_MONTHLY,
	attributes: {
		...commonAttributes,
		billingTerm: BillingTerm.MONTHLY,
	},
	includedProducts: [ Products.BackupDailyMonthly, Products.AntispamMonthly ],
} as const;

import { DENY_PURCHASE_SUPERSEDING_PLAN, PARTIALLY_REDUNDANT_PLAN_PURCHASE } from './policies';

export const productConcurrencyRules = [
	{
		existingProduct: 'jetpack-security-daily',
		attemptingToPurhase: 'jetpack-videopress',
		rule: DENY_PURCHASE_SUPERSEDING_PLAN,
	},
	{
		existingProduct: 'jetpack-security-realtime',
		attemptingToPurchase: 'jetpack-videopress',
		rule: DENY_PURCHASE_SUPERSEDING_PLAN,
	},
	{
		existingProduct: 'jetpack-complete',
		attemptingToPurchase: 'jetpack-videopress',
		rule: DENY_PURCHASE_SUPERSEDING_PLAN,
	},
	{
		existingProduct: 'jetpack-videopress',
		attemptingToPurchase: 'jetpack-complete',
		rule: PARTIALLY_REDUNDANT_PLAN_PURCHASE,
	},
];

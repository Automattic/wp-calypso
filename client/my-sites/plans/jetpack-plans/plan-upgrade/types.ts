/**
 * Internal dependencies
 */

/**
 * Type dependencies
 */
import type { JetpackPurchasableItem, JetpackLegacyPlanSlugs } from '@automattic/calypso-products';

export type PlanRecommendation = [
	JetpackLegacyPlanSlugs,
	Exclude< JetpackPurchasableItem, JetpackLegacyPlanSlugs >[]
];

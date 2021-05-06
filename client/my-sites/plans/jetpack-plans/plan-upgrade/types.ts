/**
 * Internal dependencies
 */

/**
 * Type dependencies
 */
import type { JetpackPurchasableItem, JetpackLegacyPlanSlug } from '@automattic/calypso-products';

export type PlanRecommendation = [
	JetpackLegacyPlanSlug,
	Exclude< JetpackPurchasableItem, JetpackLegacyPlanSlug >[]
];

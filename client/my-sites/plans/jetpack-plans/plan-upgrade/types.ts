import type {
	JetpackPurchasableItemSlug,
	JetpackLegacyPlanSlug,
} from '@automattic/calypso-products';

export type PlanRecommendation = [
	JetpackLegacyPlanSlug,
	Exclude< JetpackPurchasableItemSlug, JetpackLegacyPlanSlug >[],
];

import { isPremiumPlan } from '@automattic/calypso-products';

export function isPopularPlan( planSlug: string ): boolean {
	return isPremiumPlan( planSlug );
}

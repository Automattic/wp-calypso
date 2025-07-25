declare const process: { env: { NODE_ENV?: string } };

export interface SummerSpecialProps {
	isInSignup?: boolean;
	currentSitePlanSlug?: string;
	siteId?: number;
	activePromotions?: string[];
}

export function isSummerSpecialEnabled( props?: SummerSpecialProps ): boolean {
	const {
		isInSignup = false,
		currentSitePlanSlug = '',
		siteId = null,
		activePromotions = [],
	} = props || {};

	if ( process.env.NODE_ENV === 'test' ) {
		return false;
	}

	if ( isInSignup || currentSitePlanSlug === 'free_plan' ) {
		return true;
	}

	// For paid plans, check active promotions
	if ( currentSitePlanSlug && currentSitePlanSlug !== 'free_plan' ) {
		// For sites with existing plans, only check for site-specific promotion
		// Global promotion only applies to sites without plans
		const hasSiteSpecificPromotion = siteId
			? activePromotions.includes( `summer-special-2025-${ siteId }` )
			: false;

		return hasSiteSpecificPromotion;
	}

	return false;
}

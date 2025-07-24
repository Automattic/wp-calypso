declare const process: { env: { NODE_ENV?: string } };

export interface SummerSpecialProps {
	isInSignup?: boolean;
	currentSitePlanSlug?: string;
	siteId?: number;
	activePromotions?: string[];
}

export function isSummerSpecialEnabled( props?: SummerSpecialProps ): boolean {
	if ( process.env.NODE_ENV === 'test' ) {
		return false;
	}

	if ( props?.isInSignup ) {
		return true;
	}

	if ( props?.currentSitePlanSlug === 'free_plan' ) {
		return true;
	}

	// For paid plans, check active promotions
	if ( props?.currentSitePlanSlug && props?.currentSitePlanSlug !== 'free_plan' ) {
		const activePromotions = props?.activePromotions || [];

		// For sites with existing plans, only check for site-specific promotion
		// Global promotion only applies to sites without plans
		const hasSiteSpecificPromotion = props.siteId
			? activePromotions.includes( `summer-special-2025-${ props.siteId }` )
			: false;

		return hasSiteSpecificPromotion;
	}

	return false;
}

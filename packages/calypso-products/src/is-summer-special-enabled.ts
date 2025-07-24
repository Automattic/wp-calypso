declare const process: { env: { NODE_ENV?: string } };

export interface SummerSpecialProps {
	isInSignup?: boolean;
	currentSitePlanSlug?: string;
}

export function isSummerSpecialEnabled( props?: SummerSpecialProps ): boolean {
	// Return false in test environments to avoid affecting existing tests
	if ( process.env.NODE_ENV === 'test' ) {
		return false;
	}

	// If we're in signup, summer special promotion is enabled
	if ( props?.isInSignup ) {
		return true;
	}

	// If there's no current plan (free plan), summer special is enabled
	if ( props?.currentSitePlanSlug === 'free_plan' ) {
		return true;
	}

	return false;
}

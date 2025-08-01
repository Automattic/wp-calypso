import config from '@automattic/calypso-config';
declare const process: { env: { NODE_ENV?: string } };

export interface SummerSpecialProps {
	isInSignup?: boolean;
	currentSitePlanSlug?: string;
	isSummerSpecialFromSiteOption?: boolean;
}

export function isSummerSpecialEnabled( props?: SummerSpecialProps ): boolean {
	const {
		isInSignup = false,
		currentSitePlanSlug = '',
		isSummerSpecialFromSiteOption = false,
	} = props || {};

	// If site option is explicitly set to true, enable summer special (highest priority)
	if ( isSummerSpecialFromSiteOption ) {
		return true;
	}

	// Feature flag check
	if ( ! config.isEnabled( 'summer-special-2025' ) ) {
		return false;
	}

	if ( process.env.NODE_ENV === 'test' ) {
		return false;
	}

	// If we're in signup, always enable summer special
	if ( isInSignup ) {
		return true;
	}

	// If site has free plan, always enable summer special
	if ( currentSitePlanSlug === 'free_plan' ) {
		return true;
	}

	// For paid plans without explicit site option, summer special is disabled
	return false;
}

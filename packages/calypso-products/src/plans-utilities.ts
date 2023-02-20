import { isEnabled } from '@automattic/calypso-config';
import { getLocaleSlug } from 'i18n-calypso';
import {
	JETPACK_REDIRECT_CHECKOUT_TO_WPADMIN,
	BEST_VALUE_PLANS,
	TERM_MONTHLY,
	PLAN_MONTHLY_PERIOD,
	TERM_ANNUALLY,
	PLAN_ANNUAL_PERIOD,
	TERM_BIENNIALLY,
	PLAN_BIENNIAL_PERIOD,
	TERM_TRIENNIALLY,
	PLAN_TRIENNIAL_PERIOD,
} from './constants';

declare global {
	interface Window {
		location: Location;
		is2023PricingGridShownMemo: Set< string >;
	}
}

export function isBestValue( plan: string ): boolean {
	return ( BEST_VALUE_PLANS as ReadonlyArray< string > ).includes( plan );
}

/**
 * Return estimated duration of given PLAN_TERM in days
 *
 * @param {string} term TERM_ constant
 * @returns {number} Term duration
 */
export function getTermDuration( term: string ): number | undefined {
	switch ( term ) {
		case TERM_MONTHLY:
			return PLAN_MONTHLY_PERIOD;

		case TERM_ANNUALLY:
			return PLAN_ANNUAL_PERIOD;

		case TERM_BIENNIALLY:
			return PLAN_BIENNIAL_PERIOD;

		case TERM_TRIENNIALLY:
			return PLAN_TRIENNIAL_PERIOD;
	}
}

export const redirectCheckoutToWpAdmin = (): boolean => !! JETPACK_REDIRECT_CHECKOUT_TO_WPADMIN;

/**
 *
 * This section contains logic to determine if the 2023 pricing grid will be shown.
 * This can be cleaned up once 2023 pricing grid is shipped everywhere
 *
 */
const isPricingGrid2023FeatureFlagEnabled = isEnabled( 'onboarding/2023-pricing-grid' );
const supportedLocales = new Set( [ 'en', 'en-gb', 'es' ] );

/**
 * Memoizes the visibility of the 2023 pricing grid.
 */
const visibilityMemo = {
	is2023PricingGridActivePageStates: new Map< string, boolean >(),
	memoKey: ( path: string, locale: string ) => `${ path }_${ locale }`,
	store: ( currentRoutePath: string, currentLocale: string, isShown: boolean ) => {
		visibilityMemo.is2023PricingGridActivePageStates.set(
			visibilityMemo.memoKey( currentLocale, currentRoutePath ),
			isShown
		);
	},
	is2023PricingGridActivePageMemoized: ( currentRoutePath: string, currentLocale: string ) =>
		visibilityMemo.is2023PricingGridActivePageStates.has(
			visibilityMemo.memoKey( currentLocale, currentRoutePath )
		),
	get: ( currentRoutePath: string, currentLocale: string ): boolean =>
		visibilityMemo.get( currentRoutePath, currentLocale ),
};

const isLocaleSupported = ( locale: string ): boolean => {
	return supportedLocales.has( locale ?? '' );
};

/**
 * Returns if the 2023 Pricing grid feature has been enabled.
 * Currently this depends on the feature flag and on the locale the user is on
 */
export const is2023PricingGridEnabled = (): boolean => {
	const currentLocale = getLocaleSlug() ?? '';
	return isPricingGrid2023FeatureFlagEnabled && isLocaleSupported( currentLocale );
};

/**
 * This function specifically checks if a given route path will display the pricing grid or not.
 * However the pricing grid needs to be enabled in the first place for this function to return true.
 *
 * @param browserWindow Current browser window
 * @returns true if the pricing grid maybe shown in a given page
 */
export const is2023PricingGridActivePage = (
	browserWindow: Window & typeof globalThis
): boolean => {
	const currentRoutePath = browserWindow.location.pathname ?? '';
	const currentLocale = getLocaleSlug() ?? '';

	/**
	 * Escape early if the feature flag is not even enabled
	 */
	if ( ! isPricingGrid2023FeatureFlagEnabled ) {
		return false;
	}

	/**
	 * Check if value is memoized and return
	 */
	if (
		currentLocale &&
		visibilityMemo.is2023PricingGridActivePageMemoized( currentLocale, currentRoutePath )
	) {
		return visibilityMemo.get( currentLocale, currentRoutePath );
	}

	// Is this the internal plans page /plans/<site-slug> ?
	if ( currentRoutePath.startsWith( '/plans' ) ) {
		visibilityMemo.store( currentRoutePath, currentLocale, true );
		return true;
	}

	// Is this the onboarding flow?
	if ( currentRoutePath.startsWith( '/start/plans' ) ) {
		visibilityMemo.store( currentRoutePath, currentLocale, true );
		return true;
	}

	visibilityMemo.store( currentRoutePath, currentLocale, false );
	return false;
};

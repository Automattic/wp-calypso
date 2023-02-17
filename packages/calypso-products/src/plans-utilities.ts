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
 * Returns if the 2023 Pricing grid optimized design should be visible or not
 *
 */
export const is2023PricingGridEnabled = (): boolean => {
	const isFeatureFlagEnabled = (): boolean => isEnabled( 'onboarding/2023-pricing-grid' );

	const isLocaleSupported = (): boolean => {
		const supportedLocales = [ 'en', 'en-gb', 'es' ];
		return supportedLocales.includes( getLocaleSlug() ?? '' );
	};

	const isActivePage = (): boolean => {
		let currentRoutePath = '';
		if ( typeof window === 'object' && window.location ) {
			currentRoutePath = window.location.pathname;
		}

		const [ firstPathPart, secondPathPart ] = ( currentRoutePath || '' )
			.split( '/' )
			.filter( ( i ) => i );

		// Is this the internal plans page /plans/<site-slug> ?
		if ( firstPathPart === 'plans' ) {
			return true;
		}

		// Is this the onboarding flow /start/plans?
		if ( firstPathPart === 'start' && secondPathPart === 'plans' ) {
			return true;
		}

		return false;
	};

	return isFeatureFlagEnabled() && isLocaleSupported() && isActivePage();
};

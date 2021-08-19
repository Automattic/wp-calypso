import {
	JETPACK_PLANS_BY_TERM,
	JETPACK_PRODUCTS_BY_TERM,
	TERM_ANNUALLY,
	TERM_MONTHLY,
} from '@automattic/calypso-products';
import { Duration } from './types';

function getSlugInTerm( yearlySlug: string | null, slugTerm: Duration ) {
	const mainTerm = slugTerm === TERM_MONTHLY ? 'monthly' : 'yearly';
	const oppositeTerm = mainTerm === 'monthly' ? 'yearly' : 'monthly';

	const matchingProduct = JETPACK_PRODUCTS_BY_TERM.find(
		( product ) => product[ oppositeTerm ] === yearlySlug
	);
	if ( matchingProduct ) {
		return matchingProduct[ mainTerm ];
	}

	const matchingPlan = JETPACK_PLANS_BY_TERM.find(
		( plan ) => plan[ oppositeTerm ] === yearlySlug
	);
	if ( matchingPlan ) {
		return matchingPlan[ mainTerm ];
	}

	return null;
}

/**
 * Get the monthly version of a product slug.
 *
 * @param {string} yearlySlug a yearly term product slug
 * @returns {string} a monthly term product slug
 */
export function getMonthlySlugFromYearly( yearlySlug: string | null ): string | null {
	return getSlugInTerm( yearlySlug, TERM_MONTHLY );
}

/**
 * Get the yearly version of a product slug.
 *
 * @param {string} monthlySlug a monthly term product slug
 * @returns {string} a yearly term product slug
 */
export function getYearlySlugFromMonthly( monthlySlug: string | null ): string | null {
	return getSlugInTerm( monthlySlug, TERM_ANNUALLY );
}

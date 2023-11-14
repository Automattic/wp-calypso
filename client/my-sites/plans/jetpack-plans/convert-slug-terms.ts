import {
	JETPACK_PLANS_BY_TERM,
	JETPACK_PRODUCTS_BY_TERM,
	TERM_ANNUALLY,
	TERM_MONTHLY,
} from '@automattic/calypso-products';
import { Duration } from './types';

export function getSlugInTerm( slug: string | null, term: Duration ): string | null {
	if ( slug === null ) {
		return null;
	}

	const toTermKey = term === TERM_MONTHLY ? 'monthly' : 'yearly';

	const matchingProducts = JETPACK_PRODUCTS_BY_TERM.find( ( p ) =>
		( Object.values( p ) as string[] ).includes( slug )
	);
	if ( matchingProducts ) {
		return matchingProducts[ toTermKey ];
	}

	const matchingPlans = JETPACK_PLANS_BY_TERM.find( ( p ) =>
		( Object.values( p ) as string[] ).includes( slug )
	);
	if ( matchingPlans ) {
		return matchingPlans[ toTermKey ];
	}

	return null;
}

/**
 * Get the yearly version of a product slug, or return null if one doesn't exist.
 * @param {string} monthlySlug a monthly term product slug
 * @returns {string} a yearly term product slug
 */
export function getYearlySlugFromMonthly( monthlySlug: string | null ): string | null {
	return getSlugInTerm( monthlySlug, TERM_ANNUALLY );
}

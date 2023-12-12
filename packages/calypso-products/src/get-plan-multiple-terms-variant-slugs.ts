import { TERMS_LIST } from './constants/terms';
import { PLANS_LIST } from './plans-list';
import type { PlanSlug } from './types';

/**
 * Return all the variants requested related to a given plan
 * @param {PlanSlug} slug Slug/name of the plan to get the variants from
 * @param {typeof TERMS_LIST[ number ][]} planTerms The terms to find a variant for
 * @returns {PlanSlug[]} Slugs of the term-variant plan
 */
export function getPlanMultipleTermsVariantSlugs(
	slug: PlanSlug,
	planTerms: ( typeof TERMS_LIST )[ number ][]
): PlanSlug[] {
	const plan = PLANS_LIST[ slug ];

	if ( plan ) {
		return Object.values( PLANS_LIST )
			.filter( ( { type } ) => type === plan.type )
			.filter( ( { term } ) => planTerms.includes( term ) )
			.map( ( { getStoreSlug } ) => getStoreSlug() );
	}

	return [];
}

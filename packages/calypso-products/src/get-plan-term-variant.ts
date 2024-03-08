import { TERMS_LIST } from './constants/terms';
import { PLANS_LIST } from './plans-list';
import type { PlanSlug } from './types';

/**
 * Return a (monthly/yealry/2yearly/etc) variant of a plan
 * @param {PlanSlug} slug Slug/name of the plan to get the yearly variant from
 * @param {typeof TERMS_LIST[ number ]} planTerm The term to find a variant for
 * @returns {PlanSlug} Slug of the term-variant plan
 */
export function getPlanSlugForTermVariant(
	slug: PlanSlug,
	planTerm: ( typeof TERMS_LIST )[ number ]
): PlanSlug | undefined {
	const plan = PLANS_LIST[ slug ];

	if ( plan ) {
		return Object.values( PLANS_LIST )
			.filter( ( { type } ) => type === plan.type )
			.find( ( { term } ) => term === planTerm )
			?.getStoreSlug();
	}

	return undefined;
}

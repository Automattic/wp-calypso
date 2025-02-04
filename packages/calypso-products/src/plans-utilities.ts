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
	TERM_QUADRENNIALLY,
	TERM_QUINQUENNIALLY,
	TERM_SEXENNIALLY,
	PLAN_DECENNIAL_PERIOD,
	PLAN_NOVENNIAL_PERIOD,
	PLAN_OCTENNIAL_PERIOD,
	PLAN_QUADRENNIAL_PERIOD,
	PLAN_QUINQUENNIAL_PERIOD,
	PLAN_SEPTENNIAL_PERIOD,
	PLAN_SEXENNIAL_PERIOD,
	TERM_DECENNIALLY,
	TERM_NOVENNIALLY,
	TERM_OCTENNIALLY,
	TERM_SEPTENNIALLY,
	PLAN_CENTENNIAL_PERIOD,
	TERM_CENTENNIALLY,
} from './constants';
import { BillingTerm } from './types';

export { getPlanSlugForTermVariant } from './get-plan-term-variant';
export { getPlanMultipleTermsVariantSlugs } from './get-plan-multiple-terms-variant-slugs';

export function isBestValue( plan: string ): boolean {
	return ( BEST_VALUE_PLANS as ReadonlyArray< string > ).includes( plan );
}

/**
 * Return estimated duration of given PLAN_TERM in days
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
		case TERM_QUADRENNIALLY:
			return PLAN_QUADRENNIAL_PERIOD;
		case TERM_QUINQUENNIALLY:
			return PLAN_QUINQUENNIAL_PERIOD;
		case TERM_SEXENNIALLY:
			return PLAN_SEXENNIAL_PERIOD;
		case TERM_SEPTENNIALLY:
			return PLAN_SEPTENNIAL_PERIOD;
		case TERM_OCTENNIALLY:
			return PLAN_OCTENNIAL_PERIOD;
		case TERM_NOVENNIALLY:
			return PLAN_NOVENNIAL_PERIOD;
		case TERM_DECENNIALLY:
			return PLAN_DECENNIAL_PERIOD;
		case TERM_CENTENNIALLY:
			return PLAN_CENTENNIAL_PERIOD;
	}
}

/**
 * Gvien duration in days returnn the PLAN_TERM
 * @param {number} days Term duration in days
 * @returns {string} TERM_ constant
 */
export function getTermFromDuration( days: number ): BillingTerm[ 'term' ] | undefined {
	switch ( days ) {
		case PLAN_MONTHLY_PERIOD:
			return TERM_MONTHLY;
		case PLAN_ANNUAL_PERIOD:
			return TERM_ANNUALLY;
		case PLAN_BIENNIAL_PERIOD:
			return TERM_BIENNIALLY;
		case PLAN_TRIENNIAL_PERIOD:
			return TERM_TRIENNIALLY;
		case PLAN_QUADRENNIAL_PERIOD:
			return TERM_QUADRENNIALLY;
		case PLAN_QUINQUENNIAL_PERIOD:
			return TERM_QUINQUENNIALLY;
		case PLAN_SEXENNIAL_PERIOD:
			return TERM_SEXENNIALLY;
		case PLAN_SEPTENNIAL_PERIOD:
			return TERM_SEPTENNIALLY;
		case PLAN_OCTENNIAL_PERIOD:
			return TERM_OCTENNIALLY;
		case PLAN_NOVENNIAL_PERIOD:
			return TERM_NOVENNIALLY;
		case PLAN_DECENNIAL_PERIOD:
			return TERM_DECENNIALLY;
		case PLAN_CENTENNIAL_PERIOD:
			return TERM_CENTENNIALLY;
	}
}

export const redirectCheckoutToWpAdmin = (): boolean => !! JETPACK_REDIRECT_CHECKOUT_TO_WPADMIN;

/**
 * Given an array of plan Features and an array of Product slugs, it returns which products are
 * included in the plan Features.
 * @param {ReadonlyArray< string >} planFeatures Array of plan Feature slugs
 * @param {ReadonlyArray< string >} products Array of Product slugs
 * @returns {string[]} Array of Product slugs
 */
export const planFeaturesIncludesProducts = (
	planFeatures: ReadonlyArray< string >,
	products: ReadonlyArray< string >
) => {
	return products.some( ( product ) => planFeatures.includes( product ) );
};

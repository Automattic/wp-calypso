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

export { getPlanSlugForTermVariant } from './get-plan-term-variant';

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

export const redirectCheckoutToWpAdmin = (): boolean => !! JETPACK_REDIRECT_CHECKOUT_TO_WPADMIN;

/**
 * Given an array of plan Features and an array of Product slugs, it returns which products are
 * included in the plan Features.
 *
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

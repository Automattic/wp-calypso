import {
	JETPACK_REDIRECT_CHECKOUT_TO_WPADMIN,
	BEST_VALUE_PLANS,
	TERM_MONTHLY,
	PLAN_MONTHLY_PERIOD,
	TERM_ANNUALLY,
	PLAN_ANNUAL_PERIOD,
	TERM_BIENNIALLY,
	PLAN_BIENNIAL_PERIOD,
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
	}
}

export const redirectCheckoutToWpAdmin = (): boolean => !! JETPACK_REDIRECT_CHECKOUT_TO_WPADMIN;

/**
 * Internal dependencies
 */
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

export function isBestValue( plan ) {
	return BEST_VALUE_PLANS.includes( plan );
}

/**
 * Return estimated duration of given PLAN_TERM in days
 *
 * @param {string} term TERM_ constant
 * @returns {number} Term duration
 */
export function getTermDuration( term ) {
	switch ( term ) {
		case TERM_MONTHLY:
			return PLAN_MONTHLY_PERIOD;

		case TERM_ANNUALLY:
			return PLAN_ANNUAL_PERIOD;

		case TERM_BIENNIALLY:
			return PLAN_BIENNIAL_PERIOD;
	}

	if ( process.env.NODE_ENV === 'development' ) {
		console.error( `Unexpected argument ${ term }, expected one of TERM_ constants` ); // eslint-disable-line no-console
	}
}

export const redirectCheckoutToWpAdmin = () => !! JETPACK_REDIRECT_CHECKOUT_TO_WPADMIN;

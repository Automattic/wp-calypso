/**
 * External dependencies
 */

export const findCurrencyFromPlans = ( plans ) => {
	return plans[ 0 ]?.currency_code ?? 'USD';
};

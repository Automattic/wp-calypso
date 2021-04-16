/**
 * External dependencies
 */

export const findCurrencyFromPlans = ( plans ) => {
	const firstPlanWithCurrency = plans.find( ( plan ) => plan.currency_code );
	return firstPlanWithCurrency?.currency_code ?? 'USD';
};

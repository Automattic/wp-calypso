/**
 * External dependencies
 */
import { createSelector } from '@automattic/state-utils';

/**
 * Internal dependencies
 */
import { AppState } from 'calypso/types';
import { getProductCost } from 'calypso/state/products-list/selectors/get-product-cost';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getMonthlySlugFromYearly } from '../convert-slug-terms';

const getAnnualDiscount = ( state: AppState, annualProductSlug: string ) => {
	const yearly = getProductCost( state, annualProductSlug );

	const monthlyProductSlug = getMonthlySlugFromYearly( annualProductSlug );
	const monthly = monthlyProductSlug && getProductCost( state, monthlyProductSlug );

	// Protect against null values and division by zero
	if ( ! yearly || ! monthly ) {
		return null;
	}

	const monthlyCostPerYear = monthly * 12;
	const yearlySavings = monthlyCostPerYear - yearly;

	return yearlySavings / monthlyCostPerYear;
};

/**
 * A selector that calculates the highest possible discount for annual billing purchases over monthly.
 *
 * @param {AppState} state The application state.
 * @param {string[]|null} annualProductSlugs A list of annually-billed product slugs to check for discounts
 * @returns {string|null} A formatted percentage representing the highest possible discount rounded to the nearest whole number, if one exists; otherwise, null.
 */
const getHighestAnnualDiscount = createSelector(
	( state: AppState, annualProductSlugs: string[] | null ): string | null => {
		// Can't get discount info if we don't have any product slugs
		if ( ! annualProductSlugs?.length ) {
			return null;
		}

		// Get all the annual discounts as decimal percentages (between 0 and 1),
		// removing any null results and sorting in descending order;
		// then get the first element, or 0 if the array is empty.
		const highestDiscount: number =
			annualProductSlugs
				.map( ( yearlySlug ) => getAnnualDiscount( state, yearlySlug ) )
				.filter( ( discount ): discount is number => Number.isFinite( discount ) )
				.sort( ( a, b ) => b - a )?.[ 0 ] ?? 0;

		const rounded = Math.round( 100 * highestDiscount );
		if ( rounded <= 0 ) {
			return null;
		}

		return `${ rounded }%`;
	},
	[
		// HIDDEN DEPENDENCY: Discount rates differ based on the current user's currency code!
		getCurrentUserCurrencyCode,
		( state: AppState, annualProductSlugs: string[] | null ) => annualProductSlugs,
	],
	( state: AppState, annualProductSlugs: string[] | null ) => {
		const currencyCode = getCurrentUserCurrencyCode( state );
		return `${ currencyCode }-${ annualProductSlugs?.join?.() || '' }`;
	}
);

export default getHighestAnnualDiscount;

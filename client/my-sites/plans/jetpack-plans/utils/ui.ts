/**
 * External dependencies
 */
import config from '@automattic/calypso-config';
import {
	JETPACK_PLANS_BY_TERM,
	JETPACK_PRODUCTS_BY_TERM,
	TERM_MONTHLY,
} from '@automattic/calypso-products';
import { createSelector } from '@automattic/state-utils';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import page from 'page';
import { useMemo } from 'react';

/**
 * Internal dependencies
 */
import { addQueryArgs } from 'calypso/lib/route';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { getCurrentUserCurrencyCode } from 'calypso/state/current-user/selectors';
import { getProductCost } from 'calypso/state/products-list/selectors/get-product-cost';

/**
 * Type dependencies
 */
import type { AppState } from 'calypso/types';
import type { Duration, QueryArgs } from '../types';

export const useDurationText = ( duration: Duration | undefined ): TranslateResult | null => {
	const translate = useTranslate();

	return useMemo( () => {
		if ( ! duration ) {
			return null;
		}

		if ( duration === TERM_MONTHLY ) {
			return translate( '/month, paid monthly' );
		}

		return translate( '/month, paid yearly' );
	}, [ duration, translate ] );
};

/**
 * Adds products to the cart and redirects to the checkout page.
 *
 * @param {string} siteSlug Selected site
 * @param {string | string[]} products Slugs of the products to add to the cart
 * @param {QueryArgs} urlQueryArgs Additional query params appended to url (ie. for affiliate tracking, or whatever)
 */
export function checkout(
	siteSlug: string,
	products: string | string[],
	urlQueryArgs: QueryArgs = {}
): void {
	const productsArray = Array.isArray( products ) ? products : [ products ];
	const productsString = productsArray.join( ',' );

	// If there is not siteSlug, we need to redirect the user to the site selection
	// step of the flow. Since purchases of multiple products are allowed, we need
	// to pass all products separated by comma in the URL.
	const path = siteSlug
		? `/checkout/${ siteSlug }/${ productsString }`
		: `/jetpack/connect/${ productsString }`;

	if ( isJetpackCloud() && ! config.isEnabled( 'jetpack-cloud/connect' ) ) {
		window.location.href = addQueryArgs( urlQueryArgs, `https://wordpress.com${ path }` );
	} else {
		page( addQueryArgs( urlQueryArgs, path ) );
	}
}

/**
 * A selector that calculates the highest possible discount for annual billing purchases over monthly.
 *
 * @param {AppState} state The application state.
 * @param {string[]|null} annualProductSlugs A list of annually-billed product slugs to check for discounts
 * @returns {string|null} A formatted percentage representing the highest possible discount rounded to the nearest whole number, if one exists; otherwise, null.
 */
export const getHighestAnnualDiscount = createSelector(
	( state: AppState, annualProductSlugs: string[] | null ): string | null => {
		// Can't get discount info if we don't have any product slugs
		if ( ! annualProductSlugs?.length ) {
			return null;
		}

		// Get all the annual discounts as decimal percentages (between 0 and 1), removing any null results
		const discounts: number[] = annualProductSlugs
			.map( ( yearlySlug ) => {
				const yearly = getProductCost( state, yearlySlug );

				const monthlySlug = getMonthlySlugFromYearly( yearlySlug );
				const monthly = monthlySlug && getProductCost( state, monthlySlug );

				// Protect against null values and division by zero
				if ( ! yearly || ! monthly ) {
					return null;
				}

				const monthlyCostPerYear = monthly * 12;
				const yearlySavings = monthlyCostPerYear - yearly;

				return yearlySavings / monthlyCostPerYear;
			} )
			.filter( ( discount ): discount is number => Number.isFinite( discount ) );

		const highestDiscount = discounts.sort( ( a, b ) => ( a > b ? -1 : 1 ) )[ 0 ];
		const rounded = Math.round( 100 * highestDiscount );

		return rounded > 0 ? `${ rounded }%` : null;
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

// Takes any annual Jetpack product or plan slug and returns its corresponding monthly equivalent
function getMonthlySlugFromYearly( yearlySlug: string | null ) {
	const matchingProduct = JETPACK_PRODUCTS_BY_TERM.find(
		( product ) => product.yearly === yearlySlug
	);
	if ( matchingProduct ) {
		return matchingProduct.monthly;
	}

	const matchingPlan = JETPACK_PLANS_BY_TERM.find( ( plan ) => plan.yearly === yearlySlug );
	if ( matchingPlan ) {
		return matchingPlan.monthly;
	}

	return null;
}

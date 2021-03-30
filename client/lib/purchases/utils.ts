/**
 * Internal dependencies
 */

/**
 * Type dependencies
 */
import { useTranslate } from 'i18n-calypso';
import type { Purchase } from './types';

/**
 * Finds a purchase by the slug of its associated product.
 *
 * @param {Purchase[]} purchases List of purchases to search in
 * @param {string} slug Product slug
 * @returns {Purchase} Found purchase, if any
 */
export function getPurchaseByProductSlug(
	purchases: Purchase[],
	slug: string
): Purchase | undefined {
	return purchases.find( ( purchase ) => purchase.productSlug === slug );
}

export function getIntroductoryOfferIntervalDisplay(
	translate: ReturnType< typeof useTranslate >,
	intervalUnit: string,
	intervalCount: number,
	isFreeTrial: boolean
): string {
	let text = String( translate( 'Discount for first period' ) );
	if ( isFreeTrial ) {
		if ( intervalUnit === 'month' ) {
			if ( intervalCount === 1 ) {
				text = String( translate( 'First month free' ) );
			} else {
				text = String(
					translate( 'First %(numberOfMonths)d months free', {
						args: {
							numberOfMonths: intervalCount,
						},
					} )
				);
			}
		}
		if ( intervalUnit === 'year' ) {
			if ( intervalCount === 1 ) {
				text = String( translate( 'First year free' ) );
			} else {
				text = String(
					translate( 'First %(numberOfYears)d years free', {
						args: {
							numberOfYears: intervalCount,
						},
					} )
				);
			}
		}
	} else {
		if ( intervalUnit === 'month' ) {
			if ( intervalCount === 1 ) {
				text = String( translate( 'Discount for first month' ) );
			} else {
				text = String(
					translate( 'Discount for first %(numberOfMonths)d months', {
						args: {
							numberOfMonths: intervalCount,
						},
					} )
				);
			}
		}
		if ( intervalUnit === 'year' ) {
			if ( intervalCount === 1 ) {
				text = String( translate( 'Discount for first year' ) );
			} else {
				text = String(
					translate( 'Discount for first %(numberOfYears)d years', {
						args: {
							numberOfYears: intervalCount,
						},
					} )
				);
			}
		}
	}
	return text;
}

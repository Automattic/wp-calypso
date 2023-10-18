import { isDomainRegistration } from '@automattic/calypso-products';
import { formatCurrency } from '@automattic/format-currency';
import i18n from 'i18n-calypso';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

export function getIntroductoryOfferIntervalDisplay(
	translate: typeof i18n.translate,
	intervalUnit: string,
	intervalCount: number,
	isFreeTrial: boolean,
	context: string,
	remainingRenewalsUsingOffer = 0
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
	if ( remainingRenewalsUsingOffer > 0 ) {
		text += ' - ';
		if ( context === 'checkout' ) {
			if ( remainingRenewalsUsingOffer === 1 ) {
				text += String(
					translate( 'The first renewal is also discounted.', {
						args: {
							remainingRenewals: remainingRenewalsUsingOffer,
						},
					} )
				);
			} else {
				text += String(
					translate(
						'The first %(remainingRenewals)d renewal is also discounted.',
						'The first %(remainingRenewals)d renewals are also discounted.',
						{
							count: remainingRenewalsUsingOffer,
							args: {
								remainingRenewals: remainingRenewalsUsingOffer,
							},
						}
					)
				);
			}
		} else {
			text += String(
				translate(
					'%(remainingRenewals)d discounted renewal remaining.',
					'%(remainingRenewals)d discounted renewals remaining.',
					{
						count: remainingRenewalsUsingOffer,
						args: {
							remainingRenewals: remainingRenewalsUsingOffer,
						},
					}
				)
			);
		}
	}
	return text;
}

export function getItemIntroductoryOfferDisplay(
	translate: typeof i18n.translate,
	product: ResponseCartProduct
) {
	if ( product.introductory_offer_terms?.reason ) {
		const text = translate( 'Order not eligible for introductory discount' );
		return { enabled: false, text };
	}

	if ( ! product.introductory_offer_terms?.enabled ) {
		return null;
	}

	const isFreeTrial = product.item_subtotal_integer === 0;
	let text = getIntroductoryOfferIntervalDisplay(
		translate,
		product.introductory_offer_terms.interval_unit,
		product.introductory_offer_terms.interval_count,
		isFreeTrial,
		'checkout',
		product.introductory_offer_terms.transition_after_renewal_count
	);

	if (
		isDomainRegistration( product ) &&
		product.item_original_cost_integer < product.item_subtotal_integer
	) {
		text = String(
			translate( 'Renews for %(renewalPrice)s/year', {
				args: {
					renewalPrice: formatCurrency( product.item_original_cost_integer, product.currency, {
						isSmallestUnit: true,
						stripZeros: true,
					} ),
				},
			} )
		);
	}

	return { enabled: true, text };
}

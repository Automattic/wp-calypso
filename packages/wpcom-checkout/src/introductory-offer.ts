import { isDomainRegistration } from '@automattic/calypso-products';
import i18n, { formatCurrency } from 'i18n-calypso';
import { doesIntroductoryOfferHavePriceIncrease } from './transformations';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

export function getIntroductoryOfferIntervalDisplay( {
	translate,
	intervalUnit,
	intervalCount,
	isFreeTrial,
	isPriceIncrease,
	context,
	remainingRenewalsUsingOffer = 0,
}: {
	translate: typeof i18n.translate;
	intervalUnit: string;
	intervalCount: number;
	isFreeTrial: boolean;
	isPriceIncrease: boolean;
	context: string;
	remainingRenewalsUsingOffer: number;
} ): string {
	let text = isPriceIncrease
		? translate( 'First billing period', { textOnly: true } )
		: String( translate( 'Discount for first period' ) );
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
				text = isPriceIncrease
					? translate( 'Price for first month', { textOnly: true } )
					: String( translate( 'Discount for first month' ) );
			} else {
				text = isPriceIncrease
					? translate( 'Price for first %(numberOfMonths)d months', {
							textOnly: true,
							args: {
								numberOfMonths: intervalCount,
							},
					  } )
					: String(
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
				text = isPriceIncrease
					? translate( 'Price for first year', { textOnly: true } )
					: String( translate( 'Discount for first year' ) );
			} else {
				text = isPriceIncrease
					? translate( 'Price for first %(numberOfYears)d years', {
							textOnly: true,
							args: { numberOfYears: intervalCount },
					  } )
					: String(
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
				text += isPriceIncrease
					? translate( 'Applies for one renewal', { textOnly: true } )
					: translate( 'The first renewal is also discounted.', { textOnly: true } );
			} else {
				text += isPriceIncrease
					? translate( 'Applies for %(remainingRenewals)d renewals', {
							textOnly: true,
							args: {
								remainingRenewals: remainingRenewalsUsingOffer,
							},
					  } )
					: String(
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
			text += isPriceIncrease
				? translate(
						'Applies for %(remainingRenewals)d renewal',
						'Applies for %(remainingRenewals)d renewals',
						{
							textOnly: true,
							count: remainingRenewalsUsingOffer,
							args: {
								remainingRenewals: remainingRenewalsUsingOffer,
							},
						}
				  )
				: String(
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

export function getPremiumDomainIntroductoryOfferDisplay(
	translate: typeof i18n.translate,
	product: ResponseCartProduct
): string | null {
	if (
		! isDomainRegistration( product ) ||
		! product.extra.premium ||
		! product.introductory_offer_terms?.enabled
	) {
		return null;
	}

	const { interval_unit: intervalUnit, interval_count: intervalCount } =
		product.introductory_offer_terms;

	// Monthly introductory offers are covered, but they shouldn't normally happen.
	if ( intervalUnit === 'month' ) {
		return null;
	}

	if ( intervalUnit === 'year' ) {
		const renewalPrice = formatCurrency( product.item_original_cost_integer, product.currency, {
			isSmallestUnit: true,
			stripZeros: true,
		} );
		if ( intervalCount === 1 ) {
			return String(
				translate( 'Renews for %(renewalPrice)s/year', {
					args: {
						renewalPrice,
					},
				} )
			);
		} else if ( intervalCount >= 1 ) {
			return String(
				translate( 'Renews for %(renewalPrice)s/year after %(numberOfYears)d years', {
					args: {
						renewalPrice,
						numberOfYears: intervalCount,
					},
				} )
			);
		}
	}
	return null;
}

export function getItemIntroductoryOfferDisplay(
	translate: typeof i18n.translate,
	product: ResponseCartProduct
) {
	// Introductory offer manual renewals often have prorated prices that are
	// difficult to display as a simple discount so we keep their display
	// simple.
	if ( product.is_renewal ) {
		return null;
	}

	if ( product.introductory_offer_terms?.reason ) {
		const text = translate( 'Order not eligible for introductory discount' );
		return { enabled: false, text };
	}

	if ( ! product.introductory_offer_terms?.enabled ) {
		return null;
	}

	const premiumDomainText = getPremiumDomainIntroductoryOfferDisplay( translate, product );

	if ( premiumDomainText ) {
		return { enabled: true, text: premiumDomainText };
	}

	const isFreeTrial = product.item_subtotal_integer === 0;
	const text = getIntroductoryOfferIntervalDisplay( {
		translate,
		intervalUnit: product.introductory_offer_terms.interval_unit,
		intervalCount: product.introductory_offer_terms.interval_count,
		isFreeTrial,
		isPriceIncrease: doesIntroductoryOfferHavePriceIncrease( product ),
		context: 'checkout',
		remainingRenewalsUsingOffer: product.introductory_offer_terms.transition_after_renewal_count,
	} );

	return { enabled: true, text };
}

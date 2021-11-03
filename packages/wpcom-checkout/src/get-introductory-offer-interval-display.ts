import { useTranslate } from 'i18n-calypso';

export function getIntroductoryOfferIntervalDisplay(
	translate: ReturnType< typeof useTranslate >,
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
		if ( context === 'checkout' ) {
			text +=
				' - ' +
				String(
					translate( 'The first %(remainingRenewals)d renewals are also discounted.', {
						args: {
							remainingRenewals: remainingRenewalsUsingOffer,
						},
					} )
				);
		} else {
			text +=
				' - ' +
				String(
					translate( '%(remainingRenewals)d discounted renewals remaining.', {
						args: {
							remainingRenewals: remainingRenewalsUsingOffer,
						},
					} )
				);
		}
	}
	return text;
}

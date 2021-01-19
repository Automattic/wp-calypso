/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';
import type { TranslateResult } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import {
	isExpired,
	isExpiring,
	isAutoRenewDisabled,
	isIncludedWithPlan,
	isPaidWithCreditCard,
	isPaidWithCredits,
	isPaidWithPayPalDirect,
	paymentLogoType,
	hasPaymentMethod,
} from 'calypso/lib/purchases';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import PaymentLogo from 'calypso/components/payment-logo';
import type { Purchase } from 'calypso/lib/purchases/types';

export default function PaymentInfoBlock( {
	purchase,
}: {
	purchase: Purchase;
} ): JSX.Element | TranslateResult {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	if ( isIncludedWithPlan( purchase ) ) {
		return translate( 'Included with plan' );
	}

	if ( hasPaymentMethod( purchase ) ) {
		let paymentInfo = null;

		if ( isPaidWithCredits( purchase ) ) {
			return translate( 'Credits' );
		}

		if ( ! isAutoRenewDisabled( purchase ) && ! isPaidWithCredits( purchase ) ) {
			if ( isExpired( purchase ) || isExpiring( purchase ) ) {
				return translate( 'None' );
			}
		}

		if ( isPaidWithCreditCard( purchase ) ) {
			paymentInfo = purchase.payment.creditCard?.number;
		}

		if ( isPaidWithPayPalDirect( purchase ) ) {
			paymentInfo = translate( 'expiring %(cardExpiry)s', {
				args: {
					cardExpiry: moment( purchase.payment.expiryDate, 'MM/YY' ).format( 'MMMM YYYY' ),
				},
			} );
		}

		const logoType = paymentLogoType( purchase );
		if ( logoType || paymentInfo ) {
			return (
				<>
					<PaymentLogo type={ paymentLogoType( purchase ) } />
					{ paymentInfo }
				</>
			);
		}
	}

	return translate( 'None' );
}

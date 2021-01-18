/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import {
	isExpiring,
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

export default function PaymentInfoBlock( { purchase }: { purchase: Purchase } ): JSX.Element {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	if ( isIncludedWithPlan( purchase ) ) {
		return <PaymentInfoBlockWrapper>{ translate( 'Included with plan' ) }</PaymentInfoBlockWrapper>;
	}

	if ( hasPaymentMethod( purchase ) ) {
		if ( isPaidWithCredits( purchase ) ) {
			return <PaymentInfoBlockWrapper>{ translate( 'Credits' ) }</PaymentInfoBlockWrapper>;
		}

		const logoType = paymentLogoType( purchase );

		if ( isPaidWithCreditCard( purchase ) ) {
			return (
				<PaymentInfoBlockWrapper
					willNotBeBilled={ !! ( isExpiring( purchase ) && purchase.payment.creditCard ) }
				>
					<PaymentLogo type={ logoType } disabled={ isExpiring( purchase ) } />
					{ purchase.payment.creditCard?.number ?? '' }
				</PaymentInfoBlockWrapper>
			);
		}

		if ( isPaidWithPayPalDirect( purchase ) ) {
			return (
				<PaymentInfoBlockWrapper willNotBeBilled={ isExpiring( purchase ) }>
					<PaymentLogo type={ logoType } disabled={ isExpiring( purchase ) } />
					{ translate( 'expiring %(cardExpiry)s', {
						args: {
							cardExpiry: moment( purchase.payment.expiryDate, 'MM/YY' ).format( 'MMMM YYYY' ),
						},
					} ) }
				</PaymentInfoBlockWrapper>
			);
		}

		return (
			<PaymentInfoBlockWrapper willNotBeBilled={ isExpiring( purchase ) }>
				<PaymentLogo type={ logoType } disabled={ isExpiring( purchase ) } />
			</PaymentInfoBlockWrapper>
		);
	}

	return <PaymentInfoBlockWrapper>{ translate( 'None' ) }</PaymentInfoBlockWrapper>;
}

function PaymentInfoBlockWrapper( {
	children,
	willNotBeBilled,
}: {
	children: React.ReactNode;
	willNotBeBilled?: boolean;
} ) {
	const translate = useTranslate();
	return (
		<aside aria-label={ String( translate( 'Payment method' ) ) }>
			<em className="manage-purchase__detail-label">{ translate( 'Payment method' ) }</em>
			{ willNotBeBilled && (
				<div className="manage-purchase__detail-label-subtitle">
					{ translate( '(this will not be billed)' ) }
				</div>
			) }
			<span className="manage-purchase__detail">{ children }</span>
		</aside>
	);
}

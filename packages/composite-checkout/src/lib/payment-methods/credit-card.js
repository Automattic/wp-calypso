/**
 * External dependencies
 */
import React from 'react';
import styled from '@emotion/styled';

/**
 * Internal dependencies
 */
import Button from '../../components/button';
import { useLocalize, sprintf } from '../../lib/localize';
import { useSelect, useLineItems, renderDisplayValueMarkdown } from '../../public-api';
import { VisaLogo, MastercardLogo, AmexLogo } from '../../components/payment-logos';
import CreditCardFields from './credit-card-fields';

export function createCreditCardMethod() {
	return {
		id: 'card',
		LabelComponent: CreditCardLabel,
		PaymentMethodComponent: CreditCardFields,
		SubmitButtonComponent: CreditCardSubmitButton,
		SummaryComponent: CreditCardSummary,
		getAriaLabel: localize => localize( 'Credit Card' ),
	};
}

export function CreditCardLabel() {
	const localize = useLocalize();
	return (
		<React.Fragment>
			<span>{ localize( 'Credit or debit card' ) }</span>
			<CreditCardLogos />
		</React.Fragment>
	);
}

export function CreditCardSubmitButton() {
	const localize = useLocalize();
	const [ , total ] = useLineItems();
	const buttonString = sprintf(
		localize( 'Pay %s' ),
		renderDisplayValueMarkdown( total.amount.displayValue )
	);
	return (
		<Button onClick={ submitCreditCardPayment } buttonState="primary" fullWidth>
			{ buttonString }
		</Button>
	);
}

export function CreditCardSummary( { id } ) {
	const localize = useLocalize();
	const paymentData = useSelect( select => select( 'checkout' ).getPaymentData() );

	let PaymentLogo = null;

	if ( paymentData.creditCard && id === 'card' ) {
		//TODO: Update this with all credit card types we support
		switch ( Number( paymentData.creditCard.cardNumber[ 0 ] ) ) {
			case 3:
				PaymentLogo = <AmexLogo />;
				break;
			case 4:
				PaymentLogo = <VisaLogo />;
				break;
			case 5:
				PaymentLogo = <MastercardLogo />;
				break;
			default:
				PaymentLogo = null;
		}

		return (
			<React.Fragment>
				<div>{ paymentData.creditCard.cardHolderName }</div>
				<div>
					<PaymentLogoWrapper>{ PaymentLogo }</PaymentLogoWrapper>
					<CreditCardDetail>
						**** { paymentData.creditCard.cardNumber.slice( -4 ) }
					</CreditCardDetail>
					{ localize( 'Exp:' ) } { paymentData.creditCard.cardExpiry }
				</div>
			</React.Fragment>
		);
	}

	return <React.Fragment>{ localize( 'Credit card' ) }</React.Fragment>;
}

const CreditCardDetail = styled.span`
	display: inline-block;
	margin-right: 8px;
`;

const PaymentLogoWrapper = styled( CreditCardDetail )`
	transform: translateY( 4px );
`;

function CreditCardLogos() {
	//TODO: Determine which logos to show

	return (
		<LogoWrapper>
			<VisaLogo />
			<MastercardLogo />
			<AmexLogo />
		</LogoWrapper>
	);
}

const LogoWrapper = styled.div`
	display: flex;
`;

function submitCreditCardPayment() {
	alert( 'Thank you!' );
}

/**
 * External dependencies
 */
import React from 'react';
import styled from 'styled-components';

/**
 * Internal dependencies
 */
import Button from '../../components/button';
import { useLocalize } from '../../lib/localize';
import { useLineItems, renderDisplayValueMarkdown } from '../../public-api';
import { VisaLogo, MastercardLogo, AmexLogo } from '../../components/payment-logos';
import CreditCardFields from '../../components/credit-card-fields';
import BillingFields from '../../components/billing-fields';

export function createCreditCardMethod() {
	return {
		id: 'card',
		LabelComponent: CreditCardLabel,
		PaymentMethodComponent: ( { isActive } ) => ( isActive ? <CreditCardFields /> : null ),
		BillingContactComponent: BillingFields,
		SubmitButtonComponent: CreditCardSubmitButton,
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
	// TODO: we need to use a placeholder for the value so the localization string can be generic
	const buttonString = localize(
		`Pay ${ renderDisplayValueMarkdown( total.amount.displayValue ) }`
	);
	return (
		<Button onClick={ submitCreditCardPayment } buttonState="primary" fullWidth>
			{ buttonString }
		</Button>
	);
}

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

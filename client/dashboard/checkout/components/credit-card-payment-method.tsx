/**
 * Credit card payment method for checkout
 * Simplified version without tax location form (already collected in billing address step)
 */
import { FormStatus, useFormStatus } from '@automattic/composite-checkout';
import { CardNumberElement, useElements } from '@stripe/react-stripe-js';
import {
	Button,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Fragment, useState } from 'react';
import { PaymentMethodImage } from '../../me/billing-purchases/payment-method-image';
import { CreditCardFields } from '../../me/billing-purchases/payment-methods/credit-card-fields';
import type { PaymentMethod, ProcessPayment } from '@automattic/composite-checkout';
import type { StripeCardNumberElement } from '@stripe/stripe-js';

import './credit-card-payment-method.scss';

export interface CreditCardFormData {
	cardholderName: string;
}

function getDefaultFormData(): CreditCardFormData {
	return {
		cardholderName: '',
	};
}

export function createCreditCardMethod( {
	currency,
	hasExistingCards,
}: {
	currency?: string | null | undefined;
	hasExistingCards?: boolean;
} ): PaymentMethod {
	let sharedFormData = getDefaultFormData();
	let sharedCardNumberElement: StripeCardNumberElement | undefined;

	const CreditCardFieldsWithData = () => (
		<CreditCardFieldsWrapper
			onDataChange={ ( data ) => ( sharedFormData = data ) }
			onCardElementReady={ ( element ) => ( sharedCardNumberElement = element ) }
		/>
	);

	const CreditCardSubmitButtonWithData = ( props: {
		disabled?: boolean;
		onClick?: ProcessPayment;
	} ) => (
		<CreditCardSubmitButton
			{ ...props }
			getFormData={ () => sharedFormData }
			getCardElement={ () => sharedCardNumberElement }
		/>
	);

	return {
		id: 'card',
		paymentProcessorId: 'card',
		label: <CreditCardLabel currency={ currency } hasExistingCards={ hasExistingCards } />,
		hasRequiredFields: true,
		activeContent: <CreditCardFieldsWithData />,
		submitButton: <CreditCardSubmitButtonWithData />,
		inactiveContent: <CreditCardSummary />,
		getAriaLabel: () => 'Credit Card',
	};
}

function CreditCardLabel( {
	currency,
	hasExistingCards,
}: {
	currency: string | null | undefined;
	hasExistingCards?: boolean;
} ) {
	return (
		<Fragment>
			<HStack>
				<Text>
					{ hasExistingCards ? __( 'New credit or debit card' ) : __( 'Credit or debit card' ) }
				</Text>
			</HStack>
			<CreditCardLogos currency={ currency } />
		</Fragment>
	);
}

function CreditCardLogos( { currency }: { currency: string | null | undefined } ) {
	const logos = [];
	if ( currency === 'EUR' ) {
		logos.push( 'cb' );
	}
	if ( currency === 'JPY' ) {
		logos.push( 'jcb' );
	}
	logos.push( 'visa', 'mastercard', 'amex' );

	return (
		<HStack className="credit-card-logos" spacing={ 1 } justify="flex-end">
			{ logos.map( ( logo ) => (
				<PaymentMethodImage key={ logo } paymentMethodType={ logo } />
			) ) }
		</HStack>
	);
}

function CreditCardFieldsWrapper( {
	onDataChange,
	onCardElementReady,
}: {
	onDataChange: ( data: CreditCardFormData ) => void;
	onCardElementReady: ( element: StripeCardNumberElement | undefined ) => void;
} ) {
	const [ formData, setFormData ] = useState< CreditCardFormData >( getDefaultFormData() );
	const elements = useElements();

	// Notify parent of card element when available
	const cardElement = elements?.getElement( CardNumberElement ) ?? undefined;
	if ( cardElement ) {
		onCardElementReady( cardElement );
	}

	const handleFieldChange = ( updates: Partial< CreditCardFormData > ) => {
		const newData = { ...formData, ...updates };
		setFormData( newData );
		onDataChange( newData );
	};

	return (
		<VStack className="credit-card-fields" spacing={ 4 }>
			<CreditCardFields
				cardholderName={ formData.cardholderName }
				onCardholderNameChange={ ( name ) => handleFieldChange( { cardholderName: name } ) }
			/>
		</VStack>
	);
}

function CreditCardSubmitButton( {
	disabled,
	onClick,
	getFormData,
	getCardElement,
}: {
	disabled?: boolean;
	onClick?: ProcessPayment;
	getFormData: () => CreditCardFormData;
	getCardElement: () => StripeCardNumberElement | undefined;
} ) {
	const { formStatus } = useFormStatus();

	const handleButtonPress = () => {
		if ( ! onClick ) {
			throw new Error(
				'Missing onClick prop; CreditCardSubmitButton must be used as a payment button in CheckoutSubmitButton'
			);
		}
		const formData = getFormData();
		const cardElement = getCardElement();

		onClick( {
			name: formData.cardholderName,
			cardNumberElement: cardElement,
		} );
	};

	return (
		<Button
			disabled={ disabled }
			onClick={ handleButtonPress }
			variant="primary"
			isBusy={ FormStatus.SUBMITTING === formStatus }
		>
			{ __( 'Pay now' ) }
		</Button>
	);
}

function CreditCardSummary() {
	return <>{ __( 'Credit or debit card' ) }</>;
}

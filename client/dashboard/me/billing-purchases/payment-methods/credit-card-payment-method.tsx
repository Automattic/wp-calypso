import { FormStatus, useFormStatus } from '@automattic/composite-checkout';
import { CardNumberElement, useElements } from '@stripe/react-stripe-js';
import {
	Button,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Fragment, useState } from 'react';
import InlineSupportLink from '../../../components/inline-support-link';
import { TaxLocationForm, defaultTaxLocation } from '../../../components/tax-location-form';
import { PaymentMethodImage } from '../payment-method-image';
import { CreditCardFields } from './credit-card-fields';
import type { StoredPaymentMethodTaxLocation } from '@automattic/api-core';
import type { PaymentMethod, ProcessPayment } from '@automattic/composite-checkout';
import type { StripeCardNumberElement } from '@stripe/stripe-js';

export interface CreditCardFormData {
	cardholderName: string;
	taxLocation: StoredPaymentMethodTaxLocation;
	useForAllSubscriptions: boolean;
}

function getDefaultFormData( {
	defaultToUseForAllSubscriptions,
}: {
	defaultToUseForAllSubscriptions?: boolean;
} ): CreditCardFormData {
	const defaultFormData: Omit< CreditCardFormData, 'useForAllSubscriptions' > = {
		cardholderName: '',
		taxLocation: defaultTaxLocation,
	};

	return {
		...defaultFormData,
		useForAllSubscriptions: defaultToUseForAllSubscriptions ?? false,
	};
}

export function createCreditCardMethod( {
	currency,
	hasExistingCardMethods,
	allowUseForAllSubscriptions,
	defaultToUseForAllSubscriptions,
}: {
	currency?: string | null | undefined;
	hasExistingCardMethods?: boolean;
	allowUseForAllSubscriptions?: boolean;
	defaultToUseForAllSubscriptions?: boolean;
} ): PaymentMethod {
	let sharedFormData = getDefaultFormData( { defaultToUseForAllSubscriptions } );
	let sharedCardNumberElement: StripeCardNumberElement | undefined;

	const CreditCardFieldsWithData = () => (
		<CreditCardFieldsWrapper
			allowUseForAllSubscriptions={ allowUseForAllSubscriptions }
			onDataChange={ ( data ) => ( sharedFormData = data ) }
			onCardElementReady={ ( element ) => ( sharedCardNumberElement = element ) }
			defaultToUseForAllSubscriptions={ defaultToUseForAllSubscriptions }
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
		label: (
			<CreditCardLabel hasExistingCardMethods={ hasExistingCardMethods } currency={ currency } />
		),
		hasRequiredFields: true,
		activeContent: <CreditCardFieldsWithData />,
		submitButton: <CreditCardSubmitButtonWithData />,
		inactiveContent: <CreditCardSummary />,
		getAriaLabel: () => 'Credit Card',
	};
}

function CreditCardLabel( {
	hasExistingCardMethods,
	currency,
}: {
	hasExistingCardMethods?: boolean;
	currency: string | null | undefined;
} ) {
	return (
		<Fragment>
			<HStack>
				<Text>
					{ hasExistingCardMethods
						? __( 'New credit or debit card' )
						: __( 'Credit or debit card' ) }
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
	allowUseForAllSubscriptions,
	onDataChange,
	onCardElementReady,
	defaultToUseForAllSubscriptions,
}: {
	allowUseForAllSubscriptions?: boolean;
	onDataChange: ( data: CreditCardFormData ) => void;
	onCardElementReady: ( element: StripeCardNumberElement | undefined ) => void;
	defaultToUseForAllSubscriptions?: boolean;
} ) {
	const [ formData, setFormData ] = useState< CreditCardFormData >(
		getDefaultFormData( { defaultToUseForAllSubscriptions } )
	);
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
		<VStack className="credit-card-fields">
			<CreditCardFields
				cardholderName={ formData.cardholderName }
				onCardholderNameChange={ ( name ) => handleFieldChange( { cardholderName: name } ) }
			/>
			<TaxLocationForm
				data={ formData.taxLocation }
				onChange={ ( updated ) =>
					handleFieldChange( { taxLocation: { ...formData.taxLocation, ...updated } } )
				}
			/>
			{ allowUseForAllSubscriptions && (
				<label>
					<input
						type="checkbox"
						checked={ formData.useForAllSubscriptions }
						onChange={ ( e ) => handleFieldChange( { useForAllSubscriptions: e.target.checked } ) }
					/>
					{ createInterpolateElement(
						__(
							'Use this payment method for all subscriptions on my account. <link>Learn more.</link>'
						),
						{
							link: <InlineSupportLink supportContext="payment_method_all_subscriptions" />,
						}
					) }
				</label>
			) }
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
			countryCode: formData.taxLocation.country_code,
			postalCode: formData.taxLocation.postal_code,
			state: formData.taxLocation.subdivision_code,
			city: formData.taxLocation.city,
			organization: formData.taxLocation.organization,
			address: formData.taxLocation.address,
			useForAllSubscriptions: formData.useForAllSubscriptions,
			cardElement,
		} );
	};

	return (
		<Button
			disabled={ disabled }
			onClick={ handleButtonPress }
			variant="primary"
			isBusy={ FormStatus.SUBMITTING === formStatus }
		>
			{ __( 'Save card' ) }
		</Button>
	);
}

function CreditCardSummary() {
	return <>{ __( 'Credit or debit card' ) }</>;
}

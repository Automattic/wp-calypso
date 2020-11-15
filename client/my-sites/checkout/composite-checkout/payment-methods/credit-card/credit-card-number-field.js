/**
 * External dependencies
 */
import React from 'react';
import { useI18n } from '@automattic/react-i18n';
import { CardNumberElement } from 'react-stripe-elements';
import { FormStatus, useFormStatus, useSelect, PaymentLogo } from '@automattic/composite-checkout';
import { useShoppingCart } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import { shouldRenderAdditionalCountryFields } from 'calypso/lib/checkout/processor-specific';
import CreditCardNumberInput from 'calypso/components/upgrades/credit-card-number-input';
import { Label, LabelText, StripeFieldWrapper, StripeErrorMessage } from './form-layout-components';

export default function CreditCardNumberField( {
	setIsStripeFullyLoaded,
	handleStripeFieldChange,
	stripeElementStyle,
	countryCode,
	getErrorMessagesForField,
	setFieldValue,
	getFieldValue,
} ) {
	const { __ } = useI18n();
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;
	const brand = useSelect( ( select ) => select( 'credit-card' ).getBrand() );
	const { cardNumber: cardNumberError } = useSelect( ( select ) =>
		select( 'credit-card' ).getCardDataErrors()
	);
	const errorMessages = getErrorMessagesForField( 'number' );
	const errorMessage = errorMessages?.length > 0 ? errorMessages[ 0 ] : null;
	const { responseCart } = useShoppingCart();

	if ( countryCode && shouldRenderAdditionalCountryFields( countryCode, responseCart ) ) {
		return (
			<CreditCardNumberInput
				isError={ !! errorMessage }
				errorMessage={ errorMessage }
				inputMode="numeric"
				label={ __( 'Card number' ) }
				placeholder={ '•••• •••• •••• ••••' }
				disabled={ isDisabled }
				name="number"
				onChange={ ( event ) => setFieldValue( 'number', event.target.value ) }
				onBlur={ ( event ) => setFieldValue( 'number', event.target.value ) }
				value={ getFieldValue( 'number' ) }
				autoComplete="off"
			/>
		);
	}

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<Label>
			<LabelText>{ __( 'Card number' ) }</LabelText>
			<StripeFieldWrapper className="number" hasError={ cardNumberError }>
				<CardNumberElement
					style={ stripeElementStyle }
					onReady={ () => {
						setIsStripeFullyLoaded( true );
					} }
					onChange={ ( input ) => {
						handleStripeFieldChange( input );
					} }
					disabled={ isDisabled }
				/>
				<PaymentLogo brand={ brand } />

				{ cardNumberError && <StripeErrorMessage>{ cardNumberError }</StripeErrorMessage> }
			</StripeFieldWrapper>
		</Label>
	);
}

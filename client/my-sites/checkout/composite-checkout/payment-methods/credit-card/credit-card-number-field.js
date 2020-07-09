/**
 * External dependencies
 */
import React from 'react';
import { useI18n } from '@automattic/react-i18n';
import { CardNumberElement } from 'react-stripe-elements';
import { useFormStatus, useSelect } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import PaymentLogo from 'my-sites/checkout/composite-checkout/wpcom/components/payment-logo';
import { shouldRenderAdditionalCountryFields } from 'lib/checkout/processor-specific';
import CreditCardNumberInput from 'components/upgrades/credit-card-number-input';
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
	const isDisabled = formStatus !== 'ready';
	const brand = useSelect( ( select ) => select( 'credit-card' ).getBrand() );
	const { cardNumber: cardNumberError } = useSelect( ( select ) =>
		select( 'credit-card' ).getCardDataErrors()
	);
	const errorMessages = getErrorMessagesForField( 'number' );
	const errorMessage = errorMessages?.length > 0 ? errorMessages[ 0 ] : null;

	if ( countryCode && shouldRenderAdditionalCountryFields( countryCode ) ) {
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
				/>
				<PaymentLogo brand={ brand } />

				{ cardNumberError && <StripeErrorMessage>{ cardNumberError }</StripeErrorMessage> }
			</StripeFieldWrapper>
		</Label>
	);
}

/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';
import { CardExpiryElement } from 'react-stripe-elements';
import { FormStatus, useFormStatus, useSelect } from '@automattic/composite-checkout';
import { useShoppingCart } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import { shouldRenderAdditionalCountryFields } from 'calypso/lib/checkout/processor-specific';
import { Label, LabelText, StripeFieldWrapper, StripeErrorMessage } from './form-layout-components';
import { Input } from 'calypso/my-sites/domains/components/form';

export default function CreditCardExpiryField( {
	handleStripeFieldChange,
	stripeElementStyle,
	countryCode,
	getErrorMessagesForField,
	setFieldValue,
	getFieldValue,
} ) {
	const translate = useTranslate();
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;
	const { cardExpiry: cardExpiryError } = useSelect( ( select ) =>
		select( 'credit-card' ).getCardDataErrors()
	);
	const errorMessages = getErrorMessagesForField( 'expiration-date' );
	const errorMessage = errorMessages?.length > 0 ? errorMessages[ 0 ] : null;
	const { responseCart } = useShoppingCart();

	if ( countryCode && shouldRenderAdditionalCountryFields( countryCode, responseCart ) ) {
		return (
			<Input
				inputMode="numeric"
				label={ translate( 'Expiry date' ) }
				disabled={ isDisabled }
				placeholder={ translate( 'MM/YY', {
					comment: 'Expiry placeholder for Expiry date on credit card form',
				} ) }
				isError={ !! errorMessage }
				errorMessage={ errorMessage }
				name="expiration-date"
				onChange={ ( event ) => setFieldValue( 'expiration-date', event.target.value ) }
				onBlur={ ( event ) => setFieldValue( 'expiration-date', event.target.value ) }
				value={ getFieldValue( 'expiration-date' ) }
				autoComplete="off"
			/>
		);
	}

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<Label>
			<LabelText>{ translate( 'Expiry date' ) }</LabelText>
			<StripeFieldWrapper className="expiration-date" hasError={ cardExpiryError }>
				<CardExpiryElement
					style={ stripeElementStyle }
					onChange={ ( input ) => {
						handleStripeFieldChange( input );
					} }
					disabled={ isDisabled }
				/>
			</StripeFieldWrapper>
			{ cardExpiryError && <StripeErrorMessage>{ cardExpiryError }</StripeErrorMessage> }
		</Label>
	);
}

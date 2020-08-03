/**
 * External dependencies
 */
import React, { useState } from 'react';
import styled from '@emotion/styled';
import { useTheme } from 'emotion-theming';
import { useI18n } from '@automattic/react-i18n';
import { useEvents, useSelect, useDispatch, useFormStatus } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import {
	LeftColumn,
	RightColumn,
} from 'my-sites/checkout/composite-checkout/wpcom/components/ie-fallback';
import Spinner from 'my-sites/checkout/composite-checkout/wpcom/components/spinner';
import ContactFields from './contact-fields';
import CreditCardNumberField from './credit-card-number-field';
import CreditCardExpiryField from './credit-card-expiry-field';
import CreditCardCvvField from './credit-card-cvv-field';
import {
	FieldRow,
	Label,
	LabelText,
	CreditCardFieldsWrapper,
	CreditCardField,
} from './form-layout-components';
import CreditCardLoading from './credit-card-loading';
import { paymentMethodClassName } from 'lib/cart-values';
import { useCart } from 'my-sites/checkout/composite-checkout/cart-provider';

export default function CreditCardFields() {
	const { __ } = useI18n();
	const theme = useTheme();
	const onEvent = useEvents();
	const [ isStripeFullyLoaded, setIsStripeFullyLoaded ] = useState( false );
	const cardholderName = useSelect( ( select ) => select( 'credit-card' ).getCardholderName() );
	const { changeCardholderName, changeBrand, setCardDataError, setCardDataComplete } = useDispatch(
		'credit-card'
	);
	const cart = useCart();
	const shouldShowContactFieldCheckbox = Boolean(
		cart?.allowed_payment_methods?.includes( paymentMethodClassName( 'ebanx' ) )
	);

	const handleStripeFieldChange = ( input ) => {
		setCardDataComplete( input.elementType, input.complete );
		if ( input.elementType === 'cardNumber' ) {
			changeBrand( input.brand );
		}

		if ( input.error && input.error.message ) {
			onEvent( {
				type: 'a8c_checkout_stripe_field_invalid_error',
				payload: {
					type: 'Stripe field error',
					field: input.elementType,
					message: input.error.message,
				},
			} );
			setCardDataError( input.elementType, input.error.message );
			return;
		}
		setCardDataError( input.elementType, null );
	};

	const fields = useSelect( ( select ) => select( 'credit-card' ).getFields() );
	const shouldShowContactFields = useSelect( ( select ) =>
		select( 'credit-card' ).getShowContactFields()
	);
	const { setFieldValue, setShowContactFields } = useDispatch( 'credit-card' );
	const getField = ( key ) => fields[ key ] || {};
	const getFieldValue = ( key ) => getField( key ).value ?? '';
	const getErrorMessagesForField = ( key ) => {
		const managedValue = getField( key );

		if ( managedValue?.isRequired && managedValue?.value === '' ) {
			return [ __( 'This field is required.' ) ];
		}

		return managedValue.errors ?? [];
	};
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== 'ready';

	const stripeElementStyle = {
		base: {
			fontSize: '16px',
			color: theme.colors.textColor,
			fontFamily: theme.fonts.body,
			fontWeight: theme.weights.normal,
			'::placeholder': {
				color: theme.colors.placeHolderTextColor,
			},
		},
		invalid: {
			color: theme.colors.textColor,
		},
	};

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<StripeFields className="credit-card-form-fields">
			{ ! isStripeFullyLoaded && <LoadingFields /> }

			<CreditCardFieldsWrapper isLoaded={ isStripeFullyLoaded }>
				<CreditCardField
					id="cardholder-name"
					type="Text"
					autoComplete="cc-name"
					label={ __( 'Cardholder name' ) }
					description={ __( "Enter your name as it's written on the card" ) }
					value={ cardholderName?.value ?? '' }
					onChange={ changeCardholderName }
					// TODO: use the error property of cardholderName here
					isError={ cardholderName?.isTouched && cardholderName?.value.length === 0 }
					errorMessage={ __( 'This field is required' ) }
					disabled={ isDisabled }
				/>

				{ shouldShowContactFieldCheckbox && (
					<FieldRow>
						<Label>
							<input
								type="checkbox"
								checked={ ! shouldShowContactFields }
								onChange={ () => setShowContactFields( ! shouldShowContactFields ) }
								disabled={ isDisabled }
							/>
							<LabelText>{ __( 'Credit card address is the same as contact details' ) }</LabelText>
						</Label>
					</FieldRow>
				) }

				{ shouldShowContactFields && (
					<ContactFields
						getField={ getField }
						getFieldValue={ getFieldValue }
						setFieldValue={ setFieldValue }
						getErrorMessagesForField={ getErrorMessagesForField }
					/>
				) }

				<FieldRow>
					<CreditCardNumberField
						setIsStripeFullyLoaded={ setIsStripeFullyLoaded }
						handleStripeFieldChange={ handleStripeFieldChange }
						stripeElementStyle={ stripeElementStyle }
						countryCode={ getFieldValue( 'countryCode' ) }
						getErrorMessagesForField={ getErrorMessagesForField }
						setFieldValue={ setFieldValue }
						getFieldValue={ getFieldValue }
					/>

					<FieldRow gap="4%" columnWidths="48% 48%">
						<LeftColumn>
							<CreditCardExpiryField
								handleStripeFieldChange={ handleStripeFieldChange }
								stripeElementStyle={ stripeElementStyle }
								countryCode={ getFieldValue( 'countryCode' ) }
								getErrorMessagesForField={ getErrorMessagesForField }
								setFieldValue={ setFieldValue }
								getFieldValue={ getFieldValue }
							/>
						</LeftColumn>
						<RightColumn>
							<CreditCardCvvField
								handleStripeFieldChange={ handleStripeFieldChange }
								stripeElementStyle={ stripeElementStyle }
								countryCode={ getFieldValue( 'countryCode' ) }
								getErrorMessagesForField={ getErrorMessagesForField }
								setFieldValue={ setFieldValue }
								getFieldValue={ getFieldValue }
							/>
						</RightColumn>
					</FieldRow>
				</FieldRow>
			</CreditCardFieldsWrapper>
		</StripeFields>
	);
}

const StripeFields = styled.div`
	position: relative;
`;

function LoadingFields() {
	return (
		<React.Fragment>
			<LoadingIndicator />
			<CreditCardLoading />
		</React.Fragment>
	);
}

const LoadingIndicator = styled( Spinner )`
	position: absolute;
	right: 15px;
	top: 10px;

	.rtl & {
		right: auto;
		left: 15px;
	}
`;

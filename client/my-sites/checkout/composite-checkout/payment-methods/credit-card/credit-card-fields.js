/**
 * External dependencies
 */
import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useTheme } from 'emotion-theming';
import { useI18n } from '@automattic/react-i18n';
import {
	FormStatus,
	useEvents,
	useSelect,
	useDispatch,
	useFormStatus,
} from '@automattic/composite-checkout';
import { useShoppingCart } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import {
	LeftColumn,
	RightColumn,
} from 'calypso/my-sites/checkout/composite-checkout/components/ie-fallback';
import Spinner from 'calypso/my-sites/checkout/composite-checkout/components/spinner';
import ContactFields from './contact-fields';
import CreditCardNumberField from './credit-card-number-field';
import CreditCardExpiryField from './credit-card-expiry-field';
import CreditCardCvvField from './credit-card-cvv-field';
import { FieldRow, CreditCardFieldsWrapper, CreditCardField } from './form-layout-components';
import CreditCardLoading from './credit-card-loading';
import { translateCheckoutPaymentMethodToWpcomPaymentMethod } from '../../lib/translate-payment-method-names';

export default function CreditCardFields( { shouldUseEbanx } ) {
	const { __ } = useI18n();
	const theme = useTheme();
	const onEvent = useEvents();
	const [ isStripeFullyLoaded, setIsStripeFullyLoaded ] = useState( false );
	const fields = useSelect( ( select ) => select( 'credit-card' ).getFields() );
	const getField = ( key ) => fields[ key ] || {};
	const getFieldValue = ( key ) => getField( key ).value ?? '';
	const getErrorMessagesForField = ( key ) => {
		const managedValue = getField( key );
		if ( managedValue?.isRequired && managedValue?.value === '' ) {
			return [ __( 'This field is required.' ) ];
		}
		return managedValue.errors ?? [];
	};
	const { setFieldValue, changeBrand, setCardDataError, setCardDataComplete } = useDispatch(
		'credit-card'
	);
	const { responseCart: cart } = useShoppingCart();

	const cardholderName = getField( 'cardholderName' );
	const cardholderNameErrorMessages = getErrorMessagesForField( 'cardholderName' ) || [];
	const cardholderNameErrorMessage = cardholderNameErrorMessages.length
		? cardholderNameErrorMessages[ 0 ]
		: null;

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

	const contactCountryCode = useSelect(
		( select ) => select( 'wpcom' )?.getContactInfo().countryCode?.value
	);
	const shouldShowContactFields =
		contactCountryCode === 'BR' &&
		Boolean(
			cart?.allowed_payment_methods?.includes(
				translateCheckoutPaymentMethodToWpcomPaymentMethod( 'ebanx' )
			)
		);
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;

	// Cache the country code in our store for use by the processor function
	useEffect( () => {
		setFieldValue( 'countryCode', contactCountryCode );
	}, [ contactCountryCode, setFieldValue ] );

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

	const isLoaded = shouldShowContactFields ? true : isStripeFullyLoaded;

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<StripeFields className="credit-card-form-fields">
			{ ! isLoaded && <LoadingFields /> }

			<CreditCardFieldsWrapper isLoaded={ isLoaded }>
				<CreditCardField
					id="cardholder-name"
					type="Text"
					autoComplete="cc-name"
					label={ __( 'Cardholder name' ) }
					description={ __( "Enter your name as it's written on the card" ) }
					value={ cardholderName?.value ?? '' }
					onChange={ ( value ) => setFieldValue( 'cardholderName', value ) }
					isError={ !! cardholderNameErrorMessage }
					errorMessage={ cardholderNameErrorMessage }
					disabled={ isDisabled }
				/>

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

				{ shouldShowContactFields && (
					<ContactFields
						getField={ getField }
						getFieldValue={ getFieldValue }
						setFieldValue={ setFieldValue }
						getErrorMessagesForField={ getErrorMessagesForField }
					/>
				) }
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

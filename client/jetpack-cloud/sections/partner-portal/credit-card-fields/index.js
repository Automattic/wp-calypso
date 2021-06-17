/**
 * External dependencies
 */
import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useTheme } from 'emotion-theming';
import { useI18n } from '@wordpress/react-i18n';
import {
	FormStatus,
	useEvents,
	useSelect,
	useDispatch,
	useFormStatus,
} from '@automattic/composite-checkout';

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
import { FieldRow, CreditCardField } from './form-layout-components';
import CreditCardLoading from './credit-card-loading';
import PaymentMethodImage from 'calypso/jetpack-cloud/sections/partner-portal/credit-card-fields/payment-method-image';

/**
 * Style dependencies
 */
import './style.scss';

export default function CreditCardFields( { shouldUseEbanx, shouldShowTaxFields } ) {
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

	// We need the countryCode for the country specific payment fields which have
	// no country selector but require country data during validation and submit
	// as well as the code that decides which fields to display. Since Ebanx is
	// only available in BR, we will hard-code it here, but if we ever expand
	// Ebanx to other countries, this will need to be changed.
	const contactCountryCode = shouldUseEbanx ? 'BR' : '';
	useEffect( () => {
		setFieldValue( 'countryCode', contactCountryCode );
	}, [ contactCountryCode, setFieldValue ] );

	const cardholderName = getField( 'cardholderName' );
	const cardholderNameErrorMessages = getErrorMessagesForField( 'cardholderName' ) || [];
	const cardholderNameErrorMessage = cardholderNameErrorMessages.length
		? cardholderNameErrorMessages[ 0 ]
		: null;

	const cardholderEmail = getField( 'cardholderEmail' );
	const cardholderEmailErrorMessages = getErrorMessagesForField( 'cardholderEmail' ) || [];
	const cardholderEmailErrorMessage = cardholderEmailErrorMessages.length
		? cardholderEmailErrorMessages[ 0 ]
		: null;

	const cardholderPhone = getField( 'cardholderPhone' );
	const cardholderPhoneErrorMessages = getErrorMessagesForField( 'cardholderPhone' ) || [];
	const cardholderPhoneErrorMessage = cardholderPhoneErrorMessages.length
		? cardholderPhoneErrorMessages[ 0 ]
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

	const shouldShowContactFields = shouldUseEbanx || shouldShowTaxFields;
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;

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

	return (
		<div className="credit-card-fields">
			{ ! isLoaded && <LoadingFields /> }

			<div className="credit-card-fields__form">
				<CreditCardField
					id="cardholder-name"
					type="Text"
					autoComplete="cc-name"
					label={ __( 'Name' ) }
					value={ cardholderName?.value ?? '' }
					onChange={ ( value ) => setFieldValue( 'cardholderName', value ) }
					isError={ !! cardholderNameErrorMessage }
					errorMessage={ cardholderNameErrorMessage }
					disabled={ isDisabled }
				/>

				<CreditCardField
					id="cardholder-email"
					type="Text"
					autoComplete="cc-email"
					label={ __( 'Email' ) }
					value={ cardholderEmail?.value ?? '' }
					onChange={ ( value ) => setFieldValue( 'cardholderEmail', value ) }
					isError={ !! cardholderEmailErrorMessage }
					errorMessage={ cardholderEmailErrorMessage }
					disabled={ isDisabled }
				/>

				<CreditCardField
					id="cardholder-phone"
					type="Text"
					autoComplete="cc-phone"
					label={ __( 'Phone' ) }
					value={ cardholderPhone?.value ?? '' }
					onChange={ ( value ) => setFieldValue( 'cardholderPhone', value ) }
					isError={ !! cardholderPhoneErrorMessage }
					errorMessage={ cardholderPhoneErrorMessage }
					disabled={ isDisabled }
				/>

				<FieldRow>
					<CreditCardNumberField
						setIsStripeFullyLoaded={ setIsStripeFullyLoaded }
						handleStripeFieldChange={ handleStripeFieldChange }
						stripeElementStyle={ stripeElementStyle }
						shouldUseEbanx={ shouldUseEbanx }
						getErrorMessagesForField={ getErrorMessagesForField }
						setFieldValue={ setFieldValue }
						getFieldValue={ getFieldValue }
					/>

					<FieldRow gap="4%" columnWidths="48% 48%">
						<LeftColumn>
							<CreditCardExpiryField
								handleStripeFieldChange={ handleStripeFieldChange }
								stripeElementStyle={ stripeElementStyle }
								shouldUseEbanx={ shouldUseEbanx }
								getErrorMessagesForField={ getErrorMessagesForField }
								setFieldValue={ setFieldValue }
								getFieldValue={ getFieldValue }
							/>
						</LeftColumn>
						<RightColumn>
							<CreditCardCvvField
								handleStripeFieldChange={ handleStripeFieldChange }
								stripeElementStyle={ stripeElementStyle }
								shouldUseEbanx={ shouldUseEbanx }
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
						shouldUseEbanx={ shouldUseEbanx }
						shouldShowTaxFields={ shouldShowTaxFields }
					/>
				) }
			</div>
			<div className="credit-card-fields__image">
				<PaymentMethodImage />
			</div>
		</div>
	);
}

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

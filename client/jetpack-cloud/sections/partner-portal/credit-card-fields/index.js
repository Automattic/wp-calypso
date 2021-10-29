/**
 * External dependencies
 */
import React, { useState } from 'react';
import { useTheme } from 'emotion-theming';
import { useTranslate } from 'i18n-calypso';
import {
	FormStatus,
	useEvents,
	useSelect,
	useDispatch,
	useFormStatus,
} from '@automattic/composite-checkout';
import { Field } from '@automattic/wpcom-checkout';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import {
	LeftColumn,
	RightColumn,
} from 'calypso/my-sites/checkout/composite-checkout/components/ie-fallback';
import CreditCardNumberField from './credit-card-number-field';
import CreditCardExpiryField from './credit-card-expiry-field';
import CreditCardCvvField from './credit-card-cvv-field';
import PaymentMethodImage from 'calypso/jetpack-cloud/sections/partner-portal/credit-card-fields/payment-method-image';
import CreditCardLoading from './credit-card-loading';

/**
 * Style dependencies
 */
import './style.scss';

export default function CreditCardFields() {
	const translate = useTranslate();
	const theme = useTheme();
	const onEvent = useEvents();
	// eslint-disable-next-line no-unused-vars
	const [ isStripeFullyLoaded, setIsStripeFullyLoaded ] = useState( false );
	const fields = useSelect( ( select ) => select( 'credit-card' ).getFields() );
	const getField = ( key ) => fields[ key ] || {};
	const getFieldValue = ( key ) => getField( key ).value ?? '';
	const getErrorMessagesForField = ( key ) => {
		const managedValue = getField( key );
		if ( managedValue?.isRequired && managedValue?.value === '' ) {
			return [ translate( 'This field is required.' ) ];
		}
		return managedValue.errors ?? [];
	};
	const { setFieldValue, changeBrand, setCardDataError, setCardDataComplete } = useDispatch(
		'credit-card'
	);

	const cardholderName = getField( 'cardholderName' );
	const cardholderNameErrorMessages = getErrorMessagesForField( 'cardholderName' ) || [];
	const cardholderNameErrorMessage = cardholderNameErrorMessages?.[ 0 ] || null;

	const cardholderEmail = getField( 'cardholderEmail' );
	const cardholderEmailErrorMessages = getErrorMessagesForField( 'cardholderEmail' ) || [];
	const cardholderEmailErrorMessage = cardholderEmailErrorMessages?.[ 0 ] || null;

	const cardholderPhone = getField( 'cardholderPhone' );
	const cardholderPhoneErrorMessages = getErrorMessagesForField( 'cardholderPhone' ) || [];
	const cardholderPhoneErrorMessage = cardholderPhoneErrorMessages?.[ 0 ] || null;

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

	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;

	return (
		<>
			{ ! isStripeFullyLoaded && <CreditCardLoading /> }

			<div
				className={ classnames( {
					'credit-card-fields': true,
					'credit-card-fields--is-loaded': isStripeFullyLoaded,
				} ) }
			>
				<div className="credit-card-fields__form">
					<Field
						id="cardholder-name"
						className="credit-card-fields__input-field"
						type="Text"
						autoComplete="cc-name"
						label={ translate( 'Name' ) }
						value={ cardholderName?.value ?? '' }
						onChange={ ( value ) => setFieldValue( 'cardholderName', value ) }
						isError={ !! cardholderNameErrorMessage }
						errorMessage={ cardholderNameErrorMessage }
						disabled={ isDisabled }
					/>

					<Field
						id="cardholder-email"
						className="credit-card-fields__input-field"
						type="Text"
						autoComplete="cc-email"
						label={ translate( 'Email' ) }
						value={ cardholderEmail?.value ?? '' }
						onChange={ ( value ) => setFieldValue( 'cardholderEmail', value ) }
						isError={ !! cardholderEmailErrorMessage }
						errorMessage={ cardholderEmailErrorMessage }
						disabled={ isDisabled }
					/>

					<Field
						id="cardholder-phone"
						className="credit-card-fields__input-field"
						type="Text"
						autoComplete="cc-phone"
						label={ translate( 'Phone' ) }
						value={ cardholderPhone?.value ?? '' }
						onChange={ ( value ) => setFieldValue( 'cardholderPhone', value ) }
						isError={ !! cardholderPhoneErrorMessage }
						errorMessage={ cardholderPhoneErrorMessage }
						disabled={ isDisabled }
					/>

					<div className="credit-card-fields__field-block">
						<CreditCardNumberField
							setIsStripeFullyLoaded={ setIsStripeFullyLoaded }
							handleStripeFieldChange={ handleStripeFieldChange }
							getErrorMessagesForField={ getErrorMessagesForField }
							setFieldValue={ setFieldValue }
							getFieldValue={ getFieldValue }
						/>

						<div className="credit-card-fields__field-row">
							<LeftColumn>
								<CreditCardExpiryField
									handleStripeFieldChange={ handleStripeFieldChange }
									getErrorMessagesForField={ getErrorMessagesForField }
									setFieldValue={ setFieldValue }
									getFieldValue={ getFieldValue }
								/>
							</LeftColumn>
							<RightColumn>
								<CreditCardCvvField
									handleStripeFieldChange={ handleStripeFieldChange }
									getErrorMessagesForField={ getErrorMessagesForField }
									setFieldValue={ setFieldValue }
									getFieldValue={ getFieldValue }
								/>
							</RightColumn>
						</div>
					</div>
				</div>
				<div className="credit-card-fields__image">
					<PaymentMethodImage />
				</div>
			</div>
		</>
	);
}

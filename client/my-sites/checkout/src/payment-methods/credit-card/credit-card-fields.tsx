import { isEnabled } from '@automattic/calypso-config';
import { FormStatus, useFormStatus } from '@automattic/composite-checkout';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useSelect, useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { Fragment, useState, useEffect } from 'react';
import { LeftColumn, RightColumn } from 'calypso/my-sites/checkout/src/components/ie-fallback';
import Spinner from 'calypso/my-sites/checkout/src/components/spinner';
import { useDispatch as useReduxDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import AssignToAllPaymentMethods from './assign-to-all-payment-methods';
import ContactFields from './contact-fields';
import CreditCardCvvField from './credit-card-cvv-field';
import CreditCardExpiryField from './credit-card-expiry-field';
import CreditCardLoading from './credit-card-loading';
import CreditCardNumberField from './credit-card-number-field';
import { FieldRow, CreditCardFieldsWrapper, CreditCardField } from './form-layout-components';
import { VgsCreditCardFields } from './vgs-credit-card-fields';
import type { WpcomCreditCardSelectors } from './store';
import type { CardFieldState, StripeFieldChangeInput } from './types';

const CreditCardFormFields = styled.div`
	position: relative;
`;

const LoadingIndicator = styled( Spinner )`
	position: absolute;
	right: 15px;
	top: 10px;

	.rtl & {
		right: auto;
		left: 15px;
	}
`;

export default function CreditCardFields( {
	shouldUseEbanx,
	shouldShowTaxFields,
	allowUseForAllSubscriptions,
}: {
	shouldUseEbanx?: boolean;
	shouldShowTaxFields?: boolean;
	allowUseForAllSubscriptions?: boolean;
} ) {
	const { __ } = useI18n();
	const theme = useTheme();
	const [ isStripeFullyLoaded, setIsStripeFullyLoaded ] = useState( false );
	const [ vgsFormError, setVgsFormError ] = useState< string | null >( null );

	// Check if VGS form should be used
	const isVgsEbanxEnabled = isEnabled( 'checkout/vgs-ebanx' );
	const shouldUseVgsForm = isVgsEbanxEnabled && shouldUseEbanx;
	const fields: CardFieldState = useSelect(
		( select ) => ( select( 'wpcom-credit-card' ) as WpcomCreditCardSelectors ).getFields(),
		[]
	);
	const useForAllSubscriptions: boolean = useSelect(
		( select ) =>
			( select( 'wpcom-credit-card' ) as WpcomCreditCardSelectors ).useForAllSubscriptions(),
		[]
	);

	const getField = ( key: string ) => fields[ key ] || {};
	const getFieldValue = ( key: string ) => getField( key ).value ?? '';
	const getErrorMessagesForField = ( key: string ) => {
		const managedValue = getField( key );
		return managedValue.errors ?? [];
	};
	const {
		setFieldValue,
		changeBrand,
		setCardDataError,
		setCardDataComplete,
		setUseForAllSubscriptions,
		setForBusinessUse,
	} = useDispatch( 'wpcom-credit-card' );
	const reduxDispatch = useReduxDispatch();

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

	const handleStripeFieldChange = ( input: StripeFieldChangeInput ) => {
		setCardDataComplete( input.elementType, input.complete );
		if ( input.elementType === 'cardNumber' ) {
			changeBrand( input.brand );
		}

		if ( input.error && input.error.message ) {
			reduxDispatch(
				recordTracksEvent( 'calypso_checkout_composite_stripe_field_invalid_error', {
					error_type: 'Stripe field error',
					error_field: input.elementType,
					error_message: input.error.message,
				} )
			);
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
			fontSize: '14px',
			color: theme.colors.textColor,
			fontFamily: theme.fonts.body,
			fontWeight: theme.weights.normal,
			'::placeholder': {
				color: theme.colors.placeHolderTextColor,
			},
			':disabled': {
				color: theme.colors.textColorDisabled,
			},
		},
		invalid: {
			color: theme.colors.textColor,
		},
	};

	const isLoaded = shouldShowContactFields ? true : isStripeFullyLoaded;

	// Render VGS form if enabled (let VgsCreditCardFields handle its own loading state)
	if ( shouldUseVgsForm && ! vgsFormError ) {
		return (
			<CreditCardFormFields className="vgs-credit-card-form-fields">
				<CreditCardFieldsWrapper isLoaded>
					<div className="credit-card-fields-inner-wrapper">
						<VgsCreditCardFields
							styles={ {
								input: stripeElementStyle.base,
							} }
							labels={ {
								cardholderName: __( 'Cardholder name', 'calypso' ),
								cardNumber: __( 'Card number', 'calypso' ),
								expiryDate: __( 'Expiry date', 'calypso' ),
								cvc: __( 'Security code', 'calypso' ),
							} }
							descriptions={ {
								cardholderName: __( "Enter your name as it's written on the card", 'calypso' ),
							} }
							placeholders={ {
								cardholderName: '',
								cardNumber: __( '•••• •••• •••• ••••', 'calypso' ),
								expiryDate: __( 'MM/YY', 'calypso' ),
								cvc: __( 'CVC', 'calypso' ),
							} }
							onVgsFormError={ setVgsFormError }
						/>

						{ shouldShowContactFields && (
							<ContactFields
								getFieldValue={ getFieldValue }
								setFieldValue={ setFieldValue }
								setForBusinessUse={ setForBusinessUse }
								getErrorMessagesForField={ getErrorMessagesForField }
								shouldUseEbanx={ shouldUseEbanx }
								shouldShowTaxFields={ shouldShowTaxFields }
							/>
						) }

						{ allowUseForAllSubscriptions && (
							<AssignToAllPaymentMethods
								isChecked={ useForAllSubscriptions }
								isDisabled={ isDisabled }
								onChange={ setUseForAllSubscriptions }
							/>
						) }
					</div>
				</CreditCardFieldsWrapper>
			</CreditCardFormFields>
		);
	}

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<CreditCardFormFields className="credit-card-form-fields">
			{ ! isLoaded && <LoadingFields /> }

			<CreditCardFieldsWrapper isLoaded={ isLoaded }>
				<div className="credit-card-fields-inner-wrapper">
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
							getFieldValue={ getFieldValue }
							setFieldValue={ setFieldValue }
							setForBusinessUse={ setForBusinessUse }
							getErrorMessagesForField={ getErrorMessagesForField }
							shouldUseEbanx={ shouldUseEbanx }
							shouldShowTaxFields={ shouldShowTaxFields }
						/>
					) }

					{ allowUseForAllSubscriptions && (
						<AssignToAllPaymentMethods
							isChecked={ useForAllSubscriptions }
							isDisabled={ isDisabled }
							onChange={ setUseForAllSubscriptions }
						/>
					) }
				</div>
			</CreditCardFieldsWrapper>
		</CreditCardFormFields>
	);
}

function LoadingFields() {
	return (
		<Fragment>
			<LoadingIndicator />
			<CreditCardLoading />
		</Fragment>
	);
}

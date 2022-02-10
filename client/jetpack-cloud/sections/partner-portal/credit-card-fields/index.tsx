import { FormStatus, useFormStatus } from '@automattic/composite-checkout';
import { Field } from '@automattic/wpcom-checkout';
import { StripeElementChangeEvent } from '@stripe/stripe-js';
import { useSelect, useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import { useState } from 'react';
import { useDispatch as useReduxDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import CreditCardElementField from './credit-card-element-field';
import CreditCardLoading from './credit-card-loading';
import SetAsPrimaryPaymentMethod from './set-as-primary-payment-method';

import './style.scss';

export default function CreditCardFields() {
	const { __ } = useI18n();
	const [ isStripeFullyLoaded, setIsStripeFullyLoaded ] = useState( false );
	const fields = useSelect( ( select ) => select( 'credit-card' ).getFields() );
	const useAsPrimaryPaymentMethod = useSelect( ( select ) =>
		select( 'credit-card' ).useAsPrimaryPaymentMethod()
	);
	const getField = ( key: string | number ) => fields[ key ] || {};
	const getFieldValue = ( key: string | number ) => getField( key ).value ?? '';
	const getErrorMessagesForField = ( key: string | number ) => {
		const managedValue = getField( key );
		return managedValue.errors ?? [];
	};
	const {
		setFieldValue,
		setCardDataError,
		setCardDataComplete,
		setUseAsPrimaryPaymentMethod,
	} = useDispatch( 'credit-card' );
	const reduxDispatch = useReduxDispatch();

	const cardholderName = getField( 'cardholderName' );
	const cardholderNameErrorMessages = getErrorMessagesForField( 'cardholderName' ) || [];
	const cardholderNameErrorMessage = cardholderNameErrorMessages.length
		? cardholderNameErrorMessages[ 0 ]
		: null;

	const handleStripeFieldChange = ( input: StripeElementChangeEvent ) => {
		setCardDataComplete( input.elementType, input.complete );

		if ( input.error && input.error.message ) {
			reduxDispatch(
				recordTracksEvent( 'calypso_partner_portal_stripe_field_invalid_error', {
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
				<Field
					id="cardholder-name"
					className="credit-card-fields__input-field"
					type="Text"
					autoComplete="cc-name"
					label={ __( 'Name' ) }
					value={ cardholderName?.value ?? '' }
					onChange={ ( value ) => setFieldValue( 'cardholderName', value ) }
					isError={ !! cardholderNameErrorMessage }
					errorMessage={ cardholderNameErrorMessage }
					disabled={ isDisabled }
				/>

				<CreditCardElementField
					setIsStripeFullyLoaded={ setIsStripeFullyLoaded }
					handleStripeFieldChange={ handleStripeFieldChange }
				/>

				<SetAsPrimaryPaymentMethod
					isChecked={ useAsPrimaryPaymentMethod }
					isDisabled={ isDisabled }
					onChange={ setUseAsPrimaryPaymentMethod }
				/>
			</div>
		</>
	);
}

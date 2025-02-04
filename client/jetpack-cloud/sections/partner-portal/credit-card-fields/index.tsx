import { isEnabled } from '@automattic/calypso-config';
import { FormStatus, useFormStatus } from '@automattic/composite-checkout';
import { Field } from '@automattic/wpcom-checkout';
import { useSelect, useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useState } from 'react';
import { useRecentPaymentMethodsQuery } from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import { useDispatch as useReduxDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { creditCardStore } from 'calypso/state/partner-portal/credit-card-form';
import CreditCardElementField from './credit-card-element-field';
import CreditCardLoading from './credit-card-loading';
import SetAsPrimaryPaymentMethod from './set-as-primary-payment-method';
import type { StoreState } from '@automattic/wpcom-checkout';
import type { StripeElementChangeEvent, StripeElementStyle } from '@stripe/stripe-js';

import './style.scss';

export default function CreditCardFields() {
	const { __ } = useI18n();
	const [ isStripeFullyLoaded, setIsStripeFullyLoaded ] = useState( false );
	const fields: StoreState< string > = useSelect(
		( select ) => select( creditCardStore ).getFields(),
		[]
	);
	const useAsPrimaryPaymentMethod: boolean = useSelect(
		( select ) => select( creditCardStore ).useAsPrimaryPaymentMethod(),
		[]
	);
	const getField = ( key: string | number ) => fields[ key ] || {};
	const getErrorMessagesForField = ( key: string | number ) => {
		const managedValue = getField( key );
		return managedValue.errors ?? [];
	};
	const { setFieldValue, setCardDataError, setCardDataComplete, setUseAsPrimaryPaymentMethod } =
		useDispatch( 'credit-card' );
	const reduxDispatch = useReduxDispatch();

	const cardholderName = getField( 'cardholderName' );
	const cardholderNameErrorMessages = getErrorMessagesForField( 'cardholderName' ) || [];
	const cardholderNameErrorMessage = cardholderNameErrorMessages.length
		? cardholderNameErrorMessages[ 0 ]
		: undefined;

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

	const stripeElementStyle: StripeElementStyle = {
		base: {
			color: '#2c3338',
		},
		invalid: {
			color: '#D63638',
		},
	};

	const { data: { items: paymentMethods } = [], isFetching: isFetchingPaymentMethods } =
		useRecentPaymentMethodsQuery();

	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;

	const isNewCardAdditionEnabled = isEnabled( 'jetpack/card-addition-improvements' );

	return (
		<>
			{ ! isStripeFullyLoaded && <CreditCardLoading /> }

			<div
				className={ clsx( 'credit-card-fields', {
					'credit-card-fields--is-loaded': isStripeFullyLoaded,
				} ) }
			>
				<Field
					id="cardholder-name"
					className="credit-card-fields__input-field"
					type="Text"
					autoComplete="cc-name"
					label={ isNewCardAdditionEnabled ? __( 'Name on card' ) : __( 'Name' ) }
					value={ cardholderName?.value ?? '' }
					onChange={ ( value ) => setFieldValue( 'cardholderName', value ) }
					isError={ !! cardholderNameErrorMessage }
					errorMessage={ cardholderNameErrorMessage }
					disabled={ isDisabled }
				/>

				<CreditCardElementField
					setIsStripeFullyLoaded={ setIsStripeFullyLoaded }
					handleStripeFieldChange={ handleStripeFieldChange }
					stripeElementStyle={ stripeElementStyle }
				/>

				<SetAsPrimaryPaymentMethod
					isChecked={ useAsPrimaryPaymentMethod || paymentMethods.length === 0 }
					isDisabled={ isFetchingPaymentMethods || isDisabled || paymentMethods.length === 0 }
					onChange={ setUseAsPrimaryPaymentMethod }
				/>
			</div>
		</>
	);
}

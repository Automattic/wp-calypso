import { useStripe } from '@automattic/calypso-stripe';
import { Button, FormStatus, useFormStatus } from '@automattic/composite-checkout';
import { useElements, CardNumberElement } from '@stripe/react-stripe-js';
import { useSelect } from '@wordpress/data';
import { useState, useEffect } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import debugFactory from 'debug';
import { useDispatch } from 'react-redux';
import { validatePaymentDetails } from 'calypso/lib/checkout/validation';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import { logStashEvent } from '../../lib/analytics';
import { actions, selectors } from './store';
import type { WpcomCreditCardSelectors } from './store';
import type { CardFieldState, CardStoreType } from './types';
import type { ProcessPayment } from '@automattic/composite-checkout';
import type { ReactNode } from 'react';

const debug = debugFactory( 'calypso:credit-card' );

export default function CreditCardPayButton( {
	disabled,
	onClick,
	store,
	shouldUseEbanx,
	submitButtonContent,
}: {
	disabled?: boolean;
	onClick?: ProcessPayment;
	store: CardStoreType;
	shouldUseEbanx?: boolean;
	submitButtonContent: ReactNode;
} ) {
	const { __ } = useI18n();
	const { stripeConfiguration, stripe } = useStripe();
	const fields: CardFieldState = useSelect(
		( select ) => ( select( 'wpcom-credit-card' ) as WpcomCreditCardSelectors ).getFields(),
		[]
	);

	const useForAllSubscriptions = useSelect(
		( select ) =>
			( select( 'wpcom-credit-card' ) as WpcomCreditCardSelectors ).useForAllSubscriptions(),
		[]
	);

	const useForBusiness = useSelect(
		( select ) => ( select( 'wpcom-credit-card' ) as WpcomCreditCardSelectors ).useForBusiness(),
		[]
	);

	const cardholderName = fields.cardholderName;
	const { formStatus } = useFormStatus();
	const paymentPartner = shouldUseEbanx ? 'ebanx' : 'stripe';
	const elements = useElements();
	const cardNumberElement = elements?.getElement( CardNumberElement ) ?? undefined;

	const [ displayFieldsError, setDisplayFieldsError ] = useState( '' );
	const reduxDispatch = useDispatch();
	useEffect( () => {
		if ( displayFieldsError ) {
			document.body.scrollTop = document.documentElement.scrollTop = 0;
			reduxDispatch( errorNotice( displayFieldsError, { ariaLive: 'assertive', role: 'alert' } ) );
			setDisplayFieldsError( '' );
		}
	}, [ displayFieldsError, reduxDispatch ] );
	// This must be typed as optional because it's injected by cloning the
	// element in CheckoutSubmitButton, but the uncloned element does not have
	// this prop yet.
	if ( ! onClick ) {
		throw new Error(
			'Missing onClick prop; CreditCardPayButton must be used as a payment button in CheckoutSubmitButton'
		);
	}

	return (
		<Button
			disabled={ disabled }
			onClick={ () => {
				if ( isCreditCardFormValid( store, paymentPartner, __, setDisplayFieldsError ) ) {
					if ( paymentPartner === 'stripe' ) {
						debug( 'submitting stripe payment' );
						if ( ! cardNumberElement ) {
							// This should never happen because they won't get
							// to this point if the credit card fields are not
							// filled-in (see isCreditCardFormValid) but it
							// seems to happen so let's tell the user
							// something.
							setDisplayFieldsError(
								__(
									'Something seems to be wrong with the credit card form. Please try again or contact support for help.'
								)
							);
							reduxDispatch(
								recordTracksEvent( 'calypso_checkout_card_missing_element', {
									error: 'No card number element found on page when submtting form.',
								} )
							);
							logStashEvent( 'calypso_checkout_card_missing_element', {
								error: 'No card number element found on page when submtting form.',
							} );
							return;
						}
						onClick( {
							stripe,
							name: cardholderName?.value,
							stripeConfiguration,
							cardNumberElement,
							paymentPartner,
							countryCode: fields?.countryCode?.value ?? '',
							postalCode: fields?.postalCode?.value ?? '',
							state: fields?.state?.value,
							city: fields?.city?.value,
							organization: fields?.organization?.value,
							address: fields?.address1?.value,
							useForAllSubscriptions,
							useForBusiness,
							eventSource: 'checkout',
						} );
						return;
					}
					if ( paymentPartner === 'ebanx' ) {
						debug( 'submitting ebanx payment' );
						onClick( {
							name: cardholderName?.value || '',
							countryCode: fields?.countryCode?.value || '',
							number: fields?.number?.value?.replace( /\s+/g, '' ) || '',
							cvv: fields?.cvv?.value || '',
							'expiration-date': fields[ 'expiration-date' ]?.value || '',
							state: fields?.state?.value || '',
							city: fields?.city?.value || '',
							postalCode: fields[ 'postal-code' ]?.value || '',
							address: fields[ 'address-1' ]?.value || '',
							streetNumber: fields[ 'street-number' ]?.value || '',
							phoneNumber: fields[ 'phone-number' ]?.value || '',
							document: fields?.document?.value || '', // Taxpayer Identification Number
							paymentPartner,
						} );
						return;
					}
					throw new Error(
						'Unrecognized payment partner in submit handler: "' + paymentPartner + '"'
					);
				}
			} }
			buttonType="primary"
			isBusy={ FormStatus.SUBMITTING === formStatus }
			fullWidth
		>
			{ submitButtonContent }
		</Button>
	);
}

function isCreditCardFormValid(
	store: CardStoreType,
	paymentPartner: string,
	__: ( value: string ) => string,
	setDisplayFieldsError: ( value: string ) => void
) {
	debug( 'validating credit card fields for partner', paymentPartner );

	function setFieldsError() {
		setDisplayFieldsError(
			__( 'Something seems to be missing — please fill out all the required fields.' )
		);
	}

	switch ( paymentPartner ) {
		case 'stripe': {
			const fields = selectors.getFields( store.getState() );
			const cardholderName = fields.cardholderName;
			if ( ! cardholderName?.value.length ) {
				// Touch the field so it displays a validation error
				store.dispatch( actions.setFieldValue( 'cardholderName', '' ) );
				store.dispatch( actions.setFieldError( 'cardholderName', __( 'This field is required' ) ) );
				setFieldsError();
			}
			const errors = selectors.getCardDataErrors( store.getState() );
			const incompleteFieldKeys = selectors.getIncompleteFieldKeys( store.getState() );
			const areThereErrors = Object.keys( errors ).some( ( errorKey ) => errors[ errorKey ] );

			if ( incompleteFieldKeys.length > 0 ) {
				// Show "this field is required" for each incomplete field
				incompleteFieldKeys.map( ( key ) =>
					store.dispatch( actions.setCardDataError( key, __( 'This field is required' ) ) )
				);
				setFieldsError();
			}
			if ( areThereErrors || ! cardholderName?.value.length || incompleteFieldKeys.length > 0 ) {
				debug( 'card info is not valid', { errors, incompleteFieldKeys, cardholderName } );

				return false;
			}
			return true;
		}

		case 'ebanx': {
			// Touch fields so that we show errors
			store.dispatch( actions.touchAllFields() );
			let isValid = true;

			const rawState = selectors.getFields( store.getState() );
			const cardholderName = rawState.cardholderName;
			const numberWithoutSpaces = {
				value: rawState?.number?.value?.replace( /\s+/g, '' ),
			}; // the validator package we're using requires this
			const paymentDetailsData = {
				...rawState,
				country: rawState.countryCode,
				name: cardholderName,
				number: numberWithoutSpaces,
			};
			const validationResults = validatePaymentDetails(
				Object.entries( paymentDetailsData ).reduce< Record< string, string > >(
					( accum, [ key, managedValue ] ) => {
						accum[ key ] = managedValue?.value;
						return accum;
					},
					{}
				),
				'ebanx'
			);
			Object.entries( validationResults.errors ).map( ( [ key, errors ] ) => {
				errors.map( ( error ) => {
					isValid = false;
					store.dispatch( actions.setFieldError( key, error ) );
				} );
			} );
			debug( 'ebanx card details validation results: ', validationResults );
			return isValid;
		}

		default: {
			throw new RangeError( 'Unexpected payment partner "' + paymentPartner + '"' );
		}
	}
}

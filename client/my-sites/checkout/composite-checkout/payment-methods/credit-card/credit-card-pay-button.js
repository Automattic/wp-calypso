/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import debugFactory from 'debug';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@automattic/react-i18n';
import {
	Button,
	usePaymentProcessor,
	useTransactionStatus,
	useLineItems,
	useEvents,
	useFormStatus,
	useSelect,
} from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import { showStripeModalAuth } from 'lib/stripe';
import { validatePaymentDetails } from 'lib/checkout/validation';

const debug = debugFactory( 'calypso:composite-checkout:credit-card' );

export default function CreditCardPayButton( { disabled, store, stripe, stripeConfiguration } ) {
	const { __ } = useI18n();
	const [ items, total ] = useLineItems();
	const cardholderName = useSelect( ( select ) => select( 'credit-card' ).getCardholderName() );
	const paymentPartner = useSelect( ( select ) => select( 'credit-card' ).getPaymentPartner() );
	const fields = useSelect( ( select ) => select( 'credit-card' ).getFields() );
	const { formStatus } = useFormStatus();
	const {
		transactionStatus,
		setTransactionComplete,
		setTransactionAuthorizing,
		setTransactionRedirecting,
		setTransactionError,
		setTransactionPending,
	} = useTransactionStatus();
	const submitTransaction = usePaymentProcessor( 'card' );
	const onEvent = useEvents();

	useShowStripeModalAuth( transactionStatus === 'authorizing', stripeConfiguration );

	return (
		<Button
			disabled={ disabled }
			onClick={ () => {
				if ( isCreditCardFormValid( store, __ ) ) {
					if ( paymentPartner === 'stripe' ) {
						debug( 'submitting stripe payment' );
						setTransactionPending();
						onEvent( { type: 'STRIPE_TRANSACTION_BEGIN' } );
						submitTransaction( {
							stripe,
							name: cardholderName?.value,
							items,
							total,
							stripeConfiguration,
							paymentPartner,
						} )
							.then( ( stripeResponse ) => {
								if ( stripeResponse?.message?.payment_intent_client_secret ) {
									debug( 'stripe transaction requires auth' );
									setTransactionAuthorizing( stripeResponse );
									return;
								}
								if ( stripeResponse?.redirect_url ) {
									debug( 'stripe transaction requires redirect' );
									setTransactionRedirecting( stripeResponse.redirect_url );
									return;
								}
								debug( 'stripe transaction is successful' );
								setTransactionComplete();
							} )
							.catch( ( error ) => {
								setTransactionError( error.message );
							} );
						return;
					}
					if ( paymentPartner === 'ebanx' ) {
						debug( 'submitting ebanx payment' );
						setTransactionPending();
						onEvent( { type: 'EBANX_TRANSACTION_BEGIN' } );
						submitTransaction( {
							name: cardholderName?.value || '',
							countryCode: fields?.countryCode?.value || '',
							number: fields?.number?.value || '',
							cvv: fields?.cvv?.value || '',
							'expiration-date': fields[ 'expiration-date' ]?.value || '',
							state: fields?.state?.value || '',
							city: fields?.city?.value || '',
							postalCode: fields[ 'postal-code' ]?.value || '',
							address: fields[ 'address-1' ]?.value || '',
							streetNumber: fields[ 'street-number' ]?.value || '',
							phoneNumber: fields[ 'phone-number' ]?.value || '',
							document: fields?.document?.value || '', // Taxpayer Identification Number
							items,
							total,
							paymentPartner,
						} )
							.then( ( ebanxResponse ) => {
								// TODO
								debug( 'ebanx transaction is successful', ebanxResponse );
								setTransactionComplete();
							} )
							.catch( ( error ) => {
								// TODO
								debug( 'ebanx transaction error', error );
								setTransactionError( error );
							} );
						return;
					}
					if ( paymentPartner === 'dlocal' ) {
						// TODO
						throw new Error( 'dlocal handler not implemented' );
					}
					throw new Error(
						'Unrecognized payment partner in submit handler: "' + paymentPartner + '"'
					);
				}
			} }
			buttonType="primary"
			isBusy={ 'submitting' === formStatus }
			fullWidth
		>
			<ButtonContents formStatus={ formStatus } total={ total } />
		</Button>
	);
}

function ButtonContents( { formStatus, total } ) {
	const { __ } = useI18n();
	if ( formStatus === 'submitting' ) {
		return __( 'Processing…' );
	}
	if ( formStatus === 'ready' ) {
		return sprintf( __( 'Pay %s' ), total.amount.displayValue );
	}
	return __( 'Please wait…' );
}

function useShowStripeModalAuth( shouldShowModal, stripeConfiguration ) {
	const onEvent = useEvents();
	const {
		transactionLastResponse,
		resetTransaction,
		setTransactionComplete,
		setTransactionError,
	} = useTransactionStatus();

	useEffect( () => {
		let isSubscribed = true;

		if ( shouldShowModal ) {
			debug( 'showing stripe authentication modal' );
			onEvent( { type: 'SHOW_MODAL_AUTHORIZATION' } );
			showStripeModalAuth( {
				stripeConfiguration,
				response: transactionLastResponse,
			} )
				.then( ( authenticationResponse ) => {
					debug( 'stripe auth is complete', authenticationResponse );
					isSubscribed && setTransactionComplete();
				} )
				.catch( ( error ) => {
					isSubscribed && setTransactionError( error.message );
				} );
		}

		return () => ( isSubscribed = false );
	}, [
		shouldShowModal,
		onEvent,
		setTransactionComplete,
		resetTransaction,
		transactionLastResponse,
		setTransactionError,
		stripeConfiguration,
	] );
}

function isCreditCardFormValid( store, __ ) {
	debug( 'validating credit card fields' );
	const paymentPartner = store.selectors.getPaymentPartner( store.getState() );

	switch ( paymentPartner ) {
		case 'stripe': {
			const cardholderName = store.selectors.getCardholderName( store.getState() );
			if ( ! cardholderName?.value.length ) {
				// Touch the field so it displays a validation error
				store.dispatch( store.actions.changeCardholderName( '' ) );
			}
			const errors = store.selectors.getCardDataErrors( store.getState() );
			const incompleteFieldKeys = store.selectors.getIncompleteFieldKeys( store.getState() );
			const areThereErrors = Object.keys( errors ).some( ( errorKey ) => errors[ errorKey ] );

			if ( incompleteFieldKeys.length > 0 ) {
				// Show "this field is required" for each incomplete field
				incompleteFieldKeys.map( ( key ) =>
					store.dispatch( store.actions.setCardDataError( key, __( 'This field is required' ) ) )
				);
			}
			if ( areThereErrors || ! cardholderName?.value.length || incompleteFieldKeys.length > 0 ) {
				return false;
			}
			return true;
		}

		case 'ebanx': {
			// Touch fields so that we show errors
			store.dispatch( store.actions.touchAllFields() );
			let isValid = true;

			const rawState = store.selectors.getFields( store.getState() );
			const cardholderName = store.selectors.getCardholderName( store.getState() );
			const validationResults = validatePaymentDetails(
				Object.entries( {
					...rawState,
					country: rawState.countryCode,
					name: cardholderName,
				} ).reduce( ( accum, [ key, managedValue ] ) => {
					accum[ key ] = managedValue?.value;
					return accum;
				}, {} )
			);
			Object.entries( validationResults.errors ).map( ( [ key, errors ] ) => {
				errors.map( ( error ) => {
					isValid = false;
					store.dispatch( store.actions.setFieldError( key, error ) );
					// TODO: set the error on cardholderName (it's not in the fields object)
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

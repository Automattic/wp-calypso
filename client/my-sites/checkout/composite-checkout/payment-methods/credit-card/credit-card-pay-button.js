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
	renderDisplayValueMarkdown,
	useEvents,
	useFormStatus,
	useSelect,
} from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import { showStripeModalAuth } from 'lib/stripe';

const debug = debugFactory( 'calypso:composite-checkout:credit-card' );

export default function CreditCardPayButton( { disabled, store, stripe, stripeConfiguration } ) {
	const { __ } = useI18n();
	const [ items, total ] = useLineItems();
	const cardholderName = useSelect( ( select ) => select( 'credit-card' ).getCardholderName() );
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
					debug( 'submitting stripe payment' );
					setTransactionPending();
					onEvent( { type: 'STRIPE_TRANSACTION_BEGIN' } );
					submitTransaction( {
						stripe,
						name: cardholderName?.value,
						items,
						total,
						stripeConfiguration,
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
		return sprintf( __( 'Pay %s' ), renderDisplayValueMarkdown( total.amount.displayValue ) );
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
	const cardholderName = store.selectors.getCardholderName( store.getState() );
	const errors = store.selectors.getCardDataErrors( store.getState() );
	const incompleteFieldKeys = store.selectors.getIncompleteFieldKeys( store.getState() );
	const areThereErrors = Object.keys( errors ).some( ( errorKey ) => errors[ errorKey ] );
	if ( ! cardholderName?.value.length ) {
		// Touch the field so it displays a validation error
		store.dispatch( store.actions.changeCardholderName( '' ) );
	}
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

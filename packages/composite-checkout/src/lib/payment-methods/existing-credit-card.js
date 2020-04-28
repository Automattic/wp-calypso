/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import Button from '../../components/button';
import {
	useSelect,
	useDispatch,
	useMessages,
	useLineItems,
	useEvents,
	renderDisplayValueMarkdown,
} from '../../public-api';
import { sprintf, useLocalize } from '../localize';
import { SummaryLine, SummaryDetails } from '../styled-components/summary-details';
import { useFormStatus } from '../form-status';
import PaymentLogo from './payment-logo.js';
import { showStripeModalAuth } from '../stripe';

const debug = debugFactory( 'composite-checkout:existing-card-payment-method' );

export function createExistingCardMethod( {
	getCountry,
	getPostalCode,
	getSubdivisionCode,
	registerStore,
	submitTransaction,
	id,
	cardholderName,
	cardExpiry,
	brand,
	last4,
	stripeConfiguration,
} ) {
	debug( 'creating a new existing credit card payment method', {
		id,
		cardholderName,
		cardExpiry,
		brand,
		last4,
	} );

	const actions = {
		*beginCardTransaction( payload ) {
			let response;
			try {
				response = yield {
					type: 'EXISTING_CARD_TRANSACTION_BEGIN',
					payload: {
						...payload,
						name: cardholderName,
						country: getCountry(),
						postalCode: getPostalCode(),
						subdivisionCode: getSubdivisionCode(),
					},
				};
				debug( 'existing card transaction complete', response );
			} catch ( error ) {
				debug( 'existing card transaction had an error', error.message );
				return { type: 'EXISTING_CARD_TRANSACTION_ERROR', payload: error.message };
			}
			if ( response?.message?.payment_intent_client_secret ) {
				debug( 'existing card transaction requires auth' );
				return { type: 'EXISTING_CARD_TRANSACTION_AUTH', payload: response };
			}
			if ( response?.redirect_url ) {
				debug( 'existing card transaction requires redirect' );
				return { type: 'EXISTING_CARD_TRANSACTION_REDIRECT', payload: response };
			}
			debug( 'existing card transaction requires is successful' );
			return { type: 'EXISTING_CARD_TRANSACTION_END', payload: response };
		},
		setTransactionComplete( payload ) {
			debug( 'transaction is successful' );
			return { type: 'EXISTING_CARD_TRANSACTION_END', payload };
		},
		resetTransaction() {
			debug( 'resetting transaction' );
			return { type: 'EXISTING_CARD_TRANSACTION_RESET' };
		},
	};

	const selectors = {
		getTransactionError( state ) {
			return state.transactionError;
		},
		getTransactionStatus( state ) {
			return state.transactionStatus;
		},
		getTransactionAuthData( state ) {
			return state.transactionAuthData;
		},
		getRedirectUrl( state ) {
			return state.redirectUrl;
		},
	};

	registerStore( `existing-card-${ id }`, {
		reducer(
			state = {
				transactionStatus: null,
				transactionError: null,
				transactionAuthData: null,
			},
			action
		) {
			switch ( action.type ) {
				case 'EXISTING_CARD_TRANSACTION_RESET':
					return {
						...state,
						transactionStatus: null,
					};
				case 'EXISTING_CARD_TRANSACTION_END':
					return {
						...state,
						transactionStatus: 'complete',
					};
				case 'EXISTING_CARD_TRANSACTION_ERROR':
					return {
						...state,
						transactionStatus: 'error',
						transactionError: action.payload,
					};
				case 'EXISTING_CARD_TRANSACTION_AUTH':
					return {
						...state,
						transactionStatus: 'auth',
						transactionAuthData: action.payload,
					};
				case 'EXISTING_CARD_TRANSACTION_REDIRECT':
					return {
						...state,
						transactionStatus: 'redirect',
						redirectUrl: action.payload.redirect_url,
					};
			}
			return state;
		},
		actions,
		selectors,
		controls: {
			EXISTING_CARD_TRANSACTION_BEGIN( action ) {
				return submitTransaction( action.payload );
			},
		},
	} );

	return {
		id,
		label: (
			<ExistingCardLabel
				last4={ last4 }
				cardExpiry={ cardExpiry }
				cardholderName={ cardholderName }
				brand={ brand }
			/>
		),
		submitButton: <ExistingCardPayButton id={ id } stripeConfiguration={ stripeConfiguration } />,
		inactiveContent: (
			<ExistingCardSummary
				cardholderName={ cardholderName }
				cardExpiry={ cardExpiry }
				brand={ brand }
				last4={ last4 }
			/>
		),
		getAriaLabel: () => `${ brand } ${ last4 } ${ cardholderName }`,
	};
}

function formatDate( cardExpiry ) {
	const expiryDate = new Date( cardExpiry );
	const formattedDate = expiryDate.toLocaleDateString( 'en-US', {
		month: '2-digit',
		year: '2-digit',
	} );

	return formattedDate;
}

export function ExistingCardLabel( { last4, cardExpiry, cardholderName, brand } ) {
	const localize = useLocalize();

	return (
		<React.Fragment>
			<div>
				<CardHolderName>{ cardholderName }</CardHolderName>
				<CardDetails>**** { last4 }</CardDetails>
				{ `${ localize( 'Expiry:' ) }  ${ formatDate( cardExpiry ) }` }
			</div>
			<div>
				<PaymentLogo brand={ brand } isSummary={ true } />
			</div>
		</React.Fragment>
	);
}

const CardHolderName = styled.span`
	display: block;
`;

function ExistingCardPayButton( { disabled, id, stripeConfiguration } ) {
	const localize = useLocalize();
	const [ items, total ] = useLineItems();
	const { showErrorMessage, showInfoMessage } = useMessages();
	const transactionStatus = useSelect( ( select ) =>
		select( `existing-card-${ id }` ).getTransactionStatus()
	);
	const transactionError = useSelect( ( select ) =>
		select( `existing-card-${ id }` ).getTransactionError()
	);
	const transactionAuthData = useSelect( ( select ) =>
		select( `existing-card-${ id }` ).getTransactionAuthData()
	);
	const redirectUrl = useSelect( ( select ) => select( `existing-card-${ id }` ).getRedirectUrl() );
	const { beginCardTransaction, setTransactionComplete, resetTransaction } = useDispatch(
		`existing-card-${ id }`
	);
	const { formStatus, setFormReady, setFormComplete, setFormSubmitting } = useFormStatus();
	const onEvent = useEvents();

	useEffect( () => {
		if ( transactionStatus === 'error' ) {
			showErrorMessage(
				transactionError || localize( 'An error occurred during the transaction' )
			);
			onEvent( { type: 'EXISTING_CARD_TRANSACTION_ERROR', payload: transactionError || '' } );
			setFormReady();
		}
		if ( transactionStatus === 'complete' ) {
			debug( 'existing card transaction is complete' );
			setFormComplete();
		}
		if ( transactionStatus === 'redirect' ) {
			debug( 'redirecting' );
			showInfoMessage( localize( 'Redirecting...' ) );
			window.location = redirectUrl;
		}
	}, [
		onEvent,
		redirectUrl,
		setFormReady,
		setFormComplete,
		showErrorMessage,
		showInfoMessage,
		transactionStatus,
		transactionError,
		transactionAuthData,
		localize,
	] );

	useEffect( () => {
		let isSubscribed = true;

		if ( transactionStatus === 'auth' ) {
			debug( 'showing auth' );
			showStripeModalAuth( {
				stripeConfiguration,
				response: transactionAuthData,
			} )
				.then( ( authenticationResponse ) => {
					debug( 'auth is complete', authenticationResponse );
					isSubscribed && setTransactionComplete( authenticationResponse );
				} )
				.catch( ( error ) => {
					debug( 'showing error for auth', error.message );
					showErrorMessage(
						localize( 'Authorization failed for that card. Please try a different payment method.' )
					);
					onEvent( { type: 'EXISTING_CARD_TRANSACTION_ERROR', payload: error } );
					isSubscribed && resetTransaction();
					isSubscribed && setFormReady();
				} );
		}

		return () => ( isSubscribed = false );
	}, [
		onEvent,
		resetTransaction,
		setTransactionComplete,
		setFormReady,
		showInfoMessage,
		showErrorMessage,
		transactionStatus,
		transactionAuthData,
		stripeConfiguration,
		localize,
	] );

	return (
		<Button
			disabled={ disabled }
			onClick={ () =>
				submitExistingCardPayment( {
					id,
					items,
					total,
					showErrorMessage,
					beginCardTransaction,
					setFormSubmitting,
					resetTransaction,
					onEvent,
				} )
			}
			buttonState={ disabled ? 'disabled' : 'primary' }
			isBusy={ 'submitting' === formStatus }
			fullWidth
		>
			<ButtonContents formStatus={ formStatus } total={ total } />
		</Button>
	);
}

function ButtonContents( { formStatus, total } ) {
	const localize = useLocalize();
	if ( formStatus === 'submitting' ) {
		return localize( 'Processing…' );
	}
	if ( formStatus === 'ready' ) {
		return sprintf( localize( 'Pay %s' ), renderDisplayValueMarkdown( total.amount.displayValue ) );
	}
	return localize( 'Please wait…' );
}

function ExistingCardSummary( { cardholderName, cardExpiry, brand, last4 } ) {
	const localize = useLocalize();

	return (
		<SummaryDetails>
			<SummaryLine>{ cardholderName }</SummaryLine>
			<SummaryLine>
				<PaymentLogo brand={ brand } isSummary={ true } />
				<CardDetails>**** { last4 }</CardDetails>
				{ `${ localize( 'Expiry:' ) } ${ formatDate( cardExpiry ) }` }
			</SummaryLine>
		</SummaryDetails>
	);
}

const CardDetails = styled.span`
	margin-right: 8px;
`;

async function submitExistingCardPayment( {
	id,
	items,
	total,
	showErrorMessage,
	beginCardTransaction,
	setFormSubmitting,
	setFormReady,
	resetTransaction,
	onEvent,
} ) {
	debug( 'submitting existing card payment with the id', id );
	try {
		onEvent( { type: 'EXISTING_CARD_TRANSACTION_BEGIN' } );
		setFormSubmitting();
		beginCardTransaction( {
			items,
			total,
		} );
	} catch ( error ) {
		resetTransaction();
		setFormReady();
		onEvent( { type: 'EXISTING_CARD_TRANSACTION_ERROR', payload: String( error.message ) } );
		showErrorMessage( error.message );
		return;
	}
}

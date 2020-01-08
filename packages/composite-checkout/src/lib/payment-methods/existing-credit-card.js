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
	renderDisplayValueMarkdown,
} from '../../public-api';
import { sprintf, useLocalize } from '../localize';
import { SummaryLine, SummaryDetails } from '../styled-components/summary-details';
import { useFormStatus } from '../form-status';
import PaymentLogo from './payment-logo.js';

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
				debug( 'existing card transaction had an error', error );
				return { type: 'EXISTING_CARD_TRANSACTION_ERROR', payload: error };
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
		submitButton: <ExistingCardPayButton id={ id } />,
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

function ExistingCardPayButton( { disabled, id } ) {
	const localize = useLocalize();
	const [ items, total ] = useLineItems();
	const { showErrorMessage } = useMessages();
	const transactionStatus = useSelect( select =>
		select( `existing-card-${ id }` ).getTransactionStatus()
	);
	const transactionError = useSelect( select =>
		select( `existing-card-${ id }` ).getTransactionError()
	);
	const transactionAuthData = useSelect( select =>
		select( `existing-card-${ id }` ).getTransactionAuthData()
	);
	const { beginCardTransaction } = useDispatch( `existing-card-${ id }` );
	const { formStatus, setFormReady, setFormComplete, setFormSubmitting } = useFormStatus();

	useEffect( () => {
		if ( transactionStatus === 'error' ) {
			showErrorMessage(
				transactionError || localize( 'An error occurred during the transaction' )
			);
			setFormReady();
		}
		if ( transactionStatus === 'complete' ) {
			debug( 'existing card transaction is complete' );
			setFormComplete();
		}
		if ( transactionStatus === 'redirect' ) {
			// TODO: notify user that we are going to redirect
		}
	}, [
		setFormReady,
		setFormComplete,
		showErrorMessage,
		transactionStatus,
		transactionError,
		transactionAuthData,
		localize,
	] );

	const buttonString =
		formStatus === 'submitting'
			? localize( 'Processing...' )
			: sprintf( localize( 'Pay %s' ), renderDisplayValueMarkdown( total.amount.displayValue ) );
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
				} )
			}
			buttonState={ disabled ? 'disabled' : 'primary' }
			fullWidth
		>
			{ buttonString }
		</Button>
	);
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
} ) {
	debug( 'submitting existing card payment with the id', id );
	try {
		setFormSubmitting();
		beginCardTransaction( {
			items,
			total,
		} );
	} catch ( error ) {
		setFormReady();
		showErrorMessage( error );
		return;
	}
}

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
	useMessages,
	useLineItems,
	useEvents,
	renderDisplayValueMarkdown,
	useTransactionStatus,
	usePaymentProcessor,
} from '../../public-api';
import { sprintf, useLocalize } from '../localize';
import { SummaryLine, SummaryDetails } from '../styled-components/summary-details';
import { useFormStatus } from '../form-status';
import PaymentLogo from './payment-logo.js';
import { showStripeModalAuth } from '../stripe';

const debug = debugFactory( 'composite-checkout:existing-card-payment-method' );

export function createExistingCardMethod( {
	id,
	cardholderName,
	cardExpiry,
	brand,
	last4,
	storedDetailsId,
	paymentMethodToken,
	paymentPartnerProcessorId,
	stripeConfiguration,
} ) {
	debug( 'creating a new existing credit card payment method', {
		id,
		cardholderName,
		cardExpiry,
		brand,
		last4,
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
		submitButton: (
			<ExistingCardPayButton
				stripeConfiguration={ stripeConfiguration }
				cardholderName={ cardholderName }
				storedDetailsId={ storedDetailsId }
				paymentMethodToken={ paymentMethodToken }
				paymentPartnerProcessorId={ paymentPartnerProcessorId }
			/>
		),
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

function ExistingCardPayButton( {
	disabled,
	stripeConfiguration,
	cardholderName,
	storedDetailsId,
	paymentMethodToken,
	paymentPartnerProcessorId,
} ) {
	const localize = useLocalize();
	const [ items, total ] = useLineItems();
	const { showErrorMessage, showInfoMessage } = useMessages();
	const {
		transactionStatus,
		transactionLastResponse,
		setTransactionComplete,
		resetTransaction,
		setTransactionRedirecting,
		setTransactionPending,
		setTransactionAuthorizing,
		setTransactionError,
	} = useTransactionStatus();
	const submitTransaction = usePaymentProcessor( 'existing-card' );
	const { formStatus } = useFormStatus();
	const onEvent = useEvents();

	useEffect( () => {
		let isSubscribed = true;

		if ( transactionStatus === 'auth' ) {
			debug( 'showing auth' );
			showStripeModalAuth( {
				stripeConfiguration,
				response: transactionLastResponse,
			} )
				.then( ( authenticationResponse ) => {
					debug( 'auth is complete', authenticationResponse );
					isSubscribed && setTransactionComplete( authenticationResponse );
				} )
				.catch( ( error ) => {
					isSubscribed && setTransactionError( error.message );
				} );
		}

		return () => ( isSubscribed = false );
	}, [
		onEvent,
		resetTransaction,
		setTransactionComplete,
		setTransactionError,
		showInfoMessage,
		showErrorMessage,
		transactionStatus,
		stripeConfiguration,
		transactionLastResponse,
		localize,
	] );

	return (
		<Button
			disabled={ disabled }
			onClick={ () => {
				debug( 'submitting existing card payment' );
				onEvent( { type: 'EXISTING_CARD_TRANSACTION_BEGIN' } );
				setTransactionPending();
				submitTransaction( {
					items,
					total,
					name: cardholderName,
					storedDetailsId,
					paymentMethodToken,
					paymentPartnerProcessorId,
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
			} }
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

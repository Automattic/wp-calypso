/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import debugFactory from 'debug';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import Button from '../../components/button';
import {
	useMessages,
	useLineItems,
	useEvents,
	useTransactionStatus,
	usePaymentProcessor,
} from '../../public-api';
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
	const { __, _x } = useI18n();

	const maskedCardDetails = sprintf( _x( '**** %s', 'Masked credit card number' ), last4 );

	return (
		<React.Fragment>
			<div>
				<CardHolderName>{ cardholderName }</CardHolderName>
				<CardDetails>{ maskedCardDetails }</CardDetails>
				<span>{ `${ __( 'Expiry:' ) } ${ formatDate( cardExpiry ) }` }</span>
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

		if ( transactionStatus === 'authorizing' ) {
			debug( 'showing auth' );
			onEvent( { type: 'SHOW_MODAL_AUTHORIZATION' } );
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

function ExistingCardSummary( { cardholderName, cardExpiry, brand, last4 } ) {
	const { __, _x } = useI18n();

	const maskedCardDetails = sprintf( _x( '**** %s', 'Masked credit card number' ), last4 );

	return (
		<SummaryDetails>
			<SummaryLine>{ cardholderName }</SummaryLine>
			<SummaryLine>
				<PaymentLogo brand={ brand } isSummary={ true } />
				<CardDetails>{ maskedCardDetails }</CardDetails>
				<span>{ `${ __( 'Expiry:' ) } ${ formatDate( cardExpiry ) }` }</span>
			</SummaryLine>
		</SummaryDetails>
	);
}

const CardDetails = styled.span`
	display: inline-block;
	margin-right: 8px;

	.rtl & {
		margin-right: 0;
		margin-left: 8px;
	}
`;

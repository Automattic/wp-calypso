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
import {
	VisaLogo,
	AmexLogo,
	MastercardLogo,
	JcbLogo,
	DinersLogo,
	UnionpayLogo,
	DiscoverLogo,
} from '../../components/payment-logos';
import { SummaryLine, SummaryDetails } from '../styled-components/summary-details';
import { useFormStatus } from '../form-status';

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
			<ExistingCardSummary cardholderName={ cardholderName } brand={ brand } last4={ last4 } />
		),
		getAriaLabel: () => `${ brand } ${ last4 } ${ cardholderName }`,
	};
}

export function ExistingCardLabel( { last4, cardExpiry, cardholderName, brand } ) {
	return (
		<React.Fragment>
			<div>
				<span>{ brand.toUpperCase() }</span>
				<span>****{ last4 }</span>
			</div>
			<div>
				<span>{ cardholderName }</span>
				<span>{ cardExpiry }</span>
			</div>
		</React.Fragment>
	);
}

const LockIconGraphic = styled( LockIcon )`
	display: block;
	position: absolute;
	right: 10px;
	top: 14px;
	width: 20px;
	height: 20px;
`;

function CardFieldIcon( { brand, isSummary } ) {
	let cardFieldIcon = null;

	switch ( brand ) {
		case 'visa':
			cardFieldIcon = (
				<BrandLogo isSummary={ isSummary }>
					<VisaLogo />
				</BrandLogo>
			);
			break;
		case 'mastercard':
			cardFieldIcon = (
				<SmallBrandLogo isSummary={ isSummary }>
					<MastercardLogo />
				</SmallBrandLogo>
			);
			break;
		case 'amex':
			cardFieldIcon = (
				<BrandLogo isSummary={ isSummary }>
					<AmexLogo />
				</BrandLogo>
			);
			break;
		case 'jcb':
			cardFieldIcon = (
				<SmallBrandLogo isSummary={ isSummary }>
					<JcbLogo />
				</SmallBrandLogo>
			);
			break;
		case 'diners':
			cardFieldIcon = (
				<SmallBrandLogo isSummary={ isSummary }>
					<DinersLogo />
				</SmallBrandLogo>
			);
			break;
		case 'unionpay':
			cardFieldIcon = (
				<SmallBrandLogo isSummary={ isSummary }>
					<UnionpayLogo />
				</SmallBrandLogo>
			);
			break;
		case 'discover':
			cardFieldIcon = (
				<BrandLogo isSummary={ isSummary }>
					<DiscoverLogo />
				</BrandLogo>
			);
			break;
		default:
			cardFieldIcon = brand === 'unknown' && isSummary ? null : <LockIconGraphic />;
	}

	return cardFieldIcon;
}

const BrandLogo = styled.span`
	display: ${props => ( props.isSummary ? 'inline-block' : 'block' )};
	position: ${props => ( props.isSummary ? 'relative' : 'absolute' )};
	top: ${props => ( props.isSummary ? '0' : '15px' )};
	right: ${props => ( props.isSummary ? '0' : '10px' )};
	transform: translateY( ${props => ( props.isSummary ? '4px' : '0' )} );
`;

const SmallBrandLogo = styled( BrandLogo )`
	transform: translate( ${props => ( props.isSummary ? '-10px, 4px' : '10px, 0' )} );
`;

function LockIcon( { className } ) {
	return (
		<svg
			className={ className }
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			aria-hidden="true"
			focusable="false"
		>
			<g fill="none">
				<path d="M0 0h24v24H0V0z" />
				<path opacity=".87" d="M0 0h24v24H0V0z" />
			</g>
			<path
				fill="#8E9196"
				d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"
			/>
		</svg>
	);
}

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

function ExistingCardSummary( { cardholderName, brand, last4 } ) {
	return (
		<SummaryDetails>
			<SummaryLine>{ cardholderName }</SummaryLine>
			<SummaryLine>
				{ brand !== 'unknown' && `****${ last4 }` }{ ' ' }
				<CardFieldIcon brand={ brand } isSummary={ true } />
			</SummaryLine>
		</SummaryDetails>
	);
}

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

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
import { useStripe, createStripePaymentMethod, confirmStripePaymentIntent } from '../stripe';
import {
	useSelect,
	useDispatch,
	useMessages,
	useLineItems,
	useCheckoutRedirects,
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
	getSiteId,
	getCountry,
	getPostalCode,
	getPhoneNumber,
	getSubdivisionCode,
	getDomainDetails,
	registerStore,
	fetchStripeConfiguration,
	sendStripeTransaction,
	id,
	labelText,
} ) {
	debug( 'creating a new existing credit card payment method' );
	const actions = {
		changeBrand( payload ) {
			return { type: 'BRAND_SET', payload };
		},
		setCardDataError( type, message ) {
			return { type: 'CARD_DATA_ERROR_SET', payload: { type, message } };
		},
		setCardDataComplete( type, complete ) {
			return { type: 'CARD_DATA_COMPLETE_SET', payload: { type, complete } };
		},
		changeCardholderName( payload ) {
			return { type: 'CARDHOLDER_NAME_SET', payload };
		},
		setStripeError( payload ) {
			return { type: 'STRIPE_TRANSACTION_ERROR', payload };
		},
		*getConfiguration( payload ) {
			let configuration;
			try {
				configuration = yield { type: 'STRIPE_CONFIGURATION_FETCH', payload };
			} catch ( error ) {
				return { type: 'STRIPE_TRANSACTION_ERROR', payload: error };
			}
			return { type: 'STRIPE_CONFIGURATION_SET', payload: configuration };
		},
		*beginStripeTransaction( payload ) {
			let stripeResponse;
			try {
				const paymentMethodToken = yield {
					type: 'STRIPE_CREATE_PAYMENT_METHOD_TOKEN',
					payload: {
						...payload,
						country: getCountry(),
						postalCode: getPostalCode(),
						phoneNumber: getPhoneNumber(),
					},
				};
				debug( 'stripe payment token created' );
				stripeResponse = yield {
					type: 'STRIPE_TRANSACTION_BEGIN',
					payload: {
						...payload,
						siteId: getSiteId(),
						country: getCountry(),
						postalCode: getPostalCode(),
						subdivisionCode: getSubdivisionCode(),
						domainDetails: getDomainDetails(),
						paymentMethodToken,
					},
				};
				debug( 'stripe transaction complete', stripeResponse );
			} catch ( error ) {
				debug( 'stripe transaction had an error', error );
				return { type: 'STRIPE_TRANSACTION_ERROR', payload: error };
			}
			if ( stripeResponse?.message?.payment_intent_client_secret ) {
				debug( 'stripe transaction requires auth' );
				return { type: 'STRIPE_TRANSACTION_AUTH', payload: stripeResponse };
			}
			if ( stripeResponse?.redirect_url ) {
				debug( 'stripe transaction requires redirect' );
				return { type: 'STRIPE_TRANSACTION_REDIRECT', payload: stripeResponse };
			}
			debug( 'stripe transaction requires is successful' );
			return { type: 'STRIPE_TRANSACTION_END', payload: stripeResponse };
		},
	};

	const selectors = {
		getStripeConfiguration( state ) {
			return state.stripeConfiguration;
		},
		getBrand( state ) {
			return state.brand || '';
		},
		getCardholderName( state ) {
			return state.cardholderName || '';
		},
		getTransactionError( state ) {
			return state.transactionError;
		},
		getTransactionStatus( state ) {
			return state.transactionStatus;
		},
		getTransactionAuthData( state ) {
			return state.transactionAuthData;
		},
		getCardDataErrors( state ) {
			return state.cardDataErrors;
		},
		areAllFieldsComplete( state ) {
			return Object.keys( state.cardDataComplete ).every( key => state.cardDataComplete[ key ] );
		},
	};

	function cardDataCompleteReducer(
		state = {
			cardNumber: false,
			cardCvc: false,
			cardExpiry: false,
		},
		action
	) {
		switch ( action?.type ) {
			case 'CARD_DATA_COMPLETE_SET':
				return { ...state, [ action.payload.type ]: action.payload.complete };
			default:
				return state;
		}
	}

	function cardDataErrorsReducer( state = {}, action ) {
		switch ( action?.type ) {
			case 'CARD_DATA_ERROR_SET':
				return { ...state, [ action.payload.type ]: action.payload.message };
			default:
				return state;
		}
	}

	registerStore( 'existing-card', {
		reducer(
			state = {
				cardDataErrors: cardDataErrorsReducer(),
				cardDataComplete: cardDataCompleteReducer(),
			},
			action
		) {
			switch ( action.type ) {
				case 'STRIPE_TRANSACTION_END':
					return {
						...state,
						transactionStatus: 'complete',
					};
				case 'STRIPE_TRANSACTION_ERROR':
					return {
						...state,
						transactionStatus: 'error',
						transactionError: action.payload,
					};
				case 'STRIPE_TRANSACTION_AUTH':
					return {
						...state,
						transactionStatus: 'auth',
						transactionAuthData: action.payload,
					};
				case 'STRIPE_TRANSACTION_REDIRECT':
					return {
						...state,
						transactionStatus: 'redirect',
					};
				case 'STRIPE_CONFIGURATION_SET':
					return { ...state, stripeConfiguration: action.payload };
				case 'CARDHOLDER_NAME_SET':
					return { ...state, cardholderName: action.payload };
				case 'BRAND_SET':
					return { ...state, brand: action.payload };
				case 'CARD_DATA_COMPLETE_SET':
					return {
						...state,
						cardDataComplete: cardDataCompleteReducer( state.cardDataComplete, action ),
					};
				case 'CARD_DATA_ERROR_SET':
					return {
						...state,
						cardDataErrors: cardDataErrorsReducer( state.cardDataErrors, action ),
					};
			}
			return state;
		},
		actions,
		selectors,
		controls: {
			STRIPE_CONFIGURATION_FETCH( action ) {
				return fetchStripeConfiguration( action.payload );
			},
			STRIPE_CREATE_PAYMENT_METHOD_TOKEN( action ) {
				return createStripePaymentMethodToken( action.payload );
			},
			STRIPE_TRANSACTION_BEGIN( action ) {
				return sendStripeTransaction( action.payload );
			},
		},
	} );

	return {
		id,
		label: <ExistingCardLabel labelText={ labelText } />,
		submitButton: <ExistingCardPayButton />,
		inactiveContent: <ExistingCardSummary />,
		getAriaLabel: () => labelText,
	};
}

export function ExistingCardLabel( { labelText } ) {
	return (
		<React.Fragment>
			<span>{ labelText }</span>
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

function ExistingCardPayButton( { disabled } ) {
	const localize = useLocalize();
	const [ items, total ] = useLineItems();
	const { showErrorMessage } = useMessages();
	const { successRedirectUrl, failureRedirectUrl } = useCheckoutRedirects();
	const { stripe, stripeConfiguration } = useStripe();
	const transactionStatus = useSelect( select => select( 'existing-card' ).getTransactionStatus() );
	const transactionError = useSelect( select => select( 'existing-card' ).getTransactionError() );
	const transactionAuthData = useSelect( select =>
		select( 'existing-card' ).getTransactionAuthData()
	);
	const { beginStripeTransaction } = useDispatch( 'existing-card' );
	const name = useSelect( select => select( 'existing-card' ).getCardholderName() );
	const { formStatus, setFormReady, setFormComplete, setFormSubmitting } = useFormStatus();

	useEffect( () => {
		if ( transactionStatus === 'error' ) {
			// TODO: clear this after showing it
			showErrorMessage(
				transactionError || localize( 'An error occurred during the transaction' )
			);
			setFormReady();
		}
		if ( transactionStatus === 'complete' ) {
			debug( 'stripe transaction is complete' );
			setFormComplete();
		}
		if ( transactionStatus === 'redirect' ) {
			// TODO: notify user that we are going to redirect
		}
		if ( transactionStatus === 'auth' ) {
			showStripeModalAuth( {
				stripeConfiguration,
				response: transactionAuthData,
			} ).catch( error => {
				setFormReady();
				showErrorMessage( error.stripeError || error.message );
			} );
		}
	}, [
		setFormReady,
		setFormComplete,
		showErrorMessage,
		transactionStatus,
		transactionError,
		transactionAuthData,
		stripeConfiguration,
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
				submitStripePayment( {
					name,
					items,
					total,
					stripe,
					stripeConfiguration,
					showErrorMessage,
					successUrl: successRedirectUrl,
					cancelUrl: failureRedirectUrl,
					beginStripeTransaction,
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

function ExistingCardSummary() {
	const cardholderName = useSelect( select => select( 'existing-card' ).getCardholderName() );
	const brand = useSelect( select => select( 'existing-card' ).getBrand() );

	return (
		<SummaryDetails>
			<SummaryLine>{ cardholderName }</SummaryLine>
			<SummaryLine>
				{ brand !== 'unknown' && '****' } <CardFieldIcon brand={ brand } isSummary={ true } />
			</SummaryLine>
		</SummaryDetails>
	);
}

async function submitStripePayment( {
	name,
	items,
	total,
	stripe,
	stripeConfiguration,
	showErrorMessage,
	successUrl,
	cancelUrl,
	beginStripeTransaction,
	setFormSubmitting,
	setFormReady,
} ) {
	debug( 'submitting stripe payment' );
	try {
		setFormSubmitting();
		beginStripeTransaction( {
			stripe,
			name,
			items,
			total,
			stripeConfiguration,
			successUrl,
			cancelUrl,
		} );
	} catch ( error ) {
		setFormReady();
		showErrorMessage( error );
		return;
	}
}

function createStripePaymentMethodToken( { stripe, name, country, postalCode, phoneNumber } ) {
	return createStripePaymentMethod( stripe, {
		name,
		address: {
			country,
			postal_code: postalCode,
		},
		...( phoneNumber ? { phone: phoneNumber } : {} ),
	} );
}

async function showStripeModalAuth( { stripeConfiguration, response } ) {
	const authenticationResponse = await confirmStripePaymentIntent(
		stripeConfiguration,
		response.message.payment_intent_client_secret
	);

	if ( authenticationResponse ) {
		// TODO: what do we do here?
	}
}

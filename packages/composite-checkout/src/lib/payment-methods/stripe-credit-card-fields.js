/**
 * External dependencies
 */
import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useTheme } from 'emotion-theming';
import { CardCvcElement, CardExpiryElement, CardNumberElement } from 'react-stripe-elements';
import { LeftColumn, RightColumn } from '../styled-components/ie-fallback';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import Field from '../../components/field';
import GridRow from '../../components/grid-row';
import Button from '../../components/button';
import PaymentLogo from './payment-logo';
import {
	useStripe,
	createStripePaymentMethod,
	showStripeModalAuth,
	StripeHookProvider,
} from '../stripe';
import {
	useSelect,
	useDispatch,
	useMessages,
	useLineItems,
	renderDisplayValueMarkdown,
	useEvents,
} from '../../public-api';
import { sprintf, useLocalize } from '../localize';
import { CreditCardLabel } from './credit-card';
import { SummaryLine, SummaryDetails } from '../styled-components/summary-details';
import CreditCardFields, { CVVImage } from './credit-card-fields';
import Spinner from '../../components/spinner';
import ErrorMessage from '../../components/error-message';
import { useFormStatus } from '../form-status';

const debug = debugFactory( 'composite-checkout:stripe-payment-method' );

export function createStripeMethod( {
	getCountry,
	getPostalCode,
	getSubdivisionCode,
	registerStore,
	fetchStripeConfiguration,
	submitTransaction,
} ) {
	debug( 'creating a new stripe payment method' );
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
		setStripeComplete( payload ) {
			debug( 'stripe transaction is successful' );
			return { type: 'STRIPE_TRANSACTION_END', payload };
		},
		resetTransaction() {
			debug( 'resetting transaction' );
			return { type: 'STRIPE_TRANSACTION_RESET' };
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
					},
				};
				debug( 'stripe payment token created' );
				stripeResponse = yield {
					type: 'STRIPE_TRANSACTION_BEGIN',
					payload: {
						...payload,
						country: getCountry(),
						postalCode: getPostalCode(),
						subdivisionCode: getSubdivisionCode(),
						paymentMethodToken,
					},
				};
				debug( 'stripe transaction complete', stripeResponse );
			} catch ( error ) {
				debug( 'stripe transaction had an error', error );
				return { type: 'STRIPE_TRANSACTION_ERROR', payload: String( error ) };
			}
			if ( stripeResponse?.message?.payment_intent_client_secret ) {
				debug( 'stripe transaction requires auth' );
				return { type: 'STRIPE_TRANSACTION_AUTH', payload: stripeResponse };
			}
			if ( stripeResponse?.redirect_url ) {
				debug( 'stripe transaction requires redirect' );
				return { type: 'STRIPE_TRANSACTION_REDIRECT', payload: stripeResponse };
			}
			debug( 'stripe transaction is successful' );
			return { type: 'STRIPE_TRANSACTION_END', payload: stripeResponse };
		},
	};

	const selectors = {
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
		getRedirectUrl( state ) {
			return state.redirectUrl;
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

	const store = registerStore( 'stripe', {
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
						redirectUrl: action.payload.redirect_url,
					};
				case 'STRIPE_TRANSACTION_RESET':
					return {
						...state,
						transactionStatus: null,
					};
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
			STRIPE_CREATE_PAYMENT_METHOD_TOKEN( action ) {
				return createStripePaymentMethodToken( action.payload );
			},
			STRIPE_TRANSACTION_BEGIN( action ) {
				return submitTransaction( action.payload );
			},
		},
	} );

	return {
		id: 'stripe-card',
		label: <CreditCardLabel />,
		activeContent: <StripeCreditCardFields />,
		submitButton: <StripePayButton />,
		checkoutWrapper: children => (
			<StripeHookProvider fetchStripeConfiguration={ fetchStripeConfiguration }>
				{ children }
			</StripeHookProvider>
		),
		inactiveContent: <StripeSummary />,
		getAriaLabel: localize => localize( 'Credit Card' ),
		isCompleteCallback: () => {
			const cardholderName = selectors.getCardholderName( store.getState() );
			const errors = selectors.getCardDataErrors( store.getState() );
			const isCardDataComplete = selectors.areAllFieldsComplete( store.getState() );
			const areThereErrors = Object.keys( errors ).some( errorKey => errors[ errorKey ] );
			if ( ! cardholderName?.length || areThereErrors || ! isCardDataComplete ) {
				return false;
			}
			return true;
		},
	};
}

function StripeCreditCardFields() {
	const localize = useLocalize();
	const theme = useTheme();
	const { showErrorMessage } = useMessages();
	const onEvent = useEvents();
	const { stripeLoadingError, isStripeLoading } = useStripe();
	const [ isStripeFullyLoaded, setIsStripeFullyLoaded ] = useState( false );
	const cardholderName = useSelect( select => select( 'stripe' ).getCardholderName() );
	const brand = useSelect( select => select( 'stripe' ).getBrand() );
	const {
		cardNumber: cardNumberError,
		cardCvc: cardCvcError,
		cardExpiry: cardExpiryError,
	} = useSelect( select => select( 'stripe' ).getCardDataErrors() );
	const { changeCardholderName, changeBrand, setCardDataError, setCardDataComplete } = useDispatch(
		'stripe'
	);

	useEffect( () => {
		if ( stripeLoadingError ) {
			debug( 'showing error for loading', stripeLoadingError );
			showErrorMessage( stripeLoadingError );
		}
	}, [ showErrorMessage, stripeLoadingError ] );

	const handleStripeFieldChange = input => {
		setCardDataComplete( input.elementType, input.complete );
		if ( input.elementType === 'cardNumber' ) {
			changeBrand( input.brand );
		}

		if ( input.error && input.error.message ) {
			onEvent( {
				type: 'a8c_checkout_error',
				payload: {
					type: 'Stripe field error',
					field: input.elementType,
					message: input.error.message,
				},
			} );
			setCardDataError( input.elementType, input.error.message );
			return;
		}
		setCardDataError( input.elementType, null );
	};

	const cardNumberStyle = {
		base: {
			fontSize: '16px',
			color: theme.colors.textColor,
			fontFamily: theme.fonts.body,
			fontWeight: theme.weights.normal,
			'::placeholder': {
				color: theme.colors.placeHolderTextColor,
			},
		},
		invalid: {
			color: theme.colors.textColor,
		},
	};

	useEffect( () => {
		if ( stripeLoadingError ) {
			onEvent( { type: 'a8c_checkout_error', payload: { type: 'Stripe loading error' } } );
		}
	}, [ stripeLoadingError, onEvent ] );

	if ( stripeLoadingError ) {
		return (
			<CreditCardFieldsWrapper isLoaded={ true }>
				<ErrorMessage>
					{ localize(
						'Our payment processor failed to load, please refresh your screen to try again or pick another payment method to proceed.'
					) }
				</ErrorMessage>
			</CreditCardFieldsWrapper>
		);
	}

	if ( isStripeLoading ) {
		return (
			<StripeFields>
				<LoadingFields />
			</StripeFields>
		);
	}

	return (
		<StripeFields>
			{ ! isStripeFullyLoaded && <LoadingFields /> }

			<CreditCardFieldsWrapper isLoaded={ isStripeFullyLoaded }>
				<Label>
					<LabelText>{ localize( 'Card number' ) }</LabelText>
					<StripeFieldWrapper hasError={ cardNumberError }>
						<CardNumberElement
							style={ cardNumberStyle }
							onReady={ () => {
								setIsStripeFullyLoaded( true );
							} }
							onChange={ input => {
								handleStripeFieldChange( input );
							} }
						/>
						<PaymentLogo brand={ brand } />

						{ cardNumberError && <StripeErrorMessage>{ cardNumberError }</StripeErrorMessage> }
					</StripeFieldWrapper>
				</Label>
				<FieldRow gap="4%" columnWidths="48% 48%">
					<LeftColumn>
						<Label>
							<LabelText>{ localize( 'Expiry date' ) }</LabelText>
							<StripeFieldWrapper hasError={ cardExpiryError }>
								<CardExpiryElement
									style={ cardNumberStyle }
									onChange={ input => {
										handleStripeFieldChange( input );
									} }
								/>
							</StripeFieldWrapper>
							{ cardExpiryError && <StripeErrorMessage>{ cardExpiryError }</StripeErrorMessage> }
						</Label>
					</LeftColumn>
					<RightColumn>
						<Label>
							<LabelText>{ localize( 'Security code' ) }</LabelText>
							<GridRow gap="4%" columnWidths="67% 29%">
								<LeftColumn>
									<StripeFieldWrapper hasError={ cardCvcError }>
										<CardCvcElement
											style={ cardNumberStyle }
											onChange={ input => {
												handleStripeFieldChange( input );
											} }
										/>
									</StripeFieldWrapper>
								</LeftColumn>
								<RightColumn>
									<CVVImage />
								</RightColumn>
							</GridRow>
							{ cardCvcError && <StripeErrorMessage>{ cardCvcError }</StripeErrorMessage> }
						</Label>
					</RightColumn>
				</FieldRow>

				<CreditCardField
					id="cardholderName"
					type="Text"
					label={ localize( 'Cardholder name' ) }
					description={ localize( "Enter your name as it's written on the card" ) }
					value={ cardholderName }
					onChange={ changeCardholderName }
				/>
			</CreditCardFieldsWrapper>
		</StripeFields>
	);
}

const StripeFields = styled.div`
	position: relative;
`;

const CreditCardFieldsWrapper = styled.div`
	padding: 16px;
	position: relative;
	display: ${props => ( props.isLoaded ? 'block' : 'none' )};
	position: relative;

	:after {
		display: block;
		width: calc( 100% - 6px );
		height: 1px;
		content: '';
		background: ${props => props.theme.colors.borderColorLight};
		position: absolute;
		top: 0;
		left: 3px;
	}
`;

const LoadingIndicator = styled( Spinner )`
	position: absolute;
	right: 15px;
	top: 10px;
`;

const CreditCardField = styled( Field )`
	margin-top: 16px;

	:first-of-type {
		margin-top: 0;
	}
`;

const FieldRow = styled( GridRow )`
	margin-top: 16px;
`;

const Label = styled.label`
	display: block;

	:hover {
		cursor: pointer;
	}
`;

const LabelText = styled.span`
	display: block;
	font-size: 14px;
	font-weight: ${props => props.theme.weights.bold};
	margin-bottom: 8px;
	color: ${props => props.theme.colors.textColor};
`;

const StripeFieldWrapper = styled.span`
	position: relative;
	display: block;

	.StripeElement {
		display: block;
		width: 100%;
		font-size: 16px;
		box-sizing: border-box;
		border: 1px solid
			${props => ( props.hasError ? props.theme.colors.error : props.theme.colors.borderColor )};
		padding: 12px 10px;
		line-height: 1.2;
	}

	.StripeElement--focus {
		outline: ${props => props.theme.colors.outline} solid 2px;
	}

	.StripeElement--focus.StripeElement--invalid {
		outline: ${props => props.theme.colors.error} solid 2px;
	}
`;

const StripeErrorMessage = styled.span`
	font-size: 14px;
	margin-top: 8px;
	font-style: italic;
	color: ${props => props.theme.colors.error};
	display: block;
	font-weight: ${props => props.theme.weights.normal};
`;

function LoadingFields() {
	return (
		<React.Fragment>
			<LoadingIndicator />
			<CreditCardFields disabled={ true } />
		</React.Fragment>
	);
}

function StripePayButton( { disabled } ) {
	const localize = useLocalize();
	const [ items, total ] = useLineItems();
	const { showErrorMessage, showInfoMessage } = useMessages();
	const { stripe, stripeConfiguration } = useStripe();
	const transactionStatus = useSelect( select => select( 'stripe' ).getTransactionStatus() );
	const transactionError = useSelect( select => select( 'stripe' ).getTransactionError() );
	const transactionAuthData = useSelect( select => select( 'stripe' ).getTransactionAuthData() );
	const { beginStripeTransaction, setStripeComplete, resetTransaction } = useDispatch( 'stripe' );
	const name = useSelect( select => select( 'stripe' ).getCardholderName() );
	const redirectUrl = useSelect( select => select( 'stripe' ).getRedirectUrl() );
	const { formStatus, setFormReady, setFormComplete, setFormSubmitting } = useFormStatus();
	const onEvent = useEvents();

	useEffect( () => {
		if ( transactionStatus === 'error' ) {
			debug( 'showing error', transactionError );
			showErrorMessage(
				transactionError || localize( 'An error occurred during the transaction' )
			);
			resetTransaction();
			setFormReady();
		}
		if ( transactionStatus === 'complete' ) {
			debug( 'marking complete' );
			setFormComplete();
		}
		if ( transactionStatus === 'redirect' ) {
			debug( 'redirecting' );
			showInfoMessage( localize( 'Redirecting...' ) );
			window.location = redirectUrl;
		}
	}, [
		resetTransaction,
		setFormReady,
		setFormComplete,
		showErrorMessage,
		showInfoMessage,
		transactionStatus,
		transactionError,
		redirectUrl,
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
				.then( authenticationResponse => {
					debug( 'stripe auth is complete', authenticationResponse );
					isSubscribed && setStripeComplete( authenticationResponse );
				} )
				.catch( error => {
					debug( 'showing error for auth', error );
					showErrorMessage(
						localize( 'Authorization failed for that card. Please try a different payment method.' )
					);
					isSubscribed && resetTransaction();
					isSubscribed && setFormReady();
				} );
		}

		return () => ( isSubscribed = false );
	}, [
		setStripeComplete,
		resetTransaction,
		setFormReady,
		showInfoMessage,
		showErrorMessage,
		transactionStatus,
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
					beginStripeTransaction,
					setFormSubmitting,
					resetTransaction,
					onEvent,
				} )
			}
			buttonState={ disabled ? 'disabled' : 'primary' }
			fullWidth
		>
			{ buttonString }
		</Button>
	);
}

function StripeSummary() {
	const cardholderName = useSelect( select => select( 'stripe' ).getCardholderName() );
	const brand = useSelect( select => select( 'stripe' ).getBrand() );

	return (
		<SummaryDetails>
			<SummaryLine>{ cardholderName }</SummaryLine>
			<SummaryLine>
				{ brand !== 'unknown' && '****' } <PaymentLogo brand={ brand } isSummary={ true } />
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
	beginStripeTransaction,
	setFormSubmitting,
	setFormReady,
	resetTransaction,
	onEvent,
} ) {
	debug( 'submitting stripe payment' );
	try {
		setFormSubmitting();
		onEvent( { type: 'STRIPE_TRANSACTION_BEGIN' } );
		beginStripeTransaction( {
			stripe,
			name,
			items,
			total,
			stripeConfiguration,
		} );
	} catch ( error ) {
		resetTransaction();
		setFormReady();
		onEvent( { type: 'STRIPE_TRANSACTION_ERROR', payload: error } );
		debug( 'showing error for submit', error );
		showErrorMessage( error );
		return;
	}
}

function createStripePaymentMethodToken( { stripe, name, country, postalCode } ) {
	return createStripePaymentMethod( stripe, {
		name,
		address: {
			country,
			postal_code: postalCode,
		},
	} );
}

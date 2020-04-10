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
import { VisaLogo, MastercardLogo, AmexLogo } from '../../components/payment-logos';
import { PaymentMethodLogos } from '../styled-components/payment-method-logos';
import Field from '../../components/field';
import GridRow from '../../components/grid-row';
import Button from '../../components/button';
import PaymentLogo from './payment-logo';
import { createStripePaymentMethod, showStripeModalAuth } from '../stripe';
import { useMessages, useLineItems, renderDisplayValueMarkdown, useEvents } from '../../public-api';
import { sprintf, useLocalize } from '../localize';
import { SummaryLine, SummaryDetails } from '../styled-components/summary-details';
import Spinner from '../../components/spinner';
import { useFormStatus } from '../form-status';
import { registerStore, useSelect, useDispatch } from '../../lib/registry';

const debug = debugFactory( 'composite-checkout:stripe-payment-method' );

export function createStripePaymentMethodStore( {
	getCountry,
	getPostalCode,
	getSubdivisionCode,
	getSiteId,
	getDomainDetails,
	submitTransaction,
} ) {
	debug( 'creating a new stripe payment method store' );
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
		getIncompleteFieldKeys( state ) {
			return Object.keys( state.cardDataComplete ).filter( key => ! state.cardDataComplete[ key ] );
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
				cardholderName: { value: '', isTouched: false },
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
					return { ...state, cardholderName: { value: action.payload, isTouched: true } };
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
				return submitTransaction( {
					...action.payload,
					siteId: getSiteId(),
					domainDetails: getDomainDetails(),
				} );
			},
		},
	} );

	return { ...store, actions, selectors };
}

export function createStripeMethod( { store, stripe, stripeConfiguration } ) {
	return {
		id: 'stripe-card',
		label: <CreditCardLabel />,
		activeContent: (
			<StripeCreditCardFields stripe={ stripe } stripeConfiguration={ stripeConfiguration } />
		),
		submitButton: (
			<StripePayButton
				store={ store }
				stripe={ stripe }
				stripeConfiguration={ stripeConfiguration }
			/>
		),
		inactiveContent: <StripeSummary />,
		getAriaLabel: localize => localize( 'Credit Card' ),
	};
}

function StripeCreditCardFields() {
	const localize = useLocalize();
	const theme = useTheme();
	const onEvent = useEvents();
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

	const handleStripeFieldChange = input => {
		setCardDataComplete( input.elementType, input.complete );
		if ( input.elementType === 'cardNumber' ) {
			changeBrand( input.brand );
		}

		if ( input.error && input.error.message ) {
			onEvent( {
				type: 'a8c_checkout_stripe_field_invalid_error',
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
					autoComplete="cc-name"
					label={ localize( 'Cardholder name' ) }
					description={ localize( "Enter your name as it's written on the card" ) }
					value={ cardholderName?.value ?? '' }
					onChange={ changeCardholderName }
					isError={ cardholderName?.isTouched && cardholderName?.value.length === 0 }
					errorMessage={ localize( 'This field is required' ) }
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
			<CreditCardLoading />
		</React.Fragment>
	);
}

function StripePayButton( { disabled, store, stripe, stripeConfiguration } ) {
	const localize = useLocalize();
	const [ items, total ] = useLineItems();
	const { showErrorMessage, showInfoMessage } = useMessages();
	const transactionStatus = useSelect( select => select( 'stripe' ).getTransactionStatus() );
	const transactionError = useSelect( select => select( 'stripe' ).getTransactionError() );
	const transactionAuthData = useSelect( select => select( 'stripe' ).getTransactionAuthData() );
	const { beginStripeTransaction, setStripeComplete, resetTransaction } = useDispatch( 'stripe' );
	const cardholderName = useSelect( select => select( 'stripe' ).getCardholderName() );
	const redirectUrl = useSelect( select => select( 'stripe' ).getRedirectUrl() );
	const { formStatus, setFormReady, setFormComplete, setFormSubmitting } = useFormStatus();
	const onEvent = useEvents();

	useEffect( () => {
		if ( transactionStatus === 'error' ) {
			debug( 'showing error', transactionError );
			showErrorMessage(
				transactionError || localize( 'An error occurred during the transaction' )
			);
			onEvent( { type: 'STRIPE_TRANSACTION_ERROR', payload: transactionError || '' } );
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
		onEvent,
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
			onEvent( { type: 'SHOW_MODAL_AUTHORIZATION' } );
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
					onEvent( { type: 'EXISTING_CARD_TRANSACTION_ERROR', payload: error } );
					isSubscribed && resetTransaction();
					isSubscribed && setFormReady();
				} );
		}

		return () => ( isSubscribed = false );
	}, [
		onEvent,
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
			onClick={ () => {
				if ( isCreditCardFormValid( store ) ) {
					submitStripePayment( {
						name: cardholderName?.value,
						items,
						total,
						stripe,
						stripeConfiguration,
						showErrorMessage,
						beginStripeTransaction,
						setFormSubmitting,
						resetTransaction,
						onEvent,
					} );
				}
			} }
			buttonState={ disabled ? 'disabled' : 'primary' }
			isBusy={ 'submitting' === formStatus }
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
			<SummaryLine>{ cardholderName?.value }</SummaryLine>
			<SummaryLine>
				{ brand !== 'unknown' && '****' } <PaymentLogo brand={ brand } isSummary={ true } />
			</SummaryLine>
		</SummaryDetails>
	);
}

function isCreditCardFormValid( store ) {
	const cardholderName = store.selectors.getCardholderName( store.getState() );
	const errors = store.selectors.getCardDataErrors( store.getState() );
	const incompleteFieldKeys = store.selectors.getIncompleteFieldKeys( store.getState() );
	const areThereErrors = Object.keys( errors ).some( errorKey => errors[ errorKey ] );
	if ( ! cardholderName?.value.length ) {
		// Touch the field so it displays a validation error
		store.dispatch( store.actions.changeCardholderName( '' ) );
	}
	if ( incompleteFieldKeys.length > 0 ) {
		// Show "this field is required" for each incomplete field
		incompleteFieldKeys.map( key =>
			store.dispatch( store.actions.setCardDataError( key, 'This field is required' ) )
		); // TODO: localize this message
	}
	if ( areThereErrors || ! cardholderName?.value.length || incompleteFieldKeys.length > 0 ) {
		return false;
	}
	return true;
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

function CreditCardLabel() {
	const localize = useLocalize();
	return (
		<React.Fragment>
			<span>{ localize( 'Credit or debit card' ) }</span>
			<CreditCardLogos />
		</React.Fragment>
	);
}

function CreditCardLogos() {
	//TODO: Determine which logos to show

	return (
		<PaymentMethodLogos>
			<VisaLogo />
			<MastercardLogo />
			<AmexLogo />
		</PaymentMethodLogos>
	);
}

function CreditCardLoading() {
	const localize = useLocalize();

	return (
		<CreditCardFieldsWrapper isLoaded={ true }>
			<CreditCardField
				id="credit-card-number"
				type="Number"
				label={ localize( 'Card number' ) }
				placeholder="1234 1234 1234 1234"
				icon={ <LockIcon /> }
				isIconVisible={ true }
				autoComplete="cc-number"
				value={ '' }
				disabled={ true }
			/>
			<FieldRow gap="4%" columnWidths="48% 48%">
				<LeftColumn>
					<Field
						id="card-expiry"
						type="Number"
						label={ localize( 'Expiry date' ) }
						placeholder="MM / YY"
						autoComplete="cc-exp"
						value={ '' }
						disabled={ true }
					/>
				</LeftColumn>
				<RightColumn>
					<label>
						<LabelText>{ localize( 'Security code' ) }</LabelText>
						<GridRow gap="4%" columnWidths="67% 29%">
							<LeftColumn>
								<Field
									id="card-cvc"
									type="Number"
									placeholder="CVC"
									autoComplete="cc-csc"
									value={ '' }
									disabled={ true }
								/>
							</LeftColumn>
							<RightColumn>
								<CVVImage />
							</RightColumn>
						</GridRow>
					</label>
				</RightColumn>
			</FieldRow>

			<CreditCardField
				id="card-holder-name"
				type="Text"
				label={ localize( 'Cardholder name' ) }
				description={ localize( "Enter your name as it's written on the card" ) }
				autoComplete="cc-name"
				value={ '' }
				disabled={ true }
			/>
		</CreditCardFieldsWrapper>
	);
}

function LockIcon( { className } ) {
	return (
		<LockIconGraphic
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
		</LockIconGraphic>
	);
}

const LockIconGraphic = styled.svg`
	width: 20px;
	height: 20px;
	display: block;
	transform: translateY( 1px );
`;

function CVV( { className } ) {
	const localize = useLocalize();

	return (
		<svg
			className={ className }
			viewBox="0 0 68 41"
			preserveAspectRatio="xMaxYMin meet"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-labelledby="cvv-image-title"
			role="img"
			focusable="false"
			width="68"
			height="41"
		>
			<title id="cvv-image-title">
				{ localize( 'An image of the back of the card where you find the security code' ) }
			</title>
			<rect x="0" y="0" width="67.0794" height="45" rx="3" fill="#D7DADE" />
			<rect x="0" y="4" width="67.0794" height="10.4828" fill="#23282D" />
			<rect x="6.84361" y="21.3398" width="35.087" height="8.63682" fill="white" />
			<path
				d="M49.8528 23.2869C50.2903 23.2869 50.6262 23.4753 50.8606 23.8523C51.0969 24.2273 51.2151 24.7546 51.2151 25.4343C51.2151 26.0925 51.1008 26.615 50.8723 27.0017C50.6438 27.3865 50.3039 27.5789 49.8528 27.5789C49.4172 27.5789 49.0813 27.3914 48.845 27.0164C48.6086 26.6414 48.4905 26.114 48.4905 25.4343C48.4905 24.7742 48.6047 24.2517 48.8332 23.8669C49.0637 23.4802 49.4036 23.2869 49.8528 23.2869ZM49.8528 27.157C50.1418 27.157 50.3557 27.0203 50.4944 26.7468C50.635 26.4714 50.7053 26.0339 50.7053 25.4343C50.7053 24.8328 50.635 24.3962 50.4944 24.1248C50.3557 23.8513 50.1418 23.7146 49.8528 23.7146C49.5676 23.7146 49.3547 23.8542 49.2141 24.1335C49.0735 24.4128 49.0032 24.8464 49.0032 25.4343C49.0032 26.03 49.0725 26.4666 49.2112 26.7439C49.3518 27.0193 49.5657 27.157 49.8528 27.157ZM49.8411 24.9949C49.9641 24.9949 50.0676 25.0378 50.1516 25.1238C50.2375 25.2078 50.2805 25.3113 50.2805 25.4343C50.2805 25.5613 50.2375 25.6707 50.1516 25.7625C50.0657 25.8523 49.9622 25.8972 49.8411 25.8972C49.7219 25.8972 49.6194 25.8523 49.5334 25.7625C49.4495 25.6707 49.4075 25.5613 49.4075 25.4343C49.4075 25.3093 49.4485 25.2048 49.5305 25.1208C49.6145 25.0369 49.718 24.9949 49.8411 24.9949ZM54.5373 27.4998H52.2639V27.1511C52.8401 26.5085 53.2141 26.0779 53.386 25.8591C53.5579 25.6404 53.6975 25.4109 53.8049 25.1707C53.9123 24.9304 53.9661 24.6912 53.9661 24.4529C53.9661 24.2224 53.8957 24.0408 53.7551 23.908C53.6164 23.7751 53.4211 23.7087 53.1692 23.7087C52.9758 23.7087 52.7161 23.7683 52.3899 23.8875L52.3225 23.4744C52.6174 23.3494 52.926 23.2869 53.2483 23.2869C53.6174 23.2869 53.9143 23.3914 54.1389 23.6003C54.3655 23.8074 54.4788 24.0847 54.4788 24.4324C54.4788 24.6804 54.4202 24.9265 54.303 25.1707C54.1877 25.4148 54.0393 25.6492 53.8577 25.8738C53.676 26.0984 53.3225 26.5007 52.7971 27.0808H54.5373V27.4998ZM57.3235 25.2791C57.5754 25.3494 57.7776 25.4783 57.9299 25.6658C58.0823 25.8513 58.1584 26.0603 58.1584 26.2927C58.1584 26.656 58.0168 26.9617 57.7336 27.2097C57.4504 27.4558 57.1164 27.5789 56.7317 27.5789C56.4036 27.5789 56.1096 27.5066 55.8498 27.3621L55.9436 26.9666C56.2151 27.0935 56.4836 27.157 56.7493 27.157C56.9993 27.157 57.2122 27.0798 57.3879 26.9255C57.5657 26.7693 57.6545 26.5691 57.6545 26.325C57.6545 26.0847 57.5598 25.8894 57.3704 25.739C57.1809 25.5886 56.9299 25.5134 56.6174 25.5134H56.4914V25.1179H56.5266C56.8274 25.1179 57.0754 25.0476 57.2707 24.907C57.4661 24.7644 57.5637 24.573 57.5637 24.3328C57.5637 24.1375 57.4934 23.9851 57.3528 23.8757C57.2122 23.7644 57.0188 23.7087 56.7727 23.7087C56.5598 23.7087 56.3215 23.7664 56.0579 23.8816L55.9934 23.4685C56.259 23.3474 56.5266 23.2869 56.7961 23.2869C57.1653 23.2869 57.469 23.3845 57.7073 23.5798C57.9475 23.7732 58.0676 24.0222 58.0676 24.3269C58.0676 24.5378 57.9944 24.7351 57.8479 24.9187C57.7034 25.1003 57.5286 25.2146 57.3235 25.2615V25.2791Z"
				fill="black"
			/>
			<rect x="44.7258" y="18.9998" width="17.4205" height="13.3329" stroke="#C9356E" />
		</svg>
	);
}

const CVVImage = styled( CVV )`
	display: block;
	width: 100%;
`;

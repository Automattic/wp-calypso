/**
 * External dependencies
 */
import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useTheme } from 'emotion-theming';
import { CardCvcElement, CardExpiryElement, CardNumberElement } from 'react-stripe-elements';
import { LeftColumn, RightColumn } from '../styled-components/ie-fallback';

/**
 * Internal dependencies
 */
import Field from '../../components/field';
import GridRow from '../../components/grid-row';
import Button from '../../components/button';
import {
	useStripe,
	createStripePaymentMethod,
	confirmStripePaymentIntent,
	StripeHookProvider,
} from '../stripe';
import {
	useSelect,
	usePaymentData,
	useDispatch,
	useCheckoutHandlers,
	useLineItems,
	useCheckoutRedirects,
	renderDisplayValueMarkdown,
} from '../../public-api';
import useLocalize, { sprintf } from '../localize';
import {
	VisaLogo,
	AmexLogo,
	MastercardLogo,
	JcbLogo,
	DinersLogo,
	UnionpayLogo,
	DiscoverLogo,
} from '../../components/payment-logos';
import { CreditCardLabel } from './credit-card';
import { SummaryLine, SummaryDetails } from '../styled-components/summary-details';
import CreditCardFields, { CVVImage } from './credit-card-fields';
import Spinner from '../../components/spinner';
import ErrorMessage from '../../components/error-message';

export function createStripeMethod( {
	registerStore,
	fetchStripeConfiguration,
	sendStripeTransaction,
} ) {
	const actions = {
		changeBrand( payload ) {
			return { type: 'BRAND_SET', payload };
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
				stripeResponse = yield { type: 'STRIPE_TRANSACTION_BEGIN', payload };
			} catch ( error ) {
				return { type: 'STRIPE_TRANSACTION_ERROR', payload: error };
			}
			if (
				stripeResponse &&
				stripeResponse.message &&
				stripeResponse.message.payment_intent_client_secret
			) {
				return { type: 'STRIPE_TRANSACTION_AUTH', payload: stripeResponse };
			}
			if ( stripeResponse && stripeResponse.redirect_url ) {
				return { type: 'STRIPE_TRANSACTION_REDIRECT', payload: stripeResponse };
			}
			return { type: 'STRIPE_TRANSACTION_END', payload: stripeResponse };
		},
	};

	registerStore( 'stripe', {
		reducer( state = {}, action ) {
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
			}
			return state;
		},
		actions,
		selectors: {
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
		},
		controls: {
			STRIPE_CONFIGURATION_FETCH( action ) {
				return fetchStripeConfiguration( action.payload );
			},
			STRIPE_TRANSACTION_BEGIN( action ) {
				return sendStripeTransaction( formatDataForStripeTransaction( action.payload ) );
			},
		},
	} );

	return {
		id: 'stripe-card',
		LabelComponent: CreditCardLabel,
		PaymentMethodComponent: StripeCreditCardFields,
		SubmitButtonComponent: StripePayButton,
		CheckoutWrapper: StripeHookProvider,
		SummaryComponent: StripeSummary,
		getAriaLabel: localize => localize( 'Credit Card' ),
	};
}

function StripeCreditCardFields() {
	const localize = useLocalize();
	const theme = useTheme();
	const { onFailure } = useCheckoutHandlers();
	const { stripeLoadingError, isStripeLoading } = useStripe();
	const [ cardNumberElementData, setCardNumberElementData ] = useState();
	const [ cardExpiryElementData, setCardExpiryElementData ] = useState();
	const [ cardCvcElementData, setCardCvcElementData ] = useState();
	const [ isStripeFullyLoaded, setIsStripeFullyLoaded ] = useState( false );
	const cardholderName = useSelect( select => select( 'stripe' ).getCardholderName() );
	const brand = useSelect( select => select( 'stripe' ).getBrand() );
	const { changeCardholderName } = useDispatch( 'stripe' );
	const { changeBrand } = useDispatch( 'stripe' );

	useEffect( () => {
		if ( stripeLoadingError ) {
			onFailure( stripeLoadingError );
		}
	}, [ onFailure, stripeLoadingError ] );

	const handleStripeFieldChange = ( input, setCardElementData ) => {
		if ( input.elementType === 'cardNumber' ) {
			changeBrand( input.brand );
		}

		if ( input.error && input.error.message ) {
			setCardElementData( input.error.message );
			return;
		}

		setCardElementData( null );
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
					<StripeFieldWrapper hasError={ cardNumberElementData }>
						<CardNumberElement
							style={ cardNumberStyle }
							onReady={ () => {
								setIsStripeFullyLoaded( true );
							} }
							onChange={ input => {
								handleStripeFieldChange( input, setCardNumberElementData );
							} }
						/>
						<CardFieldIcon brand={ brand } />

						{ cardNumberElementData && (
							<StripeErrorMessage>{ cardNumberElementData }</StripeErrorMessage>
						) }
					</StripeFieldWrapper>
				</Label>
				<FieldRow gap="4%" columnWidths="48% 48%">
					<LeftColumn>
						<Label>
							<LabelText>{ localize( 'Expiry date' ) }</LabelText>
							<StripeFieldWrapper hasError={ cardExpiryElementData }>
								<CardExpiryElement
									style={ cardNumberStyle }
									onChange={ input => {
										handleStripeFieldChange( input, setCardExpiryElementData );
									} }
								/>
							</StripeFieldWrapper>
							{ cardExpiryElementData && (
								<StripeErrorMessage>{ cardExpiryElementData }</StripeErrorMessage>
							) }
						</Label>
					</LeftColumn>
					<RightColumn>
						<Label>
							<LabelText>{ localize( 'Security code' ) }</LabelText>
							<GridRow gap="4%" columnWidths="67% 29%">
								<LeftColumn>
									<StripeFieldWrapper hasError={ cardCvcElementData }>
										<CardCvcElement
											style={ cardNumberStyle }
											onChange={ input => {
												handleStripeFieldChange( input, setCardCvcElementData );
											} }
										/>
									</StripeFieldWrapper>
								</LeftColumn>
								<RightColumn>
									<CVVImage />
								</RightColumn>
							</GridRow>
							{ cardCvcElementData && (
								<StripeErrorMessage>{ cardCvcElementData }</StripeErrorMessage>
							) }
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
		box-sizing: border-box;
		border: 1px solid
			${props => ( props.hasError ? props.theme.colors.error : props.theme.colors.borderColor )};
		padding: 12px 10px;
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

function LoadingFields() {
	return (
		<React.Fragment>
			<LoadingIndicator />
			<CreditCardFields disabled={ true } />
		</React.Fragment>
	);
}

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

function StripePayButton( { disabled } ) {
	const localize = useLocalize();
	const [ items, total ] = useLineItems();
	const { onSuccess, onFailure } = useCheckoutHandlers();
	const { successRedirectUrl, failureRedirectUrl } = useCheckoutRedirects();
	const { stripe, stripeConfiguration } = useStripe();
	const transactionStatus = useSelect( select => select( 'stripe' ).getTransactionStatus() );
	const transactionError = useSelect( select => select( 'stripe' ).getTransactionError() );
	const transactionAuthData = useSelect( select => select( 'stripe' ).getTransactionAuthData() );
	const { beginStripeTransaction } = useDispatch( 'stripe' );
	const [ paymentData ] = usePaymentData();
	const { billing = {}, domains = {} } = paymentData;

	useEffect( () => {
		if ( transactionStatus === 'error' ) {
			onFailure( transactionError || localize( 'An error occurred during the transaction' ) );
		}
		if ( transactionStatus === 'complete' ) {
			onSuccess();
		}
		if ( transactionStatus === 'redirect' ) {
			// TODO: notify user that we are going to redirect
		}
		if ( transactionStatus === 'auth' ) {
			showStripeModalAuth( {
				stripeConfiguration,
				response: transactionAuthData,
			} ).catch( error => {
				onFailure( error.stripeError || error.message );
			} );
		}
	}, [
		onSuccess,
		onFailure,
		transactionStatus,
		transactionError,
		transactionAuthData,
		stripeConfiguration,
		localize,
	] );

	const buttonString = sprintf(
		localize( 'Pay %s' ),
		renderDisplayValueMarkdown( total.amount.displayValue )
	);
	return (
		<Button
			disabled={ disabled }
			onClick={ () =>
				submitStripePayment( {
					billing,
					domains,
					items,
					total,
					stripe,
					stripeConfiguration,
					onFailure,
					successUrl: successRedirectUrl,
					cancelUrl: failureRedirectUrl,
					beginStripeTransaction,
				} )
			}
			buttonState="primary"
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
				{ brand !== 'unknown' && '****' } <CardFieldIcon brand={ brand } isSummary={ true } />
			</SummaryLine>
		</SummaryDetails>
	);
}

async function submitStripePayment( {
	items,
	total,
	stripe,
	stripeConfiguration,
	onFailure,
	successUrl,
	cancelUrl,
	billing,
	domains,
	beginStripeTransaction,
} ) {
	const name = billing.name || '';
	const country = billing.country || '';
	const postalCode = billing.zipCode || billing.postalCode || '';
	const phone = domains.phone || '';
	const subdivisionCode = billing.state || billing.province || '';
	// TODO: validate fields
	const paymentDetailsForStripe = {
		name,
		address: {
			country,
			postal_code: postalCode,
		},
	};

	if ( phone ) {
		paymentDetailsForStripe.phone = phone;
	}

	try {
		const stripePaymentMethod = await createStripePaymentMethod( stripe, paymentDetailsForStripe );
		const dataForTransaction = {
			items,
			total,
			country,
			postalCode,
			subdivisionCode,
			paymentData: { billing, domains },
			stripePaymentMethod,
			stripeConfiguration,
			successUrl,
			cancelUrl,
		};
		beginStripeTransaction( dataForTransaction );
	} catch ( error ) {
		onFailure( error );
		return;
	}
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

function formatDataForStripeTransaction( {
	name,
	items,
	total,
	country,
	postalCode,
	subdivisionCode,
	paymentData,
	stripePaymentMethod,
	stripeConfiguration,
	successUrl,
	cancelUrl,
} ) {
	const siteId = ''; // TODO: get site id
	const couponId = null; // TODO: get couponId
	const payment = {
		payment_method: 'WPCOM_Billing_Stripe_Payment_Method',
		payment_key: stripePaymentMethod.id,
		payment_partner: stripeConfiguration.processor_id,
		name,
		zip: postalCode,
		country,
		successUrl,
		cancelUrl,
	};
	return {
		cart: createCartFromLineItems( {
			siteId,
			couponId,
			items,
			total,
			country,
			postalCode,
			subdivisionCode,
		} ),
		domainDetails: paymentData, // TODO: get this somehow
		payment,
	};
}

function createCartFromLineItems( {
	siteId,
	couponId,
	items,
	country,
	postalCode,
	subdivisionCode,
} ) {
	// TODO: use cart manager to create cart object needed for this transaction
	const currency = items.reduce( ( value, item ) => value || item.amount.currency );
	return {
		blog_id: siteId,
		coupon: couponId || '',
		currency: currency || '',
		temporary: false,
		extra: [],
		products: items.map( item => ( {
			product_id: item.id,
			meta: '', // TODO: get this for domains, etc
			cost: item.amount.value, // TODO: how to convert this from 3500 to 35?
			currency: item.amount.currency,
			volume: 1,
		} ) ),
		tax: {
			location: {
				country_code: country,
				postal_code: postalCode,
				subdivision_code: subdivisionCode,
			},
		},
	};
}

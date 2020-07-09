/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { useTheme } from 'emotion-theming';
import debugFactory from 'debug';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@automattic/react-i18n';
import { CardCvcElement, CardExpiryElement } from 'react-stripe-elements';
import {
	Button,
	usePaymentProcessor,
	useTransactionStatus,
	useLineItems,
	renderDisplayValueMarkdown,
	useEvents,
	useFormStatus,
	registerStore,
	useSelect,
	useDispatch,
} from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import { PaymentMethodLogos } from 'my-sites/checkout/composite-checkout/wpcom/components/payment-method-logos';
import {
	SummaryLine,
	SummaryDetails,
} from 'my-sites/checkout/composite-checkout/wpcom/components/summary-details';
import {
	LeftColumn,
	RightColumn,
} from 'my-sites/checkout/composite-checkout/wpcom/components/ie-fallback';
import {
	VisaLogo,
	MastercardLogo,
	AmexLogo,
} from 'my-sites/checkout/composite-checkout/wpcom/components/payment-logos';
import PaymentLogo from 'my-sites/checkout/composite-checkout/wpcom/components/payment-logo';
import { showStripeModalAuth } from 'lib/stripe';
import Spinner from 'my-sites/checkout/composite-checkout/wpcom/components/spinner';
import { isValid } from 'my-sites/checkout/composite-checkout/wpcom/types';
import ContactFields from './contact-fields';
import CreditCardNumberField from './credit-card-number-field';
import {
	GridRow,
	FieldRow,
	Label,
	LabelText,
	StripeFieldWrapper,
	StripeErrorMessage,
	CreditCardFieldsWrapper,
	CreditCardField,
} from './form-layout-components';
import CVVImage from './cvv-image';
import CreditCardLoading from './credit-card-loading';

const debug = debugFactory( 'calypso:composite-checkout:credit-card' );

export function createCreditCardPaymentMethodStore() {
	debug( 'creating a new credit card payment method store' );
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
		setFieldValue( key, value ) {
			return { type: 'FIELD_VALUE_SET', payload: { key, value } };
		},
	};

	const selectors = {
		getBrand( state ) {
			return state.brand || '';
		},
		getCardholderName( state ) {
			return state.cardholderName || '';
		},
		getCardDataErrors( state ) {
			return state.cardDataErrors;
		},
		getIncompleteFieldKeys( state ) {
			return Object.keys( state.cardDataComplete ).filter(
				( key ) => ! state.cardDataComplete[ key ]
			);
		},
		getFields( state ) {
			return state.fields;
		},
	};

	function fieldReducer( state = {}, action ) {
		switch ( action?.type ) {
			case 'FIELD_VALUE_SET':
				return {
					...state,
					[ action.payload.key ]: { value: action.payload.value, isTouched: true },
				};
			default:
				return state;
		}
	}

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

	function cardholderNameReducer( state = { value: '', isTouched: false }, action ) {
		switch ( action?.type ) {
			case 'CARDHOLDER_NAME_SET':
				return { value: action.payload, isTouched: true };
			default:
				return state;
		}
	}

	function brandReducer( state = null, action ) {
		switch ( action?.type ) {
			case 'BRAND_SET':
				return action.payload;
			default:
				return state;
		}
	}

	const store = registerStore( 'credit-card', {
		reducer(
			state = {
				fields: fieldReducer(),
				cardDataErrors: cardDataErrorsReducer(),
				cardDataComplete: cardDataCompleteReducer(),
				cardholderName: cardholderNameReducer(),
				brand: brandReducer(),
			},
			action
		) {
			return {
				fields: fieldReducer( state.fields, action ),
				cardDataErrors: cardDataErrorsReducer( state.cardDataErrors, action ),
				cardDataComplete: cardDataCompleteReducer( state.cardDataComplete, action ),
				cardholderName: cardholderNameReducer( state.cardholderName, action ),
				brand: brandReducer( state.brand, action ),
			};
		},
		actions,
		selectors,
	} );

	return { ...store, actions, selectors };
}

export function createCreditCardMethod( { store, stripe, stripeConfiguration } ) {
	return {
		id: 'card',
		label: <CreditCardLabel />,
		activeContent: (
			<CreditCardFields stripe={ stripe } stripeConfiguration={ stripeConfiguration } />
		),
		submitButton: (
			<CreditCardPayButton
				store={ store }
				stripe={ stripe }
				stripeConfiguration={ stripeConfiguration }
			/>
		),
		inactiveContent: <StripeSummary />,
		getAriaLabel: ( __ ) => __( 'Credit Card' ),
	};
}

function CreditCardFields() {
	const { __ } = useI18n();
	const theme = useTheme();
	const onEvent = useEvents();
	const [ isStripeFullyLoaded, setIsStripeFullyLoaded ] = useState( false );
	const cardholderName = useSelect( ( select ) => select( 'credit-card' ).getCardholderName() );
	const { cardCvc: cardCvcError, cardExpiry: cardExpiryError } = useSelect( ( select ) =>
		select( 'credit-card' ).getCardDataErrors()
	);
	const { changeCardholderName, changeBrand, setCardDataError, setCardDataComplete } = useDispatch(
		'credit-card'
	);
	const [ shouldShowContactFields, setShowContactFields ] = useState( false );

	const handleStripeFieldChange = ( input ) => {
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

	const fields = useSelect( ( select ) => select( 'credit-card' ).getFields() );
	const { setFieldValue } = useDispatch( 'credit-card' );
	const getField = ( key ) => fields[ key ] || {};
	const getFieldValue = ( key ) => getField( key ).value ?? '';
	const getErrorMessagesForField = ( key ) => {
		// TODO: do actual validation
		if ( ! isValid( getField( key ) ) ) {
			return [ __( 'This field is required.' ) ];
		}
		return [];
	};

	const stripeElementStyle = {
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

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<StripeFields className="credit-card-form-fields">
			{ ! isStripeFullyLoaded && <LoadingFields /> }

			<CreditCardFieldsWrapper isLoaded={ isStripeFullyLoaded }>
				<CreditCardField
					id="cardholder-name"
					type="Text"
					autoComplete="cc-name"
					label={ __( 'Cardholder name' ) }
					description={ __( "Enter your name as it's written on the card" ) }
					value={ cardholderName?.value ?? '' }
					onChange={ changeCardholderName }
					isError={ cardholderName?.isTouched && cardholderName?.value.length === 0 }
					errorMessage={ __( 'This field is required' ) }
				/>

				<FieldRow>
					<Label>
						<input
							type="checkbox"
							checked={ ! shouldShowContactFields }
							onChange={ ( event ) => setShowContactFields( ! event.target.checked ) }
						/>
						<LabelText>{ __( 'Credit card address is the same as contact details' ) }</LabelText>
					</Label>
				</FieldRow>

				{ shouldShowContactFields && (
					<ContactFields
						getField={ getField }
						getFieldValue={ getFieldValue }
						setFieldValue={ setFieldValue }
						getErrorMessagesForField={ getErrorMessagesForField }
					/>
				) }

				<FieldRow>
					<CreditCardNumberField
						setIsStripeFullyLoaded={ setIsStripeFullyLoaded }
						handleStripeFieldChange={ handleStripeFieldChange }
						stripeElementStyle={ stripeElementStyle }
						countryCode={ getFieldValue( 'countryCode' ) }
						getErrorMessagesForField={ getErrorMessagesForField }
						setFieldValue={ setFieldValue }
						getFieldValue={ getFieldValue }
					/>

					<FieldRow gap="4%" columnWidths="48% 48%">
						<LeftColumn>
							<Label>
								<LabelText>{ __( 'Expiry date' ) }</LabelText>
								<StripeFieldWrapper className="expiration-date" hasError={ cardExpiryError }>
									<CardExpiryElement
										style={ stripeElementStyle }
										onChange={ ( input ) => {
											handleStripeFieldChange( input );
										} }
									/>
								</StripeFieldWrapper>
								{ cardExpiryError && <StripeErrorMessage>{ cardExpiryError }</StripeErrorMessage> }
							</Label>
						</LeftColumn>
						<RightColumn>
							<Label>
								<LabelText>{ __( 'Security code' ) }</LabelText>
								<GridRow gap="4%" columnWidths="67% 29%">
									<LeftColumn>
										<StripeFieldWrapper className="cvv" hasError={ cardCvcError }>
											<CardCvcElement
												style={ stripeElementStyle }
												onChange={ ( input ) => {
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
				</FieldRow>
			</CreditCardFieldsWrapper>
		</StripeFields>
	);
}

const StripeFields = styled.div`
	position: relative;
`;

const LoadingIndicator = styled( Spinner )`
	position: absolute;
	right: 15px;
	top: 10px;

	.rtl & {
		right: auto;
		left: 15px;
	}
`;

function LoadingFields() {
	return (
		<React.Fragment>
			<LoadingIndicator />
			<CreditCardLoading />
		</React.Fragment>
	);
}

function CreditCardPayButton( { disabled, store, stripe, stripeConfiguration } ) {
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

function StripeSummary() {
	const cardholderName = useSelect( ( select ) => select( 'credit-card' ).getCardholderName() );
	const brand = useSelect( ( select ) => select( 'credit-card' ).getBrand() );

	return (
		<SummaryDetails>
			<SummaryLine>{ cardholderName?.value }</SummaryLine>
			<SummaryLine>
				{ brand !== 'unknown' && '****' } <PaymentLogo brand={ brand } isSummary={ true } />
			</SummaryLine>
		</SummaryDetails>
	);
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

function CreditCardLabel() {
	const { __ } = useI18n();
	return (
		<React.Fragment>
			<span>{ __( 'Credit or debit card' ) }</span>
			<CreditCardLogos />
		</React.Fragment>
	);
}

function CreditCardLogos() {
	return (
		<PaymentMethodLogos>
			<VisaLogo />
			<MastercardLogo />
			<AmexLogo />
		</PaymentMethodLogos>
	);
}


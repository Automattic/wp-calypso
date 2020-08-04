/**
 * External dependencies
 */
import React from 'react';
import debugFactory from 'debug';
import { useI18n } from '@automattic/react-i18n';
import { registerStore, useSelect } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import { PaymentMethodLogos } from 'my-sites/checkout/composite-checkout/wpcom/components/payment-method-logos';
import {
	SummaryLine,
	SummaryDetails,
} from 'my-sites/checkout/composite-checkout/wpcom/components/summary-details';
import {
	VisaLogo,
	MastercardLogo,
	AmexLogo,
} from 'my-sites/checkout/composite-checkout/wpcom/components/payment-logos';
import PaymentLogo from 'my-sites/checkout/composite-checkout/wpcom/components/payment-logo';
import CreditCardFields from './credit-card-fields';
import CreditCardPayButton from './credit-card-pay-button';
import { maskField } from 'lib/checkout';

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
		setFieldError( key, message ) {
			return { type: 'FIELD_ERROR_SET', payload: { key, message } };
		},
		touchAllFields() {
			return { type: 'TOUCH_ALL_FIELDS' };
		},
		setShowContactFields( payload ) {
			return { type: 'SHOW_CONTACT_FIELDS_SET', payload };
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
		getShowContactFields( state ) {
			return state.showContactFields || false;
		},
		getPaymentPartner( state ) {
			return state.paymentPartner;
		},
	};

	function fieldReducer( state = {}, action ) {
		switch ( action?.type ) {
			case 'FIELD_VALUE_SET':
				return {
					...state,
					[ action.payload.key ]: {
						value: maskField(
							action.payload.key,
							state[ action.payload.key ],
							action.payload.value
						),
						isTouched: true,
						errors: [],
					},
				};
			case 'FIELD_ERROR_SET': {
				return {
					...state,
					[ action.payload.key ]: {
						...state[ action.payload.key ],
						errors: [ action.payload.message ],
					},
				};
			}
			case 'TOUCH_ALL_FIELDS': {
				return Object.entries( state ).reduce( ( obj, [ key, value ] ) => {
					obj[ key ] = {
						value: value.value,
						isTouched: true,
					};
					return obj;
				}, {} );
			}
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

	function showContactFieldsReducer( state = null, action ) {
		switch ( action?.type ) {
			case 'SHOW_CONTACT_FIELDS_SET':
				return action.payload;
			default:
				return state;
		}
	}

	function shouldUseEbanx( state = null ) {
		if ( state?.fields?.countryCode?.value === 'BR' ) {
			return true;
		}
		return false;
	}

	// Which payment partner to use for submitting is a function of the form
	// state; we derive it in the reducer but do not allow directly changing it.
	// We need to have this data here (rather than just deriving it in the
	// processor function) so we can do the right thing in the submit button handler.
	function appendPaymentPartner( state = null ) {
		let paymentPartner = 'stripe';
		if ( shouldUseEbanx( state ) ) {
			paymentPartner = 'ebanx';
		}
		debug( 'credit card form selects payment partner: "' + paymentPartner + '"' );
		return { ...state, paymentPartner };
	}

	const store = registerStore( 'credit-card', {
		reducer(
			state = {
				fields: fieldReducer(),
				cardDataErrors: cardDataErrorsReducer(),
				cardDataComplete: cardDataCompleteReducer(),
				cardholderName: cardholderNameReducer(),
				brand: brandReducer(),
				showContactFields: showContactFieldsReducer(),
			},
			action
		) {
			return appendPaymentPartner( {
				fields: fieldReducer( state.fields, action ),
				cardDataErrors: cardDataErrorsReducer( state.cardDataErrors, action ),
				cardDataComplete: cardDataCompleteReducer( state.cardDataComplete, action ),
				cardholderName: cardholderNameReducer( state.cardholderName, action ),
				brand: brandReducer( state.brand, action ),
				showContactFields: showContactFieldsReducer( state.showContactFields, action ),
			} );
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
		inactiveContent: <CreditCardSummary />,
		getAriaLabel: ( __ ) => __( 'Credit Card' ),
	};
}

function CreditCardSummary() {
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

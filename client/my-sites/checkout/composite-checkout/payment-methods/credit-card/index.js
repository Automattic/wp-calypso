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

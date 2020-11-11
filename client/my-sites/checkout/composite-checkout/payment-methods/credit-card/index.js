/**
 * External dependencies
 */
import React from 'react';
import debugFactory from 'debug';
import { useI18n } from '@automattic/react-i18n';
import { registerStore, useSelect, PaymentLogo } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import { PaymentMethodLogos } from 'calypso/my-sites/checkout/composite-checkout/components/payment-method-logos';
import {
	SummaryLine,
	SummaryDetails,
} from 'calypso/my-sites/checkout/composite-checkout/components/summary-details';
import {
	VisaLogo,
	MastercardLogo,
	AmexLogo,
} from 'calypso/my-sites/checkout/composite-checkout/components/payment-logos';
import CreditCardFields from './credit-card-fields';
import CreditCardPayButton from './credit-card-pay-button';
import { maskField } from 'calypso/lib/checkout';

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
		setFieldValue( key, value ) {
			return { type: 'FIELD_VALUE_SET', payload: { key, value } };
		},
		setFieldError( key, message ) {
			return { type: 'FIELD_ERROR_SET', payload: { key, message } };
		},
		touchAllFields() {
			return { type: 'TOUCH_ALL_FIELDS' };
		},
	};

	const selectors = {
		getBrand( state ) {
			return state.brand || '';
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
				brand: brandReducer(),
			},
			action
		) {
			return {
				fields: fieldReducer( state.fields, action ),
				cardDataErrors: cardDataErrorsReducer( state.cardDataErrors, action ),
				cardDataComplete: cardDataCompleteReducer( state.cardDataComplete, action ),
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
	const fields = useSelect( ( select ) => select( 'credit-card' ).getFields() );
	const cardholderName = fields.cardholderName;
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
		<PaymentMethodLogos className="credit-card__logo payment-logos">
			<VisaLogo />
			<MastercardLogo />
			<AmexLogo />
		</PaymentMethodLogos>
	);
}

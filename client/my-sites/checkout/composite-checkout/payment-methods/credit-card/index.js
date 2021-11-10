import { PaymentLogo } from '@automattic/composite-checkout';
import { useSelect, registerStore } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import debugFactory from 'debug';
import { Fragment } from 'react';
import { maskField } from 'calypso/lib/checkout';
import {
	VisaLogo,
	MastercardLogo,
	AmexLogo,
} from 'calypso/my-sites/checkout/composite-checkout/components/payment-logos';
import { PaymentMethodLogos } from 'calypso/my-sites/checkout/composite-checkout/components/payment-method-logos';
import {
	SummaryLine,
	SummaryDetails,
} from 'calypso/my-sites/checkout/composite-checkout/components/summary-details';
import CreditCardFields from './credit-card-fields';
import CreditCardPayButton from './credit-card-pay-button';

const debug = debugFactory( 'calypso:composite-checkout:credit-card' );

export function createCreditCardPaymentMethodStore( {
	initialUseForAllSubscriptions,
	allowUseForAllSubscriptions,
} ) {
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
		setUseForAllSubscriptions( payload ) {
			return { type: 'USE_FOR_ALL_SUBSCRIPTIONS_SET', payload };
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
		useForAllSubscriptions( state ) {
			return state.useForAllSubscriptions;
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

	function allSubscriptionsReducer( state, action ) {
		switch ( action?.type ) {
			case 'USE_FOR_ALL_SUBSCRIPTIONS_SET':
				return action.payload;
			default:
				return state;
		}
	}

	function getInitialUseForAllSubscriptionsValue() {
		if ( ! allowUseForAllSubscriptions ) {
			return false;
		}
		if ( initialUseForAllSubscriptions !== undefined ) {
			return initialUseForAllSubscriptions;
		}
		return false;
	}

	const store = registerStore( 'credit-card', {
		reducer(
			state = {
				fields: fieldReducer(),
				cardDataErrors: cardDataErrorsReducer(),
				cardDataComplete: cardDataCompleteReducer(),
				brand: brandReducer(),
				useForAllSubscriptions: getInitialUseForAllSubscriptionsValue(),
			},
			action
		) {
			return {
				fields: fieldReducer( state.fields, action ),
				cardDataErrors: cardDataErrorsReducer( state.cardDataErrors, action ),
				cardDataComplete: cardDataCompleteReducer( state.cardDataComplete, action ),
				brand: brandReducer( state.brand, action ),
				useForAllSubscriptions: allowUseForAllSubscriptions
					? allSubscriptionsReducer( state.useForAllSubscriptions, action )
					: false,
			};
		},
		actions,
		selectors,
	} );

	return { ...store, actions, selectors };
}

export function createCreditCardMethod( {
	store,
	stripe,
	stripeConfiguration,
	shouldUseEbanx,
	shouldShowTaxFields,
	activePayButtonText,
	allowUseForAllSubscriptions,
} ) {
	return {
		id: 'card',
		label: <CreditCardLabel />,
		activeContent: (
			<CreditCardFields
				stripe={ stripe }
				stripeConfiguration={ stripeConfiguration }
				shouldUseEbanx={ shouldUseEbanx }
				shouldShowTaxFields={ shouldShowTaxFields }
				allowUseForAllSubscriptions={ allowUseForAllSubscriptions }
			/>
		),
		submitButton: (
			<CreditCardPayButton
				store={ store }
				stripe={ stripe }
				stripeConfiguration={ stripeConfiguration }
				shouldUseEbanx={ shouldUseEbanx }
				activeButtonText={ activePayButtonText }
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
		<Fragment>
			<span>{ __( 'Credit or debit card' ) }</span>
			<CreditCardLogos />
		</Fragment>
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

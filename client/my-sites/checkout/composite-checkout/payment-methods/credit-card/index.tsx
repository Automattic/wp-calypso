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
import type { StripeConfiguration } from '@automattic/calypso-stripe';
import type { StoreState, StoreStateValue } from '@automattic/wpcom-checkout';
import type { Stripe } from '@stripe/stripe-js';

const debug = debugFactory( 'calypso:composite-checkout:credit-card' );

type CardFieldState = StoreState< string >;
interface CardDataCompleteState {
	cardNumber: boolean;
	cardCvc: boolean;
	cardExpiry: boolean;
}
interface CardStoreState {
	brand: string | null | undefined;
	fields: CardFieldState;
	cardDataErrors: Record< string, string >;
	cardDataComplete: CardDataCompleteState;
	useForAllSubscriptions: boolean;
}
type CardStoreType = ReturnType< typeof registerStore >;

type CardStoreAction =
	| { type: 'BRAND_SET'; payload: string }
	| { type: 'CARD_DATA_ERROR_SET'; payload: { type: string; message: string } }
	| { type: 'CARD_DATA_COMPLETE_SET'; payload: { type: string; complete: boolean } }
	| { type: 'FIELD_VALUE_SET'; payload: { key: string; value: string } }
	| { type: 'FIELD_ERROR_SET'; payload: { key: string; message: string } }
	| { type: 'USE_FOR_ALL_SUBSCRIPTIONS_SET'; payload: boolean }
	| { type: 'TOUCH_ALL_FIELDS' };

const actions = {
	changeBrand( payload: string ) {
		return { type: 'BRAND_SET', payload };
	},
	setCardDataError( type: string, message: string ) {
		return { type: 'CARD_DATA_ERROR_SET', payload: { type, message } };
	},
	setCardDataComplete( type: string, complete: boolean ) {
		return { type: 'CARD_DATA_COMPLETE_SET', payload: { type, complete } };
	},
	setFieldValue( key: string, value: string ) {
		return { type: 'FIELD_VALUE_SET', payload: { key, value } };
	},
	setFieldError( key: string, message: string ) {
		return { type: 'FIELD_ERROR_SET', payload: { key, message } };
	},
	setUseForAllSubscriptions( payload: boolean ) {
		return { type: 'USE_FOR_ALL_SUBSCRIPTIONS_SET', payload };
	},
	touchAllFields() {
		return { type: 'TOUCH_ALL_FIELDS' };
	},
};

const selectors = {
	getBrand( state: CardStoreState ) {
		return state.brand || '';
	},
	getCardDataErrors( state: CardStoreState ) {
		return state.cardDataErrors;
	},
	getIncompleteFieldKeys( state: CardStoreState ): string[] {
		return Object.keys( state.cardDataComplete ).filter(
			( key ) => ! state.cardDataComplete[ key as keyof CardDataCompleteState ]
		);
	},
	getFields( state: CardStoreState ) {
		return state.fields;
	},
	useForAllSubscriptions( state: CardStoreState ) {
		return state.useForAllSubscriptions;
	},
};

export function createCreditCardPaymentMethodStore( {
	initialUseForAllSubscriptions,
	allowUseForAllSubscriptions,
}: {
	initialUseForAllSubscriptions?: boolean;
	allowUseForAllSubscriptions?: boolean;
} ): CardStoreType {
	debug( 'creating a new credit card payment method store' );

	function fieldReducer( state: CardFieldState = {}, action?: CardStoreAction ) {
		switch ( action?.type ) {
			case 'FIELD_VALUE_SET':
				return {
					...state,
					[ action.payload.key ]: {
						value: maskField(
							action.payload.key,
							state[ action.payload.key ].value,
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
				return Object.keys( state ).reduce(
					( obj: Record< string, StoreStateValue >, key: string ) => {
						obj[ key ] = {
							value: state[ key ].value,
							isTouched: true,
						};
						return obj;
					},
					{}
				);
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
		action?: CardStoreAction
	) {
		switch ( action?.type ) {
			case 'CARD_DATA_COMPLETE_SET':
				return { ...state, [ action.payload.type ]: action.payload.complete };
			default:
				return state;
		}
	}

	function cardDataErrorsReducer( state = {}, action?: CardStoreAction ) {
		switch ( action?.type ) {
			case 'CARD_DATA_ERROR_SET':
				return { ...state, [ action.payload.type ]: action.payload.message };
			default:
				return state;
		}
	}

	function brandReducer( state: string | null | undefined = null, action?: CardStoreAction ) {
		switch ( action?.type ) {
			case 'BRAND_SET':
				return action.payload;
			default:
				return state;
		}
	}

	function allSubscriptionsReducer( state: boolean, action?: CardStoreAction ) {
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

	return registerStore( 'credit-card', {
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
}

export function createCreditCardMethod( {
	store,
	stripe,
	stripeConfiguration,
	shouldUseEbanx,
	shouldShowTaxFields,
	activePayButtonText,
	allowUseForAllSubscriptions,
}: {
	store: CardStoreType;
	stripe: Stripe;
	stripeConfiguration: StripeConfiguration;
	shouldUseEbanx?: boolean;
	shouldShowTaxFields?: boolean;
	activePayButtonText?: string;
	allowUseForAllSubscriptions?: boolean;
} ) {
	return {
		id: 'card',
		paymentProcessorId: 'card',
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

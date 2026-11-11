import debugFactory from 'debug';
import { useSyncExternalStore } from 'react';
import { maskField } from 'calypso/lib/checkout';
import type {
	CardElementType,
	CardFieldState,
	CardStoreState,
	CardStoreType,
	StoreStateValue,
} from './types';

const debug = debugFactory( 'calypso:composite-checkout:credit-card' );

export function getIncompleteFieldKeys( state: CardStoreState ): CardElementType[] {
	return Object.keys( state.cardDataComplete ).filter(
		( key ) => ! state.cardDataComplete[ key as CardElementType ]
	) as CardElementType[];
}

/**
 * Subscribe a component to part of a credit card store's state.
 *
 * The selector must return a value that is referentially stable for an
 * unchanged state (eg: a property of the state, not a newly derived array or
 * object), or the component will re-render forever.
 */
export function useCreditCardStoreState< T >(
	store: CardStoreType,
	selector: ( state: CardStoreState ) => T
): T {
	return useSyncExternalStore( store.subscribe, () => selector( store.getState() ) );
}

export function createCreditCardPaymentMethodStore( {
	initialUseForAllSubscriptions,
	allowUseForAllSubscriptions,
}: {
	initialUseForAllSubscriptions?: boolean;
	allowUseForAllSubscriptions?: boolean;
} ): CardStoreType {
	debug( 'creating a new credit card payment method store' );

	let state: CardStoreState = {
		fields: {},
		cardDataErrors: {},
		cardDataComplete: {
			cardNumber: false,
			cardCvc: false,
			cardExpiry: false,
		},
		brand: null,
		useForAllSubscriptions: allowUseForAllSubscriptions
			? ( initialUseForAllSubscriptions ?? false )
			: false,
		useForBusiness: undefined,
		formSubmitAttempted: false,
	};

	let subscribers: Array< () => void > = [];

	function setState( newState: Partial< CardStoreState > ): void {
		state = { ...state, ...newState };
		subscribers.forEach( ( subscriber ) => subscriber() );
	}

	function setFields( fields: CardFieldState ): void {
		setState( { fields } );
	}

	return {
		getState: () => state,

		subscribe: ( callback ) => {
			subscribers.push( callback );
			return () => {
				subscribers = subscribers.filter( ( subscriber ) => subscriber !== callback );
			};
		},

		changeBrand: ( brand ) => setState( { brand } ),

		setCardDataError: ( type, message ) =>
			setState( { cardDataErrors: { ...state.cardDataErrors, [ type ]: message } } ),

		setCardDataComplete: ( type, complete ) =>
			setState( { cardDataComplete: { ...state.cardDataComplete, [ type ]: complete } } ),

		setFieldValue: ( key, value ) =>
			setFields( {
				...state.fields,
				[ key ]: {
					value: maskField( key, state.fields[ key ]?.value, value ),
					isTouched: true,
					errors: [],
				},
			} ),

		setFieldError: ( key, message ) =>
			setFields( {
				...state.fields,
				[ key ]: {
					...state.fields[ key ],
					errors: [ message ],
				},
			} ),

		setUseForAllSubscriptions: ( useForAllSubscriptions ) =>
			setState( {
				useForAllSubscriptions: allowUseForAllSubscriptions ? useForAllSubscriptions : false,
			} ),

		setForBusinessUse: ( useForBusiness ) => setState( { useForBusiness } ),

		touchAllFields: () =>
			setFields(
				Object.keys( state.fields ).reduce(
					( obj: Record< string, StoreStateValue >, key: string ) => {
						obj[ key ] = {
							value: state.fields[ key ].value,
							isTouched: true,
						};
						return obj;
					},
					{}
				)
			),

		setFormSubmitAttempted: ( formSubmitAttempted ) => setState( { formSubmitAttempted } ),
	};
}

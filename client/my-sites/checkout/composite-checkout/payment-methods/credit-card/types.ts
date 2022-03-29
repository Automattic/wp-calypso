import type { StoreState } from '@automattic/wpcom-checkout';
import type { Store } from '@wordpress/data';

export type CardFieldState = StoreState< string >;

export interface CardDataCompleteState {
	cardNumber: boolean;
	cardCvc: boolean;
	cardExpiry: boolean;
}

export interface CardStoreState {
	brand: string | null | undefined;
	fields: CardFieldState;
	cardDataErrors: Record< string, string | null >;
	cardDataComplete: CardDataCompleteState;
	useForAllSubscriptions: boolean;
}

export type CardStoreType = Store< CardStoreState, CardStoreAction >;

export type CardStoreAction =
	| { type: 'BRAND_SET'; payload: string }
	| { type: 'CARD_DATA_ERROR_SET'; payload: { type: string; message: string | null } }
	| { type: 'CARD_DATA_COMPLETE_SET'; payload: { type: string; complete: boolean } }
	| { type: 'FIELD_VALUE_SET'; payload: { key: string; value: string } }
	| { type: 'FIELD_ERROR_SET'; payload: { key: string; message: string } }
	| { type: 'USE_FOR_ALL_SUBSCRIPTIONS_SET'; payload: boolean }
	| { type: 'TOUCH_ALL_FIELDS' };

export type StripeFieldChangeInput =
	| {
			elementType: 'cardNumber';
			brand: string;
			complete: boolean;
			error?: { message: string };
	  }
	| {
			elementType: 'cardCvc';
			complete: boolean;
			error?: { message: string };
	  }
	| {
			elementType: 'cardExpiry';
			complete: boolean;
			error?: { message: string };
	  };

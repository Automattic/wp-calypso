import type { StoreState } from '@automattic/wpcom-checkout';
import type { Store } from '@wordpress/data';

export type CardFieldState = StoreState< string >;

export type CardDataCompleteState = Record< CardElementType, boolean >;

export interface CardStoreState {
	brand: string | null | undefined;
	fields: CardFieldState;
	cardDataErrors: Record< string, string | null >;
	cardDataComplete: CardDataCompleteState;
	useForAllSubscriptions: boolean;
}

export type CardStoreType = Store< CardStoreState, CardStoreAction >;

export type CardNumberElementType = 'cardNumber';
export type CardExpiryElementType = 'cardExpiry';
export type CardCvcElementType = 'cardCvc';
export type CardElementType = CardNumberElementType | CardExpiryElementType | CardCvcElementType;

export type CardStoreAction =
	| { type: 'BRAND_SET'; payload: string }
	| { type: 'CARD_DATA_ERROR_SET'; payload: { type: CardElementType; message: string | null } }
	| { type: 'CARD_DATA_COMPLETE_SET'; payload: { type: CardElementType; complete: boolean } }
	| { type: 'FIELD_VALUE_SET'; payload: { key: string; value: string } }
	| { type: 'FIELD_ERROR_SET'; payload: { key: string; message: string } }
	| { type: 'USE_FOR_ALL_SUBSCRIPTIONS_SET'; payload: boolean }
	| { type: 'TOUCH_ALL_FIELDS' };

export type StripeFieldChangeInput =
	| {
			elementType: CardNumberElementType;
			brand: string;
			complete: boolean;
			error?: { message: string };
	  }
	| {
			elementType: CardCvcElementType;
			complete: boolean;
			error?: { message: string };
	  }
	| {
			elementType: CardExpiryElementType;
			complete: boolean;
			error?: { message: string };
	  };

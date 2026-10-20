export interface StoreStateValue {
	value: string;
	isTouched: boolean;
	errors?: string[];
}

export type StoreState< N extends string > = Record< N, StoreStateValue >;

export type CardFieldState = Record< string, StoreStateValue >;

export type CardDataCompleteState = Record< CardElementType, boolean >;

export interface CardStoreState {
	brand: string | null | undefined;
	fields: CardFieldState;
	cardDataErrors: Record< string, string | null >;
	cardDataComplete: CardDataCompleteState;
	useForAllSubscriptions: boolean;
	useForBusiness: boolean | undefined;
	formSubmitAttempted: boolean;
}

export interface CardStoreType {
	getState(): CardStoreState;
	subscribe( callback: () => void ): () => void;
	changeBrand( brand: string ): void;
	setCardDataError( type: CardElementType, message: string | null ): void;
	setCardDataComplete( type: CardElementType, complete: boolean ): void;
	setFieldValue( key: string, value: string ): void;
	setFieldError( key: string, message: string ): void;
	setUseForAllSubscriptions( useForAllSubscriptions: boolean ): void;
	setForBusinessUse( useForBusiness: boolean ): void;
	touchAllFields(): void;
	setFormSubmitAttempted( formSubmitAttempted: boolean ): void;
}

export type CardNumberElementType = 'cardNumber';
export type CardExpiryElementType = 'cardExpiry';
export type CardCvcElementType = 'cardCvc';
export type CardElementType = CardNumberElementType | CardExpiryElementType | CardCvcElementType;

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

export interface StoreStateValue {
	value: string;
	isTouched: boolean;
	errors?: string[];
}

export type StoreState< N extends string > = Record< N, StoreStateValue >;

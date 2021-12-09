import { registerStore } from '@wordpress/data';

export interface StoreStateValue {
	value: string;
	isTouched: boolean;
}

type AddStateArg< F, S > = F extends ( ...args: infer P ) => infer R
	? ( store: S, ...args: P ) => R
	: never;

type AddStateArgs< O, S > = {
	[ K in keyof O ]: AddStateArg< O[ K ], S >;
};

type Getters< K extends string > = Record< K, () => StoreStateValue >;

type PrependVerb< V extends string, K extends string > = `${ V }${ Capitalize< K > }`;

export type StoreSelectors< N extends string > = Getters< PrependVerb< 'get', N > >;

export type StoreSelectorsWithState< N extends string > = AddStateArgs<
	StoreSelectors< N >,
	StoreState< N >
>;

export type StoreState< N extends string > = Record< N, StoreStateValue >;

export type StoreAction = { type: string; payload: string };

export type StoreActions< N extends string > = Record<
	PrependVerb< 'change', N >,
	( payload: string ) => StoreAction
>;

export interface PaymentMethodStore< N extends string > extends ReturnType< typeof registerStore > {
	getState: () => StoreState< N >;
}

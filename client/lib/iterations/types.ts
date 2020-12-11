export interface Config< T extends string > {
	extends?: T;
}

export type IterationGetter< T extends string > = ( ...args: unknown[] ) => T;
export type IterationConfig< T extends string > = Record< T, Config< T > >;
export type IterationMap< T extends string, U > = {
	[ index in T ]?: U;
};
export type IterationValueGetter< T extends string > = < U >(
	arg0: IterationMap< T, U >
) => U | undefined;

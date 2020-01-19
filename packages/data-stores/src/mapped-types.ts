/**
 * Mapped types
 *
 * This module should only contain mapped types, operations useful in the type system
 * that do not produce any runtime code.
 *
 * Mapped types can be thought of as functions in the type system, they accept some type
 * argument and transform it to another type.
 *
 * @see https://www.typescriptlang.org/docs/handbook/advanced-types.html#mapped-types
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Maps a "raw" selector object to the selectors available when registered on the @wordpress/data store.
 *
 * @template S Selector map, usually from `import * as selectors from './my-store/selectors';`
 */
export type SelectFromMap< S extends Record< string, ( ...args: any[] ) => any > > = {
	[ selector in keyof S ]: (
		...args: TailParameters< S[ selector ] >
	) => ReturnType< S[ selector ] >;
};

/**
 * Maps a "raw" actionCreators object to the actions available when registered on the @wordpress/data store.
 *
 * @template A Selector map, usually from `import * as actions from './my-store/actions';`
 */
export type DispatchFromMap< A extends Record< string, ( ...args: any[] ) => any > > = {
	[ actionCreator in keyof A ]: ( ...args: Parameters< A[ actionCreator ] > ) => void;
};

/**
 * Parameters type of a function, excluding the first parameter.
 *
 * This is useful for typing some @wordpres/data functions that make a leading
 * `state` argument implicit.
 */
export type TailParameters< F extends ( head: any, ...tail: any[] ) => any > = F extends (
	head: any,
	...tail: infer PS
) => any
	? PS
	: never;

type ExcludeNonFunctions< T > = T extends ( ...args: any[] ) => any ? T : never;
type ExcludeNonActions< T > = T extends { type: any } ? T : never;

/**
 * Defines a type that describes all actions returned by action creators. Can be
 * used to type the second parameter of a reducer function.
 *
 * Usage:
 *   import * as Actions from './actions';
 *   type ActionTypes = ActionsDefinedInModule< typeof Actions >;
 *
 * @template ActionCreators type of a TypeScript module where action creators are defined
 */
export type ActionsDefinedInModule< ActionCreators > = ExcludeNonActions<
	ReturnType< ExcludeNonFunctions< ActionCreators[ keyof ActionCreators ] > >
>;

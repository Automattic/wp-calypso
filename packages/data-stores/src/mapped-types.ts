/**
 * External dependencies
 */
import { FunctionKeys } from 'utility-types';

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
export type SelectFromMap< S extends object > = {
	[ selector in FunctionKeys< S > ]: (
		...args: TailParameters< S[ selector ] >
	) => ReturnType< S[ selector ] >;
};

/**
 * Maps a "raw" actionCreators object to the actions available when registered on the @wordpress/data store.
 *
 * @template A Selector map, usually from `import * as actions from './my-store/actions';`
 */
export type DispatchFromMap< A extends Record< string, ( ...args: any[] ) => any > > = {
	[ actionCreator in keyof A ]: (
		...args: Parameters< A[ actionCreator ] >
	) => A[ actionCreator ] extends ( ...args: any[] ) => Generator
		? Promise< GeneratorReturnType< A[ actionCreator ] > >
		: void;
};

/**
 * Parameters type of a function, excluding the first parameter.
 *
 * This is useful for typing some @wordpres/data functions that make a leading
 * `state` argument implicit.
 */
export type TailParameters< F extends Function > = F extends ( head: any, ...tail: infer T ) => any
	? T
	: never;

/**
 * Obtain the type finally returned by the generator when it's done iterating.
 */
export type GeneratorReturnType< T extends ( ...args: any[] ) => Generator > = T extends (
	...args: any
) => Generator< any, infer R, any >
	? R
	: never;

/**
 * External dependencies
 */

import { find, forEach as iterate, get, map as collect } from 'lodash';

/*
 * Returns a function that checks for props that have a truthy `propkey` (uses lodash/object/get
 * to check for key). Example:
 *
 * const nameExists = propExists( 'name' )
 * nameExists( { name: 'Gabrielle' } ) // => Gabrielle
 * nameExists( { name: true } ) // true
 * nameExists( {} ) // null
 * nameExists() // null
 */
export const propExists = ( propKey ) => ( props ) => get( props, propKey );
export const prop = propExists;

/*
 * Returns a function that returns true if `propKey` of props is equal to `propValue` (uses ===).
 *
 * const userNameIsSam = propEquals( 'user.name', 'Sam' )
 * const userNameIsSam( { user: { name: 'Sam' } } ) // => true
 * const userNameIsSam( { user: { name: 'Frodo' } } ) // => false
 * const userNameIsSam() // => false
 */
export const propEquals = ( propKey, propValue ) => ( props ) =>
	get( props, propKey ) === propValue;

/*
 * Returns a function that calls condition and checks for truthiness and calls `ifTrue`, other wise calls
 * `ifFalse` which defaults to a function that returns `null`. Example:
 *
 * const logRealNumbers = when(
 *		( msg ) => /^[\d]+$/.test( msg ),
 *		console.log.bind( console, 'is a real number' ),
 *		console.log.bind( console, 'is not a real number' )
 * )
 *
 * logRealNumbers( 5.1 ) // => 5.1 'is not a real number'
 * logReslNumbers( 5 ) // => 5 'is a real number'
 */
export const when = ( condition, ifTrue, ifFalse = () => null ) => ( ...args ) =>
	condition( ...args ) ? ifTrue( ...args ) : ifFalse( ...args );

/*
 * Returns the result of the first function to return a truthy value
 */

export const first = ( ...fns ) => ( ...args ) => {
	let i, result;
	for ( i = 0; i < fns.length; i++ ) {
		result = fns[ i ]( ...args );
		if ( result ) {
			return result;
		}
	}
};

/*
 * Returns a function that returns true if any of the provided `fns` return a truthy value. Example:
 *
 * const oddOrLessThan10 = any(
 *		( n ) => n % 2 === 1,
 *		( n ) => n < 10
 * )
 *
 * oddOrLessThan10( 15 ) // => true
 * oddOrLessThan10( 8 ) // => true
 * oddOrLessThan10( 12 ) // => false
 */
export const any = ( ...fns ) => ( ...args ) => find( fns, ( fn ) => fn( ...args ) );

/*
 * Returns a function that returns true when all provided functions return a truthy value. Example:
 *
 * const lessThan10AndGreaterThan4AndEven = all(
 *		( n ) => n < 10,
 *		( n ) => n > 4,
 *		( n ) => n % 2 === 0
 * )
 * lessThan10AndGreaterThan2AndEven( 7 ) // => false
 * lessThan10AndGreaterThan2AndEven( 8 ) // => true
 * lessThan10AndGreaterThan2AndEven( 2 ) // => false
 */
export const all = ( ...fns ) => ( ...args ) => ! find( fns, ( fn ) => ! fn( ...args ) );

// Returns a function that calls each of fns
export const forEach = ( ...fns ) => ( ...args ) => iterate( fns, ( fn ) => fn( ...args ) );

/*
 * Returns a function that iterates through each function and calls it and returns each value. Example:
 *
 *	const log = console.log.bind( console )
 *	const maths = each(
 *		( n ) => n * 2
 *		( n ) => n + 2
 *	)
 *
 *  maths( 3 )
 *  // => [ 6, 5 ]
 */
export const map = ( ...fns ) => ( ...args ) => collect( fns, ( fn ) => fn( ...args ) );

export const compose = ( ...fns ) => ( ...args ) => {
	const [ head, ...rest ] = fns;
	return rest.reduce( ( result, fn ) => fn( result ), head( ...args ) );
};

/*
 * Returns a function that calls the provided method with the given args as arguments on
 * the first argument given to the returned function.
 *
 * Example:
 *
 *	document.querySelector( 'a' ).addEventListener( 'click', call( 'preventDefault', true ) );
 *
 * Is functionaly equivalent to:
 *
 *	document.querySelector( 'a' ).addEventListener( 'click', ( e ) => e.preventDefault( true ) );
 */
export const call = ( method, ...args ) => ( obj ) => obj[ method ].apply( obj, args );

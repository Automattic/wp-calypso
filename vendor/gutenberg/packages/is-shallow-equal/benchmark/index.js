'use strict';

const Benchmark = require( 'benchmark' );

const suite = new Benchmark.Suite;

const beforeObject = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7 };
const afterObjectSame = beforeObject;
const afterObjectEqual = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7 };
const afterObjectUnequal = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 'Unequal', g: 7 };
const beforeArray = [ 1, 2, 3, 4, 5, 6, 7 ];
const afterArraySame = beforeArray;
const afterArrayEqual = [ 1, 2, 3, 4, 5, 6, 7 ];
const afterArrayUnequal = [ 1, 2, 3, 4, 5, 'Unequal', 7 ];

[
	[ '@wordpress/is-shallow-equal (type specific)', require( '../objects' ), require( '../arrays' ) ],
	[ '@wordpress/is-shallow-equal', require( '../' ) ],
	[ 'shallowequal', require( 'shallowequal' ) ],
	[ 'shallow-equal (type specific)', require( 'shallow-equal/objects' ), require( 'shallow-equal/arrays' ) ],
	[ 'is-equal-shallow', require( 'is-equal-shallow' ) ],
	[ 'shallow-equals', require( 'shallow-equals' ) ],
	[ 'fbjs/lib/shallowEqual', require( 'fbjs/lib/shallowEqual' ) ],
].forEach( ( [ name, isShallowEqualObjects, isShallowEqualArrays = isShallowEqualObjects ] ) => {
	suite.add( name + ' (object, equal)', () => {
		isShallowEqualObjects( beforeObject, afterObjectEqual );
	} );

	suite.add( name + ' (object, same)', () => {
		isShallowEqualObjects( beforeObject, afterObjectSame );
	} );

	suite.add( name + ' (object, unequal)', () => {
		isShallowEqualObjects( beforeObject, afterObjectUnequal );
	} );

	suite.add( name + ' (array, equal)', () => {
		isShallowEqualArrays( beforeArray, afterArrayEqual );
	} );

	suite.add( name + ' (array, same)', () => {
		isShallowEqualArrays( beforeArray, afterArraySame );
	} );

	suite.add( name + ' (array, unequal)', () => {
		isShallowEqualArrays( beforeArray, afterArrayUnequal );
	} );
} );

suite
	// eslint-disable-next-line no-console
	.on( 'cycle', ( event ) => console.log( event.target.toString() ) )
	.run( { async: true } );

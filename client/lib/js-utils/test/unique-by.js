/**
 * Internal dependencies
 */
import uniqueBy from '../unique-by';

describe( 'uniqueBy()', () => {
	test( 'should remove duplicate values by identity by default (numbers)', () => {
		const values = [ 1, 2, 3, 1, 2, 4 ];
		expect( uniqueBy( values ) ).toEqual( [ 1, 2, 3, 4 ] );
	} );

	test( 'should remove duplicate values by identity by default (strings)', () => {
		const values = [ 'a', 'b', 'c', 'd', 'a', 'b' ];
		expect( uniqueBy( values ) ).toEqual( [ 'a', 'b', 'c', 'd' ] );
	} );

	test( 'should remove duplicate values by identity by default (mixed numbers & strings)', () => {
		const values = [ 1, 2, 'a', 'b', 1, 2, 'c', 'a' ];
		expect( uniqueBy( values ) ).toEqual( [ 1, 2, 'a', 'b', 'c' ] );
	} );

	test( 'should be able to handle `null` and `undefined` values', () => {
		const values = [ null, null, undefined, undefined ];
		expect( uniqueBy( values ) ).toEqual( [ null, undefined ] );
	} );

	test( 'should not remove anything if there are no duplicates', () => {
		const values = [ 1, 2, 'a', 'b' ];
		expect( uniqueBy( values ) ).toEqual( [ 1, 2, 'a', 'b' ] );
	} );

	test( 'should accept a custom compare function (String.trim)', () => {
		const values = [ 'a', 'a ', ' a ', ' a', '  a' ];
		const compare = ( a, b ) => a.trim() === b.trim();
		expect( uniqueBy( values, compare ) ).toEqual( [ 'a' ] );
	} );

	test( 'should accept a custom compare function (parseInt)', () => {
		const values = [ 1, '1', 2, 3, '3' ];
		const compare = ( a, b ) => parseInt( a ) === parseInt( b );
		expect( uniqueBy( values, compare ) ).toEqual( [ 1, 2, 3 ] );
	} );

	test( 'should accept a custom compare function (objects)', () => {
		const values = [ { ID: 1 }, { ID: 1 }, { ID: 2 }, { ID: 3 } ];
		const compare = ( a, b ) => a.ID === b.ID;
		expect( uniqueBy( values, compare ) ).toEqual( [ { ID: 1 }, { ID: 2 }, { ID: 3 } ] );
	} );

	test( 'should return a new (shallow) array', () => {
		const values = [ 1, '2', { ID: 1 } ];
		expect( uniqueBy( values ) ).not.toBe( values );
		expect( uniqueBy( values )[ 2 ] ).toBe( values[ 2 ] );
	} );
} );

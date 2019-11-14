/**
 * Internal dependencies
 */
import addQueryArgs from '../add-query-args';

describe( '#addQueryArgs()', () => {
	test( 'should error when args is not an object', () => {
		const types = [ undefined, 1, true, [], 'test', function() {} ];

		types.forEach( type => {
			expect( () => {
				addQueryArgs( type );
			} ).toThrow( Error );
		} );
	} );

	test( 'should error when url is not a string', () => {
		const types = [ {}, undefined, 1, true, [], function() {} ];

		types.forEach( type => {
			expect( () => {
				addQueryArgs( {}, type );
			} ).toThrow( Error );
		} );
	} );

	test( 'should return same URL with ending slash if passed empty object for args', () => {
		const url = addQueryArgs( {}, 'https://wordpress.com' );
		expect( url ).toBe( 'https://wordpress.com/' );
	} );

	test( 'should add query args when URL has no args', () => {
		const url = addQueryArgs( { foo: 'bar' }, 'https://wordpress.com' );
		expect( url ).toBe( 'https://wordpress.com/?foo=bar' );
	} );

	test( 'should persist existing query args and add new args', () => {
		const url = addQueryArgs( { foo: 'bar' }, 'https://wordpress.com?search=test' );
		expect( url ).toBe( 'https://wordpress.com/?search=test&foo=bar' );
	} );

	test( 'should add an empty string for a query arg with an empty string', () => {
		const url = addQueryArgs( { foo: 'bar', baz: '' }, 'https://wordpress.com?search=test' );
		expect( url ).toBe( 'https://wordpress.com/?search=test&foo=bar&baz=' );
	} );

	test( 'should not include a query arg with a null value', () => {
		const url = addQueryArgs( { foo: 'bar', baz: null }, 'https://wordpress.com?search=test' );
		expect( url ).toBe( 'https://wordpress.com/?search=test&foo=bar' );
	} );

	test( 'should not include a query arg with an undefined value', () => {
		const url = addQueryArgs( { foo: 'bar', baz: undefined }, 'https://wordpress.com?search=test' );
		expect( url ).toBe( 'https://wordpress.com/?search=test&foo=bar' );
	} );
} );

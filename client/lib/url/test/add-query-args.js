/**
 * Internal dependencies
 */
import addQueryArgs from '../add-query-args';

describe( '#addQueryArgs()', () => {
	test( 'should error when args is not an object', () => {
		const types = [ undefined, 1, true, [], 'test', function () {} ];

		types.forEach( ( type ) => {
			expect( () => {
				addQueryArgs( type );
			} ).toThrow( Error );
		} );
	} );

	test( 'should error when url is not a string', () => {
		const types = [ {}, undefined, 1, true, [], function () {} ];

		types.forEach( ( type ) => {
			expect( () => {
				addQueryArgs( {}, type );
			} ).toThrow( Error );
		} );
	} );

	test( 'should return same URL if passed empty object for args', () => {
		expect( addQueryArgs( {}, 'https://wordpress.com/' ) ).toBe( 'https://wordpress.com/' );
		expect( addQueryArgs( {}, '//wordpress.com/' ) ).toBe( '//wordpress.com/' );
		expect( addQueryArgs( {}, '/' ) ).toBe( '/' );
		expect( addQueryArgs( {}, '' ) ).toBe( '' );
	} );

	test( 'should add query args when URL has no args', () => {
		expect( addQueryArgs( { foo: 'bar' }, 'https://wordpress.com/' ) ).toBe(
			'https://wordpress.com/?foo=bar'
		);
		expect( addQueryArgs( { foo: 'bar' }, '//wordpress.com/' ) ).toBe( '//wordpress.com/?foo=bar' );
		expect( addQueryArgs( { foo: 'bar' }, '/' ) ).toBe( '/?foo=bar' );
		expect( addQueryArgs( { foo: 'bar' }, 'path' ) ).toBe( 'path?foo=bar' );
	} );

	test( 'should add query args when URL has no args but has a hash', () => {
		expect( addQueryArgs( { foo: 'bar' }, 'https://wordpress.com/#hash' ) ).toBe(
			'https://wordpress.com/?foo=bar#hash'
		);
		expect( addQueryArgs( { foo: 'bar' }, '//wordpress.com/#hash' ) ).toBe(
			'//wordpress.com/?foo=bar#hash'
		);
		expect( addQueryArgs( { foo: 'bar' }, '/#hash' ) ).toBe( '/?foo=bar#hash' );
		expect( addQueryArgs( { foo: 'bar' }, 'path#hash' ) ).toBe( 'path?foo=bar#hash' );
	} );

	test( 'should persist existing query args and add new args', () => {
		expect( addQueryArgs( { foo: 'bar' }, 'https://wordpress.com/?search=test' ) ).toBe(
			'https://wordpress.com/?search=test&foo=bar'
		);
		expect( addQueryArgs( { foo: 'bar' }, '//wordpress.com/?search=test' ) ).toBe(
			'//wordpress.com/?search=test&foo=bar'
		);
		expect( addQueryArgs( { foo: 'bar' }, '/?search=test' ) ).toBe( '/?search=test&foo=bar' );
		expect( addQueryArgs( { foo: 'bar' }, 'path?search=test' ) ).toBe( 'path?search=test&foo=bar' );
	} );

	test( 'should add an empty string for a query arg with an empty string', () => {
		expect( addQueryArgs( { foo: 'bar', baz: '' }, 'https://wordpress.com/?search=test' ) ).toBe(
			'https://wordpress.com/?search=test&foo=bar&baz='
		);
		expect( addQueryArgs( { foo: 'bar', baz: '' }, '//wordpress.com/?search=test' ) ).toBe(
			'//wordpress.com/?search=test&foo=bar&baz='
		);
		expect( addQueryArgs( { foo: 'bar', baz: '' }, '/?search=test' ) ).toBe(
			'/?search=test&foo=bar&baz='
		);
		expect( addQueryArgs( { foo: 'bar', baz: '' }, 'path?search=test' ) ).toBe(
			'path?search=test&foo=bar&baz='
		);
	} );

	test( 'should not include a query arg with a null value', () => {
		expect( addQueryArgs( { foo: 'bar', baz: null }, 'https://wordpress.com/?search=test' ) ).toBe(
			'https://wordpress.com/?search=test&foo=bar'
		);
		expect( addQueryArgs( { foo: 'bar', baz: null }, '//wordpress.com/?search=test' ) ).toBe(
			'//wordpress.com/?search=test&foo=bar'
		);
		expect( addQueryArgs( { foo: 'bar', baz: null }, '/?search=test' ) ).toBe(
			'/?search=test&foo=bar'
		);
		expect( addQueryArgs( { foo: 'bar', baz: null }, 'path?search=test' ) ).toBe(
			'path?search=test&foo=bar'
		);
	} );

	test( 'should not include a query arg with an undefined value', () => {
		expect(
			addQueryArgs( { foo: 'bar', baz: undefined }, 'https://wordpress.com/?search=test' )
		).toBe( 'https://wordpress.com/?search=test&foo=bar' );
		expect( addQueryArgs( { foo: 'bar', baz: undefined }, '//wordpress.com/?search=test' ) ).toBe(
			'//wordpress.com/?search=test&foo=bar'
		);
		expect( addQueryArgs( { foo: 'bar', baz: undefined }, '/?search=test' ) ).toBe(
			'/?search=test&foo=bar'
		);
		expect( addQueryArgs( { foo: 'bar', baz: undefined }, 'path?search=test' ) ).toBe(
			'path?search=test&foo=bar'
		);
	} );
} );

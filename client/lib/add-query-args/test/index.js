/**
 * External dependencies
 */
import chai from 'chai';

/**
 * Internal Dependencies
 */
import addQueryArgs from '../';

describe( '#addQueryArgs()', () => {
	it( 'should error when args is not an object', () => {
		var types = [
			undefined,
			1,
			true,
			[],
			'test',
			function() {}
		];

		types.forEach( type => {
			chai.expect( () => {
				addQueryArgs( type );
			} ).to.throw( Error );
		} );
	} );

	it( 'should error when url is not a string', () => {
		var types = [
			{},
			undefined,
			1,
			true,
			[],
			function() {}
		];

		types.forEach( type => {
			chai.expect( () => {
				addQueryArgs( {}, type );
			} ).to.throw( Error );
		} );
	} );

	it( 'should return same URL with ending slash if passed empty object for args', () => {
		const url = addQueryArgs( {}, 'https://wordpress.com' );
		chai.expect( url ).to.eql( 'https://wordpress.com/' );
	} );

	it( 'should add query args when URL has no args', () => {
		const url = addQueryArgs( { foo: 'bar' }, 'https://wordpress.com' );
		chai.expect( url ).to.eql( 'https://wordpress.com/?foo=bar' );
	} );

	it( 'should persist existing query args and add new args', () => {
		const url = addQueryArgs( { foo: 'bar' }, 'https://wordpress.com?search=test' );
		chai.expect( url ).to.eql( 'https://wordpress.com/?search=test&foo=bar' );
	} );
} );

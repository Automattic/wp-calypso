/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import safeProtocolUrl from '../';

describe( 'index', function() {
	it( 'should ignore a relative url', function() {
		expect( safeProtocolUrl( '/foo' ) ).to.eql( '/foo' );
	} );

	it( 'should return null for empty url', function() {
		const returnUndefined = function() {
			return;
		};

		expect( safeProtocolUrl( null ) ).to.eql( null );
		expect( safeProtocolUrl( returnUndefined() ) ).to.eql( null );
		expect( safeProtocolUrl( '' ) ).to.eql( null );
	} );

	it( 'should not change url if http protocol', function() {
		expect( safeProtocolUrl( 'http://foo.com' ) ).to.eql( 'http://foo.com' );
		expect( safeProtocolUrl( 'http://foo.com?query=string#id' ) ).to.eql( 'http://foo.com?query=string#id' );
	} );

	it( 'should not change url https protocol', function() {
		expect( safeProtocolUrl( 'https://foo.com' ) ).to.eql( 'https://foo.com' );
		expect( safeProtocolUrl( 'http://foo.com?query=string#id' ) ).to.eql( 'http://foo.com?query=string#id' );
	} );

	it( 'should not strip query args', function() {
		expect( safeProtocolUrl( 'https://foo.com?query=string' ) ).to.eql( 'https://foo.com?query=string' );
		expect( safeProtocolUrl( 'https://foo.com?query=string&again=2' ) ).to.eql( 'https://foo.com?query=string&again=2' );
	} );

	it( 'should not strip query hash', function() {
		expect( safeProtocolUrl( 'https://foo.com#id' ) ).to.eql( 'https://foo.com#id' );
		expect( safeProtocolUrl( 'https://foo.com?query=string#id' ) ).to.eql( 'https://foo.com?query=string#id' );
	} );

	it( 'should make url with javascript protocol safe', function() {
		expect( safeProtocolUrl( 'javascript:function()' ) ).to.eql( 'http:' ); // eslint-disable-line no-script-url
	} );
} );

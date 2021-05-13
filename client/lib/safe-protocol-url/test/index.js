/**
 * External dependencies
 */

import { expect } from 'chai';

/**
 * Internal Dependencies
 */
import safeProtocolUrl from '../';

describe( 'index', () => {
	test( 'should ignore a relative url', () => {
		expect( safeProtocolUrl( '/foo' ) ).to.eql( '/foo' );
	} );

	test( 'should return null for empty url', () => {
		const returnUndefined = function () {
			return;
		};

		expect( safeProtocolUrl( null ) ).to.eql( null );
		expect( safeProtocolUrl( returnUndefined() ) ).to.eql( null );
		expect( safeProtocolUrl( '' ) ).to.eql( null );
	} );

	test( 'should not change url if http protocol', () => {
		expect( safeProtocolUrl( 'http://foo.com' ) ).to.eql( 'http://foo.com' );
		expect( safeProtocolUrl( 'http://foo.com?query=string#id' ) ).to.eql(
			'http://foo.com?query=string#id'
		);
	} );

	test( 'should not change url https protocol', () => {
		expect( safeProtocolUrl( 'https://foo.com' ) ).to.eql( 'https://foo.com' );
		expect( safeProtocolUrl( 'http://foo.com?query=string#id' ) ).to.eql(
			'http://foo.com?query=string#id'
		);
	} );

	test( 'should not strip query args', () => {
		expect( safeProtocolUrl( 'https://foo.com?query=string' ) ).to.eql(
			'https://foo.com?query=string'
		);
		expect( safeProtocolUrl( 'https://foo.com?query=string&again=2' ) ).to.eql(
			'https://foo.com?query=string&again=2'
		);
	} );

	test( 'should not strip query hash', () => {
		expect( safeProtocolUrl( 'https://foo.com#id' ) ).to.eql( 'https://foo.com#id' );
		expect( safeProtocolUrl( 'https://foo.com?query=string#id' ) ).to.eql(
			'https://foo.com?query=string#id'
		);
	} );

	test( 'should make url with javascript protocol safe', () => {
		expect( safeProtocolUrl( 'javascript:function()' ) ).to.eql( 'http:' ); // eslint-disable-line no-script-url
	} );
} );

/**
 * External dependencies
 */
import { jsdom } from 'jsdom';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import setupEnvironment, { cleanup } from '../';

describe( 'react-test-env-setup', function() {
	afterEach( cleanup );

	it( 'should accept an empty set of parameters', function() {
		setupEnvironment();

		expect( global.window ).to.not.be.undefined;
		expect( global.document ).to.not.be.undefined;
		expect( global.navigator ).to.not.be.undefined;
		expect( global.document.body ).to.be.an.instanceof( jsdom().defaultView.window.Element );
		expect( global.document.body.innerHTML ).to.be.empty;
	} );

	it( 'should accept a markup string to be used as the document body', function() {
		var markup = '<html><head></head><body><div id="hello-world"></div></body></html>';
		setupEnvironment( markup );

		expect( global.window ).to.not.be.undefined;
		expect( global.document ).to.not.be.undefined;
		expect( global.navigator ).to.not.be.undefined;
		expect( global.document.documentElement.outerHTML ).to.equal( markup );
	} );

	it( 'should add support for localStorage and XMLHttpRequest by default', function() {
		setupEnvironment();

		expect( global.localStorage ).to.not.be.undefined;
		expect( global.localStorage.setItem ).to.be.a( 'function' );
		global.localStorage.setItem( 'test', 'ok' );
		expect( global.localStorage.getItem( 'test' ) ).to.equal( 'ok' );
		expect( global.XMLHttpRequest ).to.be.a( 'function' );
	} );

	it( 'should allow you to disable one or more additional features', function() {
		setupEnvironment( null, {
			localStorage: false
		} );

		expect( global.localStorage ).to.be.undefined;
		expect( global.XMLHttpRequest ).to.be.a( 'function' );
	} );
} );

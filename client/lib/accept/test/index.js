/** @jest-environment jsdom */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import accept from '../';

describe( '#accept()', function() {
	beforeEach( function() {
		document.body.innerHTML = '';
	} );

	it( 'should render a dialog to the document body', function() {
		var message = 'Are you sure?',
			dialog;

		accept( message, function() {} );

		dialog = document.querySelector( '.accept-dialog' );
		expect( dialog ).to.be.an.instanceof( window.Element );
		expect( dialog.textContent ).to.equal( message );
	} );

	it( 'should trigger the callback with an accepted prompt', function( done ) {
		accept( 'Are you sure?', function( accepted ) {
			expect( accepted ).to.be.be.true;
			done();
		} );

		document.querySelector( '.button.is-primary' ).click();
	} );

	it( 'should trigger the callback with a denied prompt', function( done ) {
		accept( 'Are you sure?', function( accepted ) {
			expect( accepted ).to.be.be.false;
			done();
		} );

		document.querySelector( '.button:not( .is-primary )' ).click();
	} );

	it( 'should clean up after itself once the prompt is closed', function( done ) {
		accept( 'Are you sure?', function() {
			process.nextTick( function() {
				expect( document.querySelector( '.accept-dialog' ) ).to.be.null;

				done();
			} );
		} );

		document.querySelector( '.button.is-primary' ).click();
	} );
} );

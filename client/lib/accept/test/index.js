/**
 * External dependencies
 */
import { expect } from 'chai';
import mockery from 'mockery';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';

describe( '#accept()', function() {
	let accept;

	useFakeDom();
	useMockery();

	before( function() {
		mockery.registerSubstitute( 'event', 'component-event' );
		mockery.registerSubstitute( 'matches-selector', 'component-matches-selector' );
		mockery.registerSubstitute( 'query', 'component-query' );

		accept = require( '../' );
	} );

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

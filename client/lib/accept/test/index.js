/* eslint-disable vars-on-top */
require( 'lib/react-test-env-setup' )();

/**
 * External dependencies
 */
var expect = require( 'chai' ).expect,
	TestUtils = require( 'react-addons-test-utils' ),
	mockery = require( 'mockery' ),
	sinon = require( 'sinon' ),
	noop = require( 'lodash/utility/noop' );

/**
 * Internal dependencies
 */
var accept, AcceptDialog;

describe( '#accept()', function() {
	before( function() {
		mockery.enable( {
			warnOnReplace: false,
			warnOnUnregistered: false
		} );
		mockery.registerSubstitute( 'event', 'component-event' );
		mockery.registerSubstitute( 'matches-selector', 'component-matches-selector' );
		mockery.registerSubstitute( 'query', 'component-query' );
		mockery.registerMock( 'component-classes', function() {
			return { add: noop, toggle: noop, remove: noop }
		} );
		accept = require( '../' );
		AcceptDialog = require( '../dialog' );
		AcceptDialog.prototype.__reactAutoBindMap.translate = sinon.stub().returnsArg( 0 );
	} );

	beforeEach( function() {
		document.body.innerHTML = '';
	} );

	after( function() {
		delete AcceptDialog.prototype.__reactAutoBindMap.translate;
		mockery.deregisterAll();
		mockery.disable();
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

		TestUtils.Simulate.click( document.querySelector( '.button.is-primary' ) );
	} );

	it( 'should trigger the callback with a denied prompt', function( done ) {
		accept( 'Are you sure?', function( accepted ) {
			expect( accepted ).to.be.be.false;
			done();
		} );

		TestUtils.Simulate.click( document.querySelector( '.button:not( .is-primary )' ) );
	} );

	it( 'should clean up after itself once the prompt is closed', function( done ) {
		accept( 'Are you sure?', function() {
			process.nextTick( function() {
				expect( document.querySelector( '.accept-dialog' ) ).to.be.null;

				done();
			} );
		} );

		TestUtils.Simulate.click( document.querySelector( '.button.is-primary' ) );
	} );
} );

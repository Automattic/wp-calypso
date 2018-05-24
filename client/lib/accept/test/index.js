/**
 * @format
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import accept from '../';

describe( '#accept()', () => {
	beforeEach( () => {
		document.body.innerHTML = '';
	} );

	test( 'should render a dialog to the document body', () => {
		const message = 'Are you sure?';

		accept( message, function() {} );

		const dialog = document.querySelector( '.accept-dialog' );
		expect( dialog ).toBeInstanceOf( window.Element );
		expect( dialog.textContent ).toEqual( message );
	} );

	test( 'should trigger the callback with an accepted prompt', done => {
		accept( 'Are you sure?', function( accepted ) {
			expect( accepted ).toBe( true );
			done();
		} );

		document.querySelector( '.button.is-primary' ).click();
	} );

	test( 'should trigger the callback with a denied prompt', done => {
		accept( 'Are you sure?', function( accepted ) {
			expect( accepted ).toBe( false );
			done();
		} );

		document.querySelector( '.button.is-cancel' ).click();
	} );

	test( 'should clean up after itself once the prompt is closed', () => {
		accept( 'Are you sure?', () => {} );
		document.querySelector( '.button.is-primary' ).click();
		expect( document.querySelector( '.accept-dialog' ) ).toBe( null );
	} );
} );

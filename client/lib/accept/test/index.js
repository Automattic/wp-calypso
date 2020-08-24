/**
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import accept from '../';

describe( '#accept()', () => {
	beforeEach( () => {
		// make up a fake wpcom element for the dialog to target
		document.body.innerHTML = '<div id="wpcom"></div>';
	} );

	test( 'should render a dialog to the document body', () => {
		const message = 'Are you sure?';

		accept( message, function () {} );

		const dialog = document.querySelector( '.accept__dialog' );
		expect( dialog ).toBeInstanceOf( window.Element );
		expect( dialog.textContent ).toEqual( message );
	} );

	test( 'should trigger the callback with an accepted prompt', ( done ) => {
		accept( 'Are you sure?', function ( accepted ) {
			expect( accepted ).toBe( true );
			done();
		} );

		document.querySelector( '.button.is-primary' ).click();
	} );

	test( 'should trigger the callback with a denied prompt', ( done ) => {
		accept( 'Are you sure?', function ( accepted ) {
			expect( accepted ).toBe( false );
			done();
		} );

		document.querySelector( '.button.is-cancel' ).click();
	} );

	test( 'should clean up after itself once the prompt is closed', () => {
		accept( 'Are you sure?', () => {} );
		document.querySelector( '.button.is-primary' ).click();
		expect( document.querySelector( '.accept__dialog' ) ).toBe( null );
	} );
} );

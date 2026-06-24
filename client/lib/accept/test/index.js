/**
 * @jest-environment jsdom
 */

import { act } from '@testing-library/react';
import accept from '../';

describe( '#accept()', () => {
	beforeEach( () => {
		// make up a fake wpcom element for the dialog to target
		document.body.innerHTML = '<div id="wpcom"></div>';
	} );

	test( 'should render a dialog to the document body', async () => {
		const message = 'Are you sure?';

		await act( async () => {
			accept( message, function () {} );
		} );

		const dialog = document.querySelector( '.accept__dialog' );
		expect( dialog ).toBeInstanceOf( window.Element );
		expect( dialog ).toHaveTextContent( message );
	} );

	test( 'should trigger the callback with an accepted prompt', async () => {
		const callback = jest.fn();

		await act( async () => {
			accept( 'Are you sure?', callback );
		} );

		await act( async () => {
			document.querySelector( '.button.is-primary' ).click();
		} );

		expect( callback ).toHaveBeenCalledWith( true );
	} );

	test( 'should trigger the callback with a denied prompt', async () => {
		const callback = jest.fn();

		await act( async () => {
			accept( 'Are you sure?', callback );
		} );

		await act( async () => {
			document.querySelector( '.button.is-cancel' ).click();
		} );

		expect( callback ).toHaveBeenCalledWith( false );
	} );

	test( 'should clean up after itself once the prompt is closed', async () => {
		await act( async () => {
			accept( 'Are you sure?', () => {} );
		} );

		await act( async () => {
			document.querySelector( '.button.is-primary' ).click();
		} );

		expect( document.querySelector( '.accept__dialog' ) ).toBe( null );
	} );
} );

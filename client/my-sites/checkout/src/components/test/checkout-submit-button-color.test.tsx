/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { useSubmitButtonColor } from '../../hooks/use-submit-button-color';

jest.mock( '../../hooks/use-submit-button-color' );

/**
 * Minimal component that mirrors the wrapper pattern used in checkout-main-content.tsx
 * so we can test the inline backgroundColor is applied when a color is returned.
 */
function CheckoutSubmitButtonColorWrapper() {
	const submitButtonColor = useSubmitButtonColor();
	return (
		<div
			className="checkout-submit-button-color-wrapper"
			style={ submitButtonColor ? { backgroundColor: submitButtonColor } : undefined }
		>
			<button type="submit">Pay now</button>
		</div>
	);
}

describe( 'checkout submit button color wrapper', () => {
	afterEach( () => jest.clearAllMocks() );

	it( 'applies inline backgroundColor when the hook returns a color', () => {
		jest.mocked( useSubmitButtonColor ).mockReturnValue( '#ff5500' );

		render( <CheckoutSubmitButtonColorWrapper /> );

		const wrapper = document.querySelector( '.checkout-submit-button-color-wrapper' );
		expect( wrapper ).not.toBeNull();
		expect( ( wrapper as HTMLElement ).style.backgroundColor ).toBe( '#ff5500' );
	} );

	it( 'does not apply backgroundColor when the hook returns null (loading)', () => {
		jest.mocked( useSubmitButtonColor ).mockReturnValue( null );

		render( <CheckoutSubmitButtonColorWrapper /> );

		const wrapper = document.querySelector( '.checkout-submit-button-color-wrapper' );
		expect( wrapper ).not.toBeNull();
		expect( ( wrapper as HTMLElement ).style.backgroundColor ).toBe( '' );
	} );

	it( 'renders the submit button regardless of whether a color is returned', () => {
		jest.mocked( useSubmitButtonColor ).mockReturnValue( null );

		render( <CheckoutSubmitButtonColorWrapper /> );

		expect( screen.getByRole( 'button', { name: /pay now/i } ) ).toBeVisible();
	} );
} );

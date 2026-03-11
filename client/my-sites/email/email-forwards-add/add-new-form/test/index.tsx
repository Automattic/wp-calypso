/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React from 'react';
import { NewForwardForm } from '../index';

jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => ( text: string ) => text,
} ) );

const defaultProps = {
	selectedDomainName: 'example.com',
	existingEmailForwards: [],
	disabled: false,
};

describe( 'NewForwardForm MX warning', () => {
	it( 'does not show MX warning when showMxWarning is false', () => {
		render( <NewForwardForm { ...defaultProps } showMxWarning={ false } /> );

		expect( screen.queryByText( /will replace your current MX records/i ) ).not.toBeInTheDocument();
	} );

	it( 'does not show MX warning when showMxWarning is undefined', () => {
		render( <NewForwardForm { ...defaultProps } /> );

		expect( screen.queryByText( /will replace your current MX records/i ) ).not.toBeInTheDocument();
	} );

	it( 'shows MX warning when showMxWarning is true', () => {
		render( <NewForwardForm { ...defaultProps } showMxWarning /> );

		// Target the <p> element directly to avoid matching ancestor nodes
		// that also contain the text (Notice wraps children in a content div).
		expect(
			screen.getByText( ( _, el ) => {
				return (
					el?.tagName === 'P' &&
					/will replace your current MX records/i.test( el?.textContent ?? '' )
				);
			} )
		).toBeVisible();
		expect( screen.getByLabelText( /I understand that adding email forwarding/i ) ).toBeVisible();
	} );

	it( 'disables submit button when MX warning is shown and not acknowledged', () => {
		render( <NewForwardForm { ...defaultProps } showMxWarning /> );

		expect( screen.getByRole( 'button', { name: /Confirm forwards/i } ) ).toBeDisabled();
	} );

	it( 'allows acknowledging the MX warning via checkbox', async () => {
		const user = userEvent.setup();

		render( <NewForwardForm { ...defaultProps } showMxWarning /> );

		const checkbox = screen.getByLabelText( /I understand that adding email forwarding/i );
		expect( checkbox ).not.toBeChecked();

		await user.click( checkbox );

		expect( checkbox ).toBeChecked();
	} );

	it( 'enables submit button when form is filled and MX warning is acknowledged', async () => {
		const user = userEvent.setup();

		render( <NewForwardForm { ...defaultProps } showMxWarning /> );

		// Fill in the mailbox name.
		await user.type( screen.getByRole( 'textbox', { name: /Forward from/i } ), 'info' );

		// Add a forwarding destination via FormTokenField.
		const destinationInput = screen.getByRole( 'combobox', { name: /Forward to/i } );
		await user.type( destinationInput, 'test@other.com' );
		await user.keyboard( '{Enter}' );

		// Button should still be disabled — warning not acknowledged yet.
		expect( screen.getByRole( 'button', { name: /Confirm forwards/i } ) ).toBeDisabled();

		// Acknowledge the MX warning.
		await user.click( screen.getByLabelText( /I understand that adding email forwarding/i ) );

		// Now the button should be enabled.
		expect( screen.getByRole( 'button', { name: /Confirm forwards/i } ) ).toBeEnabled();
	} );

	it( 'keeps submit button disabled without MX warning when form is incomplete', () => {
		render( <NewForwardForm { ...defaultProps } showMxWarning={ false } /> );

		// No mailbox or destinations entered — should still be disabled.
		expect( screen.getByRole( 'button', { name: /Confirm forwards/i } ) ).toBeDisabled();
	} );
} );

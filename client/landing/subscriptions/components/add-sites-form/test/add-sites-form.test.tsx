/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import AddSitesForm from '../add-sites-form';

jest.mock( 'calypso/state/notices/actions', () => ( {
	successNotice: jest.fn(),
	errorNotice: jest.fn(),
} ) );

describe( 'AddSitesForm', () => {
	const mockProps = {
		onAddFinished: jest.fn(),
	};

	test( 'displays an error message with invalid URL', () => {
		renderWithProvider( <AddSitesForm { ...mockProps } /> );
		const input = screen.getByRole( 'textbox' );

		fireEvent.change( input, {
			target: { value: 'not-a-url' },
		} );

		fireEvent.blur( input );

		expect( screen.getByText( 'Please enter a valid URL' ) ).toBeInTheDocument();
	} );

	test( 'does not display an error message with valid URL', () => {
		renderWithProvider( <AddSitesForm { ...mockProps } /> );
		const input = screen.getByRole( 'textbox' );

		fireEvent.change( input, {
			target: { value: 'https://www.valid-url.com' },
		} );

		fireEvent.blur( input );

		expect( screen.queryByText( 'Please enter a valid URL' ) ).not.toBeInTheDocument();
	} );

	test( 'does not display an error message when input field is empty and blurred', () => {
		renderWithProvider( <AddSitesForm { ...mockProps } /> );
		const input = screen.getByRole( 'textbox' );

		fireEvent.change( input, {
			target: { value: '' },
		} );

		fireEvent.blur( input );

		expect( screen.queryByText( 'Please enter a valid URL' ) ).not.toBeInTheDocument();
	} );

	test( 'displays a check icon when a valid URL is entered', () => {
		renderWithProvider( <AddSitesForm { ...mockProps } /> );
		const input = screen.getByRole( 'textbox' );

		fireEvent.change( input, {
			target: { value: 'https://www.valid-url.com' },
		} );

		fireEvent.blur( input );

		const checkIcon = screen.getByTestId( 'check-icon' );
		expect( checkIcon ).toBeInTheDocument();
	} );

	test( 'disables the Add site button when an invalid URL is entered', () => {
		renderWithProvider( <AddSitesForm { ...mockProps } /> );
		const input = screen.getByRole( 'textbox' );
		const addButton = screen.getByRole( 'button', { name: 'Add site' } );

		fireEvent.change( input, {
			target: { value: 'not-a-url' },
		} );

		fireEvent.blur( input );

		expect( addButton ).toBeDisabled();
	} );
} );

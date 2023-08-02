/**
 * @jest-environment jsdom
 */

import { render, fireEvent, screen } from '@testing-library/react';
import AddSitesForm from '../add-sites-form';

describe( 'AddSitesForm', () => {
	const mockProps = {
		recordTracksEvent: jest.fn(),
		onClose: jest.fn(),
		onAddFinished: jest.fn(),
	};

	test( 'displays an error message with invalid URL', () => {
		render( <AddSitesForm { ...mockProps } /> );
		const input = document.querySelector( '.subscriptions-add-sites__form-input input' );

		fireEvent.change( input, {
			target: { value: 'not-a-url' },
		} );

		fireEvent.blur( input );

		expect( screen.getByText( 'Please enter a valid URL' ) ).toBeInTheDocument();
	} );

	test( 'does not display an error message with valid URL', () => {
		render( <AddSitesForm { ...mockProps } /> );
		const input = document.querySelector( '.subscriptions-add-sites__form-input input' );

		fireEvent.change( input, {
			target: { value: 'https://www.valid-url.com' },
		} );

		fireEvent.blur( input );

		expect( screen.queryByText( 'Please enter a valid URL' ) ).not.toBeInTheDocument();
	} );

	test( 'does not display an error message when input field is empty and blurred', () => {
		render( <AddSitesForm { ...mockProps } /> );
		const input = document.querySelector( '.subscriptions-add-sites__form-input input' );

		fireEvent.change( input, {
			target: { value: '' },
		} );

		fireEvent.blur( input );

		expect( screen.queryByText( 'Please enter a valid URL' ) ).not.toBeInTheDocument();
	} );

	test( 'displays an SVG when a valid URL is entered', () => {
		render( <AddSitesForm { ...mockProps } /> );
		const input = document.querySelector( '.subscriptions-add-sites__form-input input' );

		fireEvent.change( input, {
			target: { value: 'https://www.valid-url.com' },
		} );

		fireEvent.blur( input );

		const checkIcon = document.querySelector( '.components-base-control__help' );
		expect( checkIcon ).toBeInTheDocument();
		expect( checkIcon.innerHTML ).toContain( 'svg' );
	} );
} );

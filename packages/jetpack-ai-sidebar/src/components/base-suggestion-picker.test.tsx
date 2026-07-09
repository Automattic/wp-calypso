/**
 * @jest-environment jsdom
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import BaseSuggestionPicker from './base-suggestion-picker';

describe( 'BaseSuggestionPicker', () => {
	const options = [ 'First option', 'Second option' ];

	it( 'renders the intro and every option', () => {
		render( <BaseSuggestionPicker intro="Pick one:" options={ options } onApply={ jest.fn() } /> );
		expect( screen.getByText( 'Pick one:' ) ).toBeInTheDocument();
		expect( screen.getByText( 'First option' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Second option' ) ).toBeInTheDocument();
	} );

	it( 'calls onApply with the clicked value', () => {
		const onApply = jest.fn();
		render( <BaseSuggestionPicker intro="Pick one:" options={ options } onApply={ onApply } /> );
		fireEvent.click( screen.getByText( 'Second option' ) );
		expect( onApply ).toHaveBeenCalledWith( 'Second option' );
	} );

	it( 'highlights only the applied option', () => {
		render( <BaseSuggestionPicker intro="Pick one:" options={ options } onApply={ jest.fn() } /> );
		const first = screen.getByText( 'First option' ).closest( 'button' ) as HTMLButtonElement;
		const second = screen.getByText( 'Second option' ).closest( 'button' ) as HTMLButtonElement;
		fireEvent.click( first );
		expect( first ).toHaveAttribute( 'aria-pressed', 'true' );
		expect( second ).toHaveAttribute( 'aria-pressed', 'false' );
	} );

	it( 'marks the option matching currentValue as applied without a click', () => {
		render(
			<BaseSuggestionPicker
				intro="Pick one:"
				options={ options }
				onApply={ jest.fn() }
				appliedMessage="Applied."
				currentValue="Second option"
			/>
		);
		const second = screen.getByText( 'Second option' ).closest( 'button' ) as HTMLButtonElement;
		expect( second ).toHaveAttribute( 'aria-pressed', 'true' );
		expect( screen.getByText( 'Applied.' ) ).toBeInTheDocument();
	} );

	it( 'ignores a currentValue that matches no option', () => {
		render(
			<BaseSuggestionPicker
				intro="Pick one:"
				options={ options }
				onApply={ jest.fn() }
				appliedMessage="Applied."
				currentValue="Unrelated value"
			/>
		);
		expect( screen.queryByText( 'Applied.' ) ).not.toBeInTheDocument();
		options.forEach( ( option ) => {
			expect( screen.getByText( option ).closest( 'button' ) ).toHaveAttribute(
				'aria-pressed',
				'false'
			);
		} );
	} );

	it( 'only exposes the confirmation as a live region after an in-session apply', () => {
		render(
			<BaseSuggestionPicker
				intro="Pick one:"
				options={ options }
				onApply={ jest.fn() }
				appliedMessage="Applied."
				currentValue="Second option"
			/>
		);
		expect( screen.getByText( 'Applied.' ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'status' ) ).not.toBeInTheDocument();
		fireEvent.click( screen.getByText( 'First option' ) );
		expect( screen.getByRole( 'status' ) ).toHaveTextContent( 'Applied.' );
	} );

	it( 'lets a click override the derived currentValue highlight', () => {
		render(
			<BaseSuggestionPicker
				intro="Pick one:"
				options={ options }
				onApply={ jest.fn() }
				currentValue="Second option"
			/>
		);
		const first = screen.getByText( 'First option' ).closest( 'button' ) as HTMLButtonElement;
		const second = screen.getByText( 'Second option' ).closest( 'button' ) as HTMLButtonElement;
		fireEvent.click( first );
		expect( first ).toHaveAttribute( 'aria-pressed', 'true' );
		expect( second ).toHaveAttribute( 'aria-pressed', 'false' );
	} );

	it( 'shows the inline confirmation only after a value is applied', () => {
		render(
			<BaseSuggestionPicker
				intro="Pick one:"
				options={ options }
				onApply={ jest.fn() }
				appliedMessage="SEO title updated."
			/>
		);
		expect( screen.queryByText( 'SEO title updated.' ) ).not.toBeInTheDocument();
		fireEvent.click( screen.getByText( 'First option' ) );
		expect( screen.getByText( 'SEO title updated.' ) ).toBeInTheDocument();
	} );
} );

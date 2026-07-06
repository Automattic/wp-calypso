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

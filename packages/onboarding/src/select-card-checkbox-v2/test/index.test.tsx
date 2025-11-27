/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import SelectCardCheckboxV2 from '../index';

describe( 'SelectCardCheckboxV2', () => {
	it( 'renders the elements and labels', () => {
		render( <SelectCardCheckboxV2 onChange={ jest.fn() }>Hello</SelectCardCheckboxV2> );
		expect( screen.getByRole( 'checkbox', { name: 'Hello' } ) ).toBeInTheDocument();
	} );

	it( 'renders the checked state', () => {
		render(
			<SelectCardCheckboxV2 onChange={ jest.fn() } checked>
				Hello
			</SelectCardCheckboxV2>
		);
		expect( screen.getByRole( 'checkbox', { name: 'Hello' } ) ).toBeChecked();
	} );

	it( 'renders the disabled state', () => {
		render(
			<SelectCardCheckboxV2 onChange={ jest.fn() } disabled>
				Hello
			</SelectCardCheckboxV2>
		);
		expect( screen.getByRole( 'checkbox', { name: 'Hello' } ) ).toBeDisabled();
	} );

	it( 'calls onChange when the checkbox is clicked', () => {
		const onChange = jest.fn();
		render( <SelectCardCheckboxV2 onChange={ onChange }>Hello</SelectCardCheckboxV2> );
		fireEvent.click( screen.getByRole( 'checkbox', { name: 'Hello' } ) );

		expect( onChange ).toHaveBeenCalledTimes( 1 );
		expect( onChange ).toHaveBeenCalledWith( true );
	} );
	it( 'disables the checkbox when isBusy is true', () => {
		render(
			<SelectCardCheckboxV2 onChange={ jest.fn() } isBusy>
				Hello
			</SelectCardCheckboxV2>
		);
		expect( screen.getByRole( 'checkbox', { name: 'Hello' } ) ).toBeDisabled();
	} );
} );

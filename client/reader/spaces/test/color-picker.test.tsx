/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { SpaceColorPicker } from '../color-picker';

describe( 'SpaceColorPicker', () => {
	it( 'renders a swatch for every color and checks the selected one', () => {
		renderWithProvider( <SpaceColorPicker value="green" onChange={ jest.fn() } /> );

		// One radio per accent color (8).
		expect( screen.getAllByRole( 'radio' ) ).toHaveLength( 8 );
		expect( screen.getByRole( 'radio', { name: 'Green' } ) ).toBeChecked();
		expect( screen.getByRole( 'radio', { name: 'Blue' } ) ).not.toBeChecked();
	} );

	it( 'reports the chosen color', async () => {
		const user = userEvent.setup();
		const onChange = jest.fn();
		renderWithProvider( <SpaceColorPicker value="blue" onChange={ onChange } /> );

		await user.click( screen.getByRole( 'radio', { name: 'Pink' } ) );

		expect( onChange ).toHaveBeenCalledWith( 'pink' );
	} );

	it( 'adds a "None" swatch and checks it when selected', () => {
		renderWithProvider( <SpaceColorPicker value="none" onChange={ jest.fn() } allowNone /> );

		// The eight colors plus the extra "None" swatch.
		expect( screen.getAllByRole( 'radio' ) ).toHaveLength( 9 );
		expect( screen.getByRole( 'radio', { name: 'None' } ) ).toBeChecked();
	} );

	it( 'reports "none" when the None swatch is chosen', async () => {
		const user = userEvent.setup();
		const onChange = jest.fn();
		renderWithProvider( <SpaceColorPicker value="blue" onChange={ onChange } allowNone /> );

		await user.click( screen.getByRole( 'radio', { name: 'None' } ) );

		expect( onChange ).toHaveBeenCalledWith( 'none' );
	} );
} );

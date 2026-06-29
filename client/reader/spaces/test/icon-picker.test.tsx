/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { SpaceIconPicker } from '../icon-picker';

describe( 'SpaceIconPicker', () => {
	it( 'renders a tile for every icon and checks the selected one', () => {
		renderWithProvider( <SpaceIconPicker value="category" onChange={ jest.fn() } /> );

		// One radio per icon (16).
		expect( screen.getAllByRole( 'radio' ) ).toHaveLength( 16 );
		expect( screen.getByRole( 'radio', { name: 'Category' } ) ).toBeChecked();
		expect( screen.getByRole( 'radio', { name: 'Globe' } ) ).not.toBeChecked();
	} );

	it( 'reports the chosen icon', async () => {
		const user = userEvent.setup();
		const onChange = jest.fn();
		renderWithProvider( <SpaceIconPicker value="category" onChange={ onChange } /> );

		await user.click( screen.getByRole( 'radio', { name: 'Globe' } ) );

		expect( onChange ).toHaveBeenCalledWith( 'globe' );
	} );
} );

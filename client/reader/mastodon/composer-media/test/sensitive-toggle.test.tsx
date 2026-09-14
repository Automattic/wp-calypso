/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SensitiveToggle } from '../sensitive-toggle';

describe( 'SensitiveToggle', () => {
	it( 'renders unchecked by default and toggles on click', async () => {
		const user = userEvent.setup();
		const onChange = jest.fn();
		render( <SensitiveToggle sensitive={ false } onChange={ onChange } /> );
		const toggle = screen.getByRole( 'checkbox', { name: /mark media as sensitive/i } );
		expect( toggle ).not.toBeChecked();
		await user.click( toggle );
		expect( onChange ).toHaveBeenCalledWith( true );
	} );

	it( 'reflects checked state from the prop', () => {
		render( <SensitiveToggle sensitive onChange={ jest.fn() } /> );
		expect( screen.getByRole( 'checkbox', { name: /mark media as sensitive/i } ) ).toBeChecked();
	} );
} );

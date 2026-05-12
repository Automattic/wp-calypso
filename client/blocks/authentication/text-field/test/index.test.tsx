/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import TextField from '../index';

const Wrapper = (
	props: Omit< React.ComponentProps< typeof TextField >, 'value' | 'onChange' >
) => {
	const [ value, setValue ] = useState( '' );
	return <TextField { ...props } value={ value } onChange={ setValue } />;
};

describe( 'TextField', () => {
	test( 'associates label with input', () => {
		render( <Wrapper label="Email address" /> );

		expect( screen.getByRole( 'textbox', { name: 'Email address' } ) ).toBeVisible();
	} );

	test( 'fires onChange as the user types', async () => {
		const onChange = jest.fn();
		render( <TextField label="Email address" value="" onChange={ onChange } /> );

		await userEvent.type( screen.getByRole( 'textbox', { name: 'Email address' } ), 'a' );

		expect( onChange ).toHaveBeenCalledWith( 'a' );
	} );

	test( 'renders help text', () => {
		render( <Wrapper label="Email" help="We’ll send the reset link here." /> );

		expect( screen.getByText( 'We’ll send the reset link here.' ) ).toBeVisible();
	} );

	test( 'respects the disabled prop', () => {
		render( <Wrapper label="Email" disabled /> );

		expect( screen.getByRole( 'textbox', { name: 'Email' } ) ).toBeDisabled();
	} );

	test( 'supports the password type', () => {
		render( <Wrapper label="Password" type="password" /> );

		// Password inputs have no accessible role, so we query by label.
		const input = screen.getByLabelText( 'Password' );
		expect( input ).toHaveAttribute( 'type', 'password' );
	} );

	test( 'supports the tel type for 2FA codes', () => {
		render(
			<Wrapper label="6-digit code" type="tel" autoComplete="one-time-code" pattern="[0-9 ]*" />
		);

		const input = screen.getByRole( 'textbox', { name: '6-digit code' } );
		expect( input ).toHaveAttribute( 'type', 'tel' );
		expect( input ).toHaveAttribute( 'autocomplete', 'one-time-code' );
		expect( input ).toHaveAttribute( 'pattern', '[0-9 ]*' );
	} );
} );

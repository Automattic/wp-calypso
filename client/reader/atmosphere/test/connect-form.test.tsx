/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConnectForm } from '../connect-form';

describe( 'ConnectForm', () => {
	it( 'disables submit while handle or app_password empty', () => {
		render( <ConnectForm onSubmit={ jest.fn() } isSubmitting={ false } error={ null } /> );
		expect( screen.getByRole( 'button', { name: /connect/i } ) ).toBeDisabled();
	} );

	it( 'calls onSubmit with entered values', async () => {
		const user = userEvent.setup();
		const onSubmit = jest.fn();
		render( <ConnectForm onSubmit={ onSubmit } isSubmitting={ false } error={ null } /> );
		await user.type( screen.getByLabelText( /handle/i ), 'alice.bsky.social' );
		await user.type( screen.getByLabelText( /app password/i ), 'xxxx-xxxx-xxxx-xxxx' );
		await user.click( screen.getByRole( 'button', { name: /connect/i } ) );
		expect( onSubmit ).toHaveBeenCalledWith( {
			handle: 'alice.bsky.social',
			app_password: 'xxxx-xxxx-xxxx-xxxx',
		} );
	} );

	it( 'renders invalid_credentials message', () => {
		render(
			<ConnectForm
				onSubmit={ jest.fn() }
				isSubmitting={ false }
				error={ { kind: 'invalid_credentials' } }
			/>
		);
		expect( screen.getByText( /wrong handle or app password/i ) ).toBeVisible();
	} );

	it( 'renders generic rate_limited message', () => {
		render(
			<ConnectForm
				onSubmit={ jest.fn() }
				isSubmitting={ false }
				error={ { kind: 'rate_limited' } }
			/>
		);
		expect( screen.getByText( /slow down/i ) ).toBeVisible();
	} );
} );

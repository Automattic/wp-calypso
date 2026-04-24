/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConnectForm } from '../connect-form';

describe( 'ConnectForm', () => {
	it( 'disables submit while instance, handle, or access_token is empty', () => {
		render( <ConnectForm onSubmit={ jest.fn() } isSubmitting={ false } error={ null } /> );
		expect( screen.getByRole( 'button', { name: /connect/i } ) ).toBeDisabled();
	} );

	it( 'calls onSubmit with entered values', async () => {
		const user = userEvent.setup();
		const onSubmit = jest.fn();
		render( <ConnectForm onSubmit={ onSubmit } isSubmitting={ false } error={ null } /> );
		await user.type( screen.getByLabelText( /instance/i ), 'mastodon.social' );
		await user.type( screen.getByLabelText( /handle/i ), 'alice' );
		await user.type( screen.getByLabelText( /access token/i ), 'abc123' );
		await user.click( screen.getByRole( 'button', { name: /connect/i } ) );
		expect( onSubmit ).toHaveBeenCalledWith( {
			instance: 'mastodon.social',
			handle: 'alice',
			access_token: 'abc123',
		} );
	} );

	it( 'renders auth_failed message', () => {
		render(
			<ConnectForm
				onSubmit={ jest.fn() }
				isSubmitting={ false }
				error={ { kind: 'auth_failed' } }
			/>
		);
		expect( screen.getByText( /wrong handle or access token/i ) ).toBeVisible();
	} );

	it( 'renders invalid_instance message', () => {
		render(
			<ConnectForm
				onSubmit={ jest.fn() }
				isSubmitting={ false }
				error={ { kind: 'invalid_instance' } }
			/>
		);
		expect( screen.getByText( /couldn't reach that mastodon instance/i ) ).toBeVisible();
	} );

	it( 'renders rate_limited message', () => {
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

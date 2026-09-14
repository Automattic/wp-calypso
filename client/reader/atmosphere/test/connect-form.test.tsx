/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConnectForm } from '../connect-form';

describe( 'ConnectForm', () => {
	it( 'renders the prose intro describing what the user gets', () => {
		render( <ConnectForm onSubmit={ jest.fn() } isSubmitting={ false } error={ null } /> );
		expect(
			screen.getByText( /your Bluesky timeline appears alongside your blog feeds/i )
		).toBeVisible();
	} );

	it( 'labels the username field as "Bluesky username" with helper text', () => {
		render( <ConnectForm onSubmit={ jest.fn() } isSubmitting={ false } error={ null } /> );
		expect( screen.getByLabelText( /bluesky username/i ) ).toBeVisible();
		expect( screen.getByText( /your full handle, including the domain/i ) ).toBeVisible();
	} );

	it( 'renders the app-password helper text and external link', () => {
		render( <ConnectForm onSubmit={ jest.fn() } isSubmitting={ false } error={ null } /> );
		expect(
			screen.getByText( /use a Bluesky app password rather than your main password/i )
		).toBeVisible();
		expect( screen.getByRole( 'link', { name: /how do I get an app password/i } ) ).toBeVisible();
	} );

	it( 'disables submit while username or app password empty', () => {
		render( <ConnectForm onSubmit={ jest.fn() } isSubmitting={ false } error={ null } /> );
		expect( screen.getByRole( 'button', { name: /connect/i } ) ).toBeDisabled();
	} );

	it( 'disables submit while submitting even when both fields are filled', () => {
		render( <ConnectForm onSubmit={ jest.fn() } isSubmitting error={ null } /> );
		expect( screen.getByRole( 'button', { name: /connect/i } ) ).toBeDisabled();
	} );

	it( 'calls onSubmit with entered values', async () => {
		const user = userEvent.setup();
		const onSubmit = jest.fn();
		render( <ConnectForm onSubmit={ onSubmit } isSubmitting={ false } error={ null } /> );
		await user.type( screen.getByLabelText( /bluesky username/i ), 'alice.bsky.social' );
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

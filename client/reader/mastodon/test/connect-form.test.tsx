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
			screen.getByText( /your Mastodon timeline appears alongside your blog feeds/i )
		).toBeVisible();
	} );

	it( 'renders the instance helper text describing the OAuth handoff', () => {
		render( <ConnectForm onSubmit={ jest.fn() } isSubmitting={ false } error={ null } /> );
		expect( screen.getByText( /hand you off to sign in there/i ) ).toBeVisible();
		expect( screen.getByText( /never see your password/i ) ).toBeVisible();
	} );

	it( 'disables submit while instance is empty', () => {
		render( <ConnectForm onSubmit={ jest.fn() } isSubmitting={ false } error={ null } /> );
		expect( screen.getByRole( 'button', { name: /continue/i } ) ).toBeDisabled();
	} );

	it( 'calls onSubmit with the trimmed instance', async () => {
		const user = userEvent.setup();
		const onSubmit = jest.fn();
		render( <ConnectForm onSubmit={ onSubmit } isSubmitting={ false } error={ null } /> );
		await user.type( screen.getByLabelText( /instance/i ), '  mastodon.social  ' );
		await user.click( screen.getByRole( 'button', { name: /continue/i } ) );
		expect( onSubmit ).toHaveBeenCalledWith( { instance: 'mastodon.social' } );
	} );

	it.each( [
		[ 'https://mastodon.social', 'mastodon.social' ],
		[ 'https://mastodon.social/', 'mastodon.social' ],
		[ 'https://mastodon.social/@user', 'mastodon.social' ],
		[ '@user@mastodon.social', 'mastodon.social' ],
		[ 'Mastodon.Social', 'mastodon.social' ],
	] )( 'normalizes %s to %s before submitting', async ( typed, expected ) => {
		const user = userEvent.setup();
		const onSubmit = jest.fn();
		render( <ConnectForm onSubmit={ onSubmit } isSubmitting={ false } error={ null } /> );
		await user.type( screen.getByLabelText( /instance/i ), typed );
		await user.click( screen.getByRole( 'button', { name: /continue/i } ) );
		expect( onSubmit ).toHaveBeenCalledWith( { instance: expected } );
	} );

	it( 'disables submit and shows busy state while submitting', () => {
		render( <ConnectForm onSubmit={ jest.fn() } isSubmitting error={ null } /> );
		const button = screen.getByRole( 'button', { name: /continue/i } );
		expect( button ).toBeDisabled();
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

	it( 'renders auth_failed message', () => {
		render(
			<ConnectForm
				onSubmit={ jest.fn() }
				isSubmitting={ false }
				error={ { kind: 'auth_failed' } }
			/>
		);
		expect( screen.getByText( /couldn’t start the authorization/i ) ).toBeVisible();
	} );

	it( 'renders upstream_unavailable message', () => {
		render(
			<ConnectForm
				onSubmit={ jest.fn() }
				isSubmitting={ false }
				error={ { kind: 'upstream_unavailable' } }
			/>
		);
		expect( screen.getByText( /unreachable right now/i ) ).toBeVisible();
	} );

	it( 'renders bad_request message', () => {
		render(
			<ConnectForm
				onSubmit={ jest.fn() }
				isSubmitting={ false }
				error={ { kind: 'bad_request', message: 'nope' } }
			/>
		);
		expect( screen.getByText( /doesn't look like a valid instance/i ) ).toBeVisible();
	} );

	it( 'renders connection_not_found message', () => {
		render(
			<ConnectForm
				onSubmit={ jest.fn() }
				isSubmitting={ false }
				error={ { kind: 'connection_not_found' } }
			/>
		);
		expect( screen.getByText( /no longer available/i ) ).toBeVisible();
	} );

	it( 'renders unknown error message', () => {
		render(
			<ConnectForm
				onSubmit={ jest.fn() }
				isSubmitting={ false }
				error={ { kind: 'unknown', cause: null } }
			/>
		);
		expect( screen.getByText( /something went wrong/i ) ).toBeVisible();
	} );
} );

/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { queryClient, userSettingsQuery } from '@automattic/api-queries';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { dispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import nock from 'nock';
import Snackbars from '../../../../app/snackbars';
import { render } from '../../../../test-utils';
import EmailVerificationBanner from '../email-verification-banner';
import type { UserSettings } from '@automattic/api-core';

const settings = {
	user_email: 'john@example.com',
	user_email_change_pending: false,
	new_user_email: '',
} as unknown as UserSettings;

const pendingSettings = {
	...settings,
	user_email_change_pending: true,
	new_user_email: 'pending@example.com',
} as unknown as UserSettings;

const originalLocation = window.location;

const setSearch = ( search: string ) => {
	Object.defineProperty( window, 'location', {
		value: { ...originalLocation, search, pathname: '/test' },
		writable: true,
	} );
};

const notificationSnackBar = () => {
	// Snackbar requires a custom matcher because its aria-live is not supported by the testing library
	return document.getElementById( 'a11y-speak-polite' );
};

describe( '<EmailVerificationBanner>', () => {
	// Both outlive a render, so one case's announcement would otherwise be found by the next:
	// snackbars are their own notice type, and `@wordpress/a11y` keeps a live region on the body.
	beforeEach( () => {
		// Snackbar requires window.scrollTo to be defined
		window.scrollTo = jest.fn();
	} );

	afterEach( () => {
		Object.defineProperty( window, 'location', { value: originalLocation, writable: true } );
		// Snackbars are their own notice type, so the default clear leaves them behind for the
		// next case to find.
		dispatch( noticesStore ).removeAllNotices( 'snackbar' );
		dispatch( noticesStore ).removeAllNotices();
		const region = notificationSnackBar();
		if ( region ) {
			region.textContent = '';
		}
	} );

	test( 'shows verification banner and resends email', async () => {
		const user = userEvent.setup();

		render( <EmailVerificationBanner userSettings={ pendingSettings } isEmailVerified /> );

		expect( await screen.findByText( 'Verify your email' ) ).toBeVisible();

		const scope = nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/settings', ( body ) => {
				expect( body ).toEqual( expect.objectContaining( { user_email: 'pending@example.com' } ) );
				return true;
			} )
			.reply( 200, pendingSettings );

		await user.click( screen.getByRole( 'button', { name: 'Resend email' } ) );

		await waitFor( () => {
			expect( scope.isDone() ).toBe( true );
		} );
	} );

	test( 'confirms a pending resend that finishes after the banner has gone', async () => {
		const user = userEvent.setup();

		const { unmount } = render(
			<>
				<EmailVerificationBanner userSettings={ pendingSettings } isEmailVerified />
				<Snackbars />
			</>
		);

		expect( await screen.findByText( 'Verify your email' ) ).toBeVisible();

		// Held open so the request is genuinely in flight at the point the banner goes away.
		let deliverReply: () => void;
		nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/settings', ( body ) => 'user_email' in body )
			.reply(
				() =>
					new Promise( ( resolve ) => {
						deliverReply = () => resolve( [ 200, pendingSettings ] );
					} )
			);

		await user.click( screen.getByRole( 'button', { name: 'Resend email' } ) );
		// Navigating away mid-request must not swallow the outcome.
		unmount();
		deliverReply!();

		render( <Snackbars /> );
		await waitFor( () =>
			expect( notificationSnackBar() ).toHaveTextContent( 'pending@example.com' )
		);
	} );

	test( 'counts down on the button when a resend is refused', async () => {
		const user = userEvent.setup();

		render( <EmailVerificationBanner userSettings={ settings } isEmailVerified={ false } /> );

		expect( await screen.findByText( 'Verify your email' ) ).toBeVisible();

		nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/send-verification-email' )
			.reply( 429, {
				error: 'throttled',
				message: 'You have requested too many verification emails.',
				data: { retry_after: 25 * 60 },
			} );

		await user.click( screen.getByRole( 'button', { name: 'Resend email' } ) );

		// Held for the server's figure, and reported as a refusal rather than a broken send.
		expect( await screen.findByRole( 'button', { name: 'Resend email (25:00)' } ) ).toBeDisabled();
		expect( screen.queryByText( /Failed to resend/ ) ).not.toBeInTheDocument();
	} );

	test( 'holds an accepted resend for the wait the server reports', async () => {
		const user = userEvent.setup();

		render( <EmailVerificationBanner userSettings={ settings } isEmailVerified={ false } /> );

		expect( await screen.findByText( 'Verify your email' ) ).toBeVisible();

		// Spending the daily allowance answers with the wait until it resets, not the interval.
		nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/send-verification-email' )
			.reply( 200, { success: true, retry_after: 4 * 60 * 60 } );

		await user.click( screen.getByRole( 'button', { name: 'Resend email' } ) );

		expect(
			await screen.findByRole( 'button', { name: 'Resend email (4:00:00)' } )
		).toBeDisabled();
	} );

	test( 'a resend cannot put back settings saved while it was in flight', async () => {
		const user = userEvent.setup();
		queryClient.setQueryData( userSettingsQuery().queryKey, {
			...pendingSettings,
			first_name: 'Jon',
		} );

		render( <EmailVerificationBanner userSettings={ pendingSettings } isEmailVerified />, {
			queryClient,
		} );

		expect( await screen.findByText( 'Verify your email' ) ).toBeVisible();

		// The endpoint answers with the whole account, as it stood before the save below.
		let deliverReply: () => void;
		nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/settings', ( body ) => 'user_email' in body )
			.reply(
				() =>
					new Promise( ( resolve ) => {
						deliverReply = () => resolve( [ 200, { ...pendingSettings, first_name: 'Jon' } ] );
					} )
			);

		await user.click( screen.getByRole( 'button', { name: 'Resend email' } ) );

		// An ordinary settings save lands first. It carries no address, so nothing orders it
		// against the resend.
		queryClient.setQueryData( userSettingsQuery().queryKey, {
			...pendingSettings,
			first_name: 'Jane',
		} );
		deliverReply!();

		// The button taking up its wait is what tells us the response has been handled.
		await waitFor( () =>
			expect( screen.getByRole( 'button', { name: /Resend email \(/ } ) ).toBeDisabled()
		);
		expect(
			queryClient.getQueryData< UserSettings >( userSettingsQuery().queryKey )?.first_name
		).toBe( 'Jane' );
	} );

	test( 'withholds the resend while a cancellation is in flight', async () => {
		const user = userEvent.setup();
		queryClient.setQueryData( userSettingsQuery().queryKey, pendingSettings );

		render( <EmailVerificationBanner userSettings={ pendingSettings } isEmailVerified />, {
			queryClient,
		} );

		expect( await screen.findByText( 'Verify your email' ) ).toBeVisible();

		let resendReached = false;
		// Held open so the cancellation is still running while the resend is checked.
		let deliverCancel: () => void;
		nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/settings', ( body ) => 'user_email_change_pending' in body )
			.reply(
				() =>
					new Promise( ( resolve ) => {
						deliverCancel = () =>
							resolve( [ 200, { ...pendingSettings, user_email_change_pending: false } ] );
					} )
			);
		nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/settings', ( body ) => 'user_email' in body )
			.reply( 200, () => {
				resendReached = true;
				return pendingSettings;
			} );

		await user.click( screen.getByRole( 'button', { name: 'Cancel the pending email change' } ) );

		// The other order matters just as much: a resend started here would re-save the address
		// the cancellation is in the middle of clearing, putting the change straight back.
		expect( screen.getByRole( 'button', { name: 'Resend email' } ) ).toBeDisabled();
		deliverCancel!();

		await waitFor( () =>
			expect(
				queryClient.getQueryData< UserSettings >( userSettingsQuery().queryKey )
					?.user_email_change_pending
			).toBe( false )
		);
		expect( resendReached ).toBe( false );
	} );

	test( 'reports a refused send rather than announcing an email nobody was sent', async () => {
		const user = userEvent.setup();

		render(
			<>
				<EmailVerificationBanner userSettings={ settings } isEmailVerified={ false } />
				<Snackbars />
			</>
		);

		expect( await screen.findByText( 'Verify your email' ) ).toBeVisible();

		// The endpoint answers 200 and reports the refusal in the body.
		nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/send-verification-email' )
			.reply( 200, { success: false } );

		await user.click( screen.getByRole( 'button', { name: 'Resend email' } ) );

		// Scoped to the snackbar: the live region mirrors it.
		await waitFor( () => expect( notificationSnackBar() ).toHaveTextContent( 'Failed to resend' ) );
		// And nothing is held back over an email that never went out.
		await waitFor( () =>
			expect( screen.getByRole( 'button', { name: 'Resend email' } ) ).toBeEnabled()
		);
	} );

	test( 'cancels the pending email change from the banner', async () => {
		const user = userEvent.setup();

		render( <EmailVerificationBanner userSettings={ pendingSettings } isEmailVerified /> );

		expect( await screen.findByText( 'Verify your email' ) ).toBeVisible();

		const scope = nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/settings', ( body ) => {
				expect( body ).toEqual( expect.objectContaining( { user_email_change_pending: false } ) );
				return true;
			} )
			.reply( 200, { ...pendingSettings, user_email_change_pending: false } );

		await user.click( screen.getByRole( 'button', { name: 'Cancel the pending email change' } ) );

		await waitFor( () => {
			expect( scope.isDone() ).toBe( true );
		} );
	} );

	test( 'does not offer to cancel when the email is unverified with no pending change', async () => {
		render( <EmailVerificationBanner userSettings={ settings } isEmailVerified={ false } /> );

		expect( await screen.findByText( 'Verify your email' ) ).toBeVisible();
		expect(
			screen.queryByRole( 'button', { name: 'Cancel the pending email change' } )
		).not.toBeInTheDocument();
	} );

	test( 'shows verification banner for an unverified email and resends via the dedicated endpoint', async () => {
		const user = userEvent.setup();

		render( <EmailVerificationBanner userSettings={ settings } isEmailVerified={ false } /> );

		expect( await screen.findByText( 'Verify your email' ) ).toBeVisible();

		const scope = nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/send-verification-email' )
			.reply( 200, {} );

		await user.click( screen.getByRole( 'button', { name: 'Resend email' } ) );

		await waitFor( () => {
			expect( scope.isDone() ).toBe( true );
		} );
	} );

	test( 'does not show the banner when the email is verified and no change is pending', async () => {
		render( <EmailVerificationBanner userSettings={ settings } isEmailVerified /> );

		await waitFor( () => {
			expect( screen.queryByText( 'Verify your email' ) ).not.toBeInTheDocument();
		} );
	} );

	test( 'shows success banner after email change verification', async () => {
		setSearch( '?new_email_result=1' );

		render( <EmailVerificationBanner userSettings={ settings } isEmailVerified /> );

		expect( await screen.findByText( 'Email address updated' ) ).toBeVisible();
		expect( screen.getByText( 'Update domain contacts' ) ).toBeVisible();
	} );

	// The reason is optional so this can ship before the server sends one; without the fallback a
	// failure would announce nothing at all.
	test( 'reports a failed email change generically when no reason is given', async () => {
		setSearch( '?new_email_result=0' );

		render(
			<>
				<EmailVerificationBanner userSettings={ settings } isEmailVerified />
				<Snackbars />
			</>
		);

		await waitFor( () =>
			expect( notificationSnackBar() ).toHaveTextContent( 'invalid or has expired' )
		);
	} );

	// Blaming the link would send the user back to Resend, which re-sends to the address that is
	// already taken.
	test( 'says the address is taken rather than blaming the link', async () => {
		setSearch( '?new_email_result=0&new_email_error=email_in_use' );

		render(
			<>
				<EmailVerificationBanner userSettings={ settings } isEmailVerified />
				<Snackbars />
			</>
		);

		await waitFor( () =>
			expect( notificationSnackBar() ).toHaveTextContent(
				'already used by another WordPress.com account'
			)
		);
		expect( notificationSnackBar() ).not.toHaveTextContent( 'invalid or has expired' );
	} );

	test( 'shows success banner after initial email verification', async () => {
		setSearch( '?verified=1' );

		render( <EmailVerificationBanner userSettings={ settings } isEmailVerified /> );

		expect( await screen.findByText( 'Email verified' ) ).toBeVisible();
		expect( screen.queryByText( 'Update domain contacts' ) ).not.toBeInTheDocument();
	} );
} );

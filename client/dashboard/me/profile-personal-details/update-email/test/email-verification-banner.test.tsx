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
import { useState } from 'react';
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

// Switches between the original address and a saved correction, as the settings query would.
// Snackbars are mounted because the shared render helper doesn't, and these cases read notices.
const otherPendingSettings = {
	...pendingSettings,
	new_user_email: 'corrected@example.com',
} as unknown as UserSettings;

function TargetSwitcher() {
	const [ stage, setStage ] = useState< 'original' | 'pending' | 'corrected' >( 'original' );
	const forStage = {
		original: settings,
		pending: pendingSettings,
		corrected: otherPendingSettings,
	}[ stage ];
	return (
		<>
			<button onClick={ () => setStage( 'pending' ) }>save-change</button>
			<button onClick={ () => setStage( 'original' ) }>undo-change</button>
			<button onClick={ () => setStage( 'corrected' ) }>correct-again</button>
			<EmailVerificationBanner userSettings={ forStage } isEmailVerified={ stage !== 'original' } />
			<Snackbars />
		</>
	);
}

describe( '<EmailVerificationBanner>', () => {
	// Both of these outlive a render, so one case's announcement would otherwise be found by the
	// next: the notices store (where snackbars are their own type, not cleared by default), and
	// the live region `@wordpress/a11y` keeps on the body holding the last thing it announced.
	afterEach( () => {
		dispatch( noticesStore ).removeAllNotices( 'snackbar' );
		dispatch( noticesStore ).removeAllNotices();
		document.querySelectorAll( '.a11y-speak-region' ).forEach( ( region ) => {
			region.textContent = '';
		} );
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

	test( 'sets a cooldown aside while a pending change is in play, then applies it again', async () => {
		const user = userEvent.setup();

		// Stands in for the settings query updating after a correction is saved; the banner has
		// to switch target inside the same mounted tree.
		render( <TargetSwitcher /> );

		expect( await screen.findByText( 'Verify your email' ) ).toBeVisible();

		nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/send-verification-email' )
			.reply( 429, { error: 'throttled', data: { retry_after: 4 * 60 * 60 } } );

		await user.click( screen.getByRole( 'button', { name: 'Resend email' } ) );
		expect( await screen.findByRole( 'button', { name: /Resend email \(/ } ) ).toBeDisabled();

		// The pending-change path isn't rate limited, so the wait doesn't apply there.
		await user.click( screen.getByRole( 'button', { name: 'save-change' } ) );
		expect( await screen.findByRole( 'button', { name: 'Resend email' } ) ).toBeEnabled();

		// Cancelling puts the throttled endpoint back in use, and the server is still refusing.
		await user.click( screen.getByRole( 'button', { name: 'undo-change' } ) );
		expect( await screen.findByRole( 'button', { name: /Resend email \(/ } ) ).toBeDisabled();
	} );

	test( 'ignores a refusal that lands after the target has changed', async () => {
		const user = userEvent.setup();

		render( <TargetSwitcher /> );

		expect( await screen.findByText( 'Verify your email' ) ).toBeVisible();

		// Still in flight when the correction is saved.
		nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/send-verification-email' )
			.delay( 150 )
			.reply( 429, { error: 'throttled', data: { retry_after: 4 * 60 * 60 } } );

		await user.click( screen.getByRole( 'button', { name: 'Resend email' } ) );
		await user.click( screen.getByRole( 'button', { name: 'save-change' } ) );

		// The refusal describes the address left behind, and the path now in use isn't rate
		// limited at all, so it must not hold this button.
		await waitFor( () =>
			expect( screen.getByRole( 'button', { name: 'Resend email' } ) ).toBeEnabled()
		);
		await new Promise( ( resolve ) => setTimeout( resolve, 300 ) );
		expect( screen.getByRole( 'button', { name: 'Resend email' } ) ).toBeEnabled();
		// And says nothing, rather than telling the reader to wait beside a button that isn't.
		expect( screen.queryByText( /Too many attempts/ ) ).not.toBeInTheDocument();
	} );

	test( 'a late resend does not reinstate a change cancelled while it was in flight', async () => {
		const user = userEvent.setup();
		// The mutations write to the package's own client, not one handed to `render`.
		queryClient.setQueryData( userSettingsQuery().queryKey, pendingSettings );

		render( <EmailVerificationBanner userSettings={ pendingSettings } isEmailVerified />, {
			queryClient,
		} );

		expect( await screen.findByText( 'Verify your email' ) ).toBeVisible();

		// Still in flight when the cancellation lands, so it answers describing a change that by
		// then no longer exists.
		nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/settings', ( body ) => 'user_email' in body )
			.delay( 150 )
			.reply( 200, pendingSettings );
		nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/settings', ( body ) => 'user_email_change_pending' in body )
			.reply( 200, { ...pendingSettings, user_email_change_pending: false } );

		await user.click( screen.getByRole( 'button', { name: 'Resend email' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Cancel the pending email change' } ) );

		await waitFor( () => {
			expect(
				queryClient.getQueryData< UserSettings >( userSettingsQuery().queryKey )
					?.user_email_change_pending
			).toBe( false );
		} );

		// Arriving last, it must not put the cancelled change back.
		await new Promise( ( resolve ) => setTimeout( resolve, 300 ) );
		expect(
			queryClient.getQueryData< UserSettings >( userSettingsQuery().queryKey )
				?.user_email_change_pending
		).toBe( false );
		// Nor may it have marked the settings stale: a refetch it started before the cancellation
		// would answer with the change still pending and overwrite it.
		expect( queryClient.getQueryState( userSettingsQuery().queryKey )?.isInvalidated ).toBe(
			false
		);
	} );

	test( 'holds the button after a pending resend, and frees it for a corrected address', async () => {
		const user = userEvent.setup();

		render( <TargetSwitcher /> );

		// Start on the pending address, which the server does not rate limit.
		await user.click( await screen.findByRole( 'button', { name: 'save-change' } ) );

		nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/settings', ( body ) => 'user_email' in body )
			.reply( 200, pendingSettings );

		await user.click( screen.getByRole( 'button', { name: 'Resend email' } ) );

		// Nothing on the server would stop this mailing the same address repeatedly.
		expect( await screen.findByRole( 'button', { name: /Resend email \(/ } ) ).toBeDisabled();

		// A different pending address hasn't been sent to, so it starts available.
		await user.click( screen.getByRole( 'button', { name: 'correct-again' } ) );
		expect( await screen.findByRole( 'button', { name: 'Resend email' } ) ).toBeEnabled();
	} );

	test( 'a late pending resend does not hold or misreport the address that replaced it', async () => {
		const user = userEvent.setup();

		render( <TargetSwitcher /> );

		await user.click( await screen.findByRole( 'button', { name: 'save-change' } ) );

		// Still in flight when the address is corrected again.
		nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/settings', ( body ) => body.user_email === 'pending@example.com' )
			.delay( 150 )
			.reply( 200, pendingSettings );

		await user.click( screen.getByRole( 'button', { name: 'Resend email' } ) );
		await user.click( screen.getByRole( 'button', { name: 'correct-again' } ) );

		await new Promise( ( resolve ) => setTimeout( resolve, 300 ) );

		// The wait belonged to the address it was sent to, and so does the confirmation.
		expect( screen.getByRole( 'button', { name: 'Resend email' } ) ).toBeEnabled();
		// Selected rather than queried by text: the banner shows the current address, and the a11y
		// live region mirrors whatever the snackbar announced.
		expect( document.querySelector( '.components-snackbar__content' ) ).toHaveTextContent(
			'pending@example.com'
		);
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

		// Scoped to the snackbar: the a11y live region mirrors what it announced.
		await waitFor( () =>
			expect( document.querySelector( '.components-snackbar__content' ) ).toHaveTextContent(
				'Failed to resend'
			)
		);
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
		const originalLocation = window.location;
		Object.defineProperty( window, 'location', {
			value: { ...originalLocation, search: '?new_email_result=1', pathname: '/test' },
			writable: true,
		} );

		render( <EmailVerificationBanner userSettings={ settings } isEmailVerified /> );

		expect( await screen.findByText( 'Email address updated' ) ).toBeVisible();
		expect( screen.getByText( 'Update domain contacts' ) ).toBeVisible();

		Object.defineProperty( window, 'location', {
			value: originalLocation,
			writable: true,
		} );
	} );

	test( 'shows success banner after initial email verification', async () => {
		const originalLocation = window.location;
		Object.defineProperty( window, 'location', {
			value: { ...originalLocation, search: '?verified=1', pathname: '/test' },
			writable: true,
		} );

		render( <EmailVerificationBanner userSettings={ settings } isEmailVerified /> );

		expect( await screen.findByText( 'Email verified' ) ).toBeVisible();
		expect( screen.queryByText( 'Update domain contacts' ) ).not.toBeInTheDocument();

		Object.defineProperty( window, 'location', {
			value: originalLocation,
			writable: true,
		} );
	} );
} );

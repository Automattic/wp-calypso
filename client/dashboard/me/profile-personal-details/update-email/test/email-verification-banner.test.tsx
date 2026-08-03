/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
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

// Switches target the way saving or cancelling a change would, within one mounted tree.
function TargetSwitcher() {
	const [ isPending, setIsPending ] = useState( false );
	return (
		<>
			<button onClick={ () => setIsPending( true ) }>save-change</button>
			<button onClick={ () => setIsPending( false ) }>undo-change</button>
			<EmailVerificationBanner
				userSettings={ isPending ? pendingSettings : settings }
				isEmailVerified={ isPending }
			/>
		</>
	);
}

describe( '<EmailVerificationBanner>', () => {
	// Both outlive a render, so one case's announcement would otherwise be found by the next:
	// snackbars are their own notice type, and `@wordpress/a11y` keeps a live region on the body.
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

	test( 'confirms a pending resend that finishes after the banner has gone', async () => {
		const user = userEvent.setup();

		const { unmount } = render(
			<>
				<EmailVerificationBanner userSettings={ pendingSettings } isEmailVerified />
				<Snackbars />
			</>
		);

		expect( await screen.findByText( 'Verify your email' ) ).toBeVisible();

		nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/settings', ( body ) => 'user_email' in body )
			.delay( 100 )
			.reply( 200, pendingSettings );

		await user.click( screen.getByRole( 'button', { name: 'Resend email' } ) );
		// Navigating away mid-request must not swallow the outcome.
		unmount();

		render( <Snackbars /> );
		await waitFor( () =>
			expect( document.querySelector( '.components-snackbar__content' ) ).toHaveTextContent(
				'pending@example.com'
			)
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

	test( 'sets a cooldown aside while a pending change is in play, then applies it again', async () => {
		const user = userEvent.setup();

		// Stands in for the settings query updating after a correction is saved.
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

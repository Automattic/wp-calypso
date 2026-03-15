/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
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

describe( '<EmailVerificationBanner>', () => {
	test( 'shows verification banner and resends email', async () => {
		const user = userEvent.setup();

		render( <EmailVerificationBanner userData={ pendingSettings } /> );

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

	test( 'shows success banner after email change verification', async () => {
		const originalLocation = window.location;
		Object.defineProperty( window, 'location', {
			value: { ...originalLocation, search: '?new_email_result=1', pathname: '/test' },
			writable: true,
		} );

		render( <EmailVerificationBanner userData={ settings } /> );

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

		render( <EmailVerificationBanner userData={ settings } /> );

		expect( await screen.findByText( 'Email verified' ) ).toBeVisible();
		expect( screen.queryByText( 'Update domain contacts' ) ).not.toBeInTheDocument();

		Object.defineProperty( window, 'location', {
			value: originalLocation,
			writable: true,
		} );
	} );
} );

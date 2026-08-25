/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import EmailSection from '../email-section';
import type { AccountRecovery, User, UserSettings } from '@automattic/api-core';

const ACCOUNT_EMAIL = 'owner@mycompany.com';

function mockAccountRecovery( data: Partial< AccountRecovery > ) {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/account-recovery' )
		.query( true )
		.reply( 200, {
			email: '',
			email_validated: false,
			phone: null,
			phone_validated: false,
			...data,
		} );
}

const userSettings = { user_email: ACCOUNT_EMAIL } as UserSettings;
const bouncingUser = { ID: 1, email: ACCOUNT_EMAIL, email_bouncing: true } as User;
const noop = () => {};

const CUSTOM_DOMAIN_WARNING = /uses a custom domain/;
const BOUNCING_ERROR = /bouncing back/;

describe( '<EmailSection>', () => {
	test( 'shows the custom-domain warning when the only recovery email matches the account email', async () => {
		// The recovery email is the same address as the account email, so it provides no recovery
		// value and the "set up a recovery email" warning should still appear.
		mockAccountRecovery( { email: ACCOUNT_EMAIL, email_validated: true } );

		render(
			<EmailSection
				value={ ACCOUNT_EMAIL }
				onChange={ noop }
				userSettings={ userSettings }
				isEmailVerified
			/>
		);

		expect( await screen.findByText( CUSTOM_DOMAIN_WARNING ) ).toBeVisible();
	} );

	test( 'hides the custom-domain warning when a distinct recovery email is set', async () => {
		mockAccountRecovery( { email: 'recovery@othersite.com', email_validated: true } );

		render(
			<EmailSection
				value={ ACCOUNT_EMAIL }
				onChange={ noop }
				userSettings={ userSettings }
				isEmailVerified
			/>
		);

		await waitFor( () => {
			expect( screen.queryByText( CUSTOM_DOMAIN_WARNING ) ).not.toBeInTheDocument();
		} );
	} );

	test( 'flags the field when the account email is bouncing', async () => {
		mockAccountRecovery( { email: 'recovery@othersite.com', email_validated: true } );

		render(
			<EmailSection
				value={ ACCOUNT_EMAIL }
				onChange={ noop }
				userSettings={ userSettings }
				isEmailVerified
			/>,
			{ user: bouncingUser }
		);

		expect( await screen.findByText( BOUNCING_ERROR ) ).toBeVisible();
	} );

	test( 'drops the bouncing message once a different address is typed', async () => {
		mockAccountRecovery( { email: 'recovery@othersite.com', email_validated: true } );

		render(
			<EmailSection
				value="new@example.com"
				onChange={ noop }
				userSettings={ userSettings }
				isEmailVerified
			/>,
			{ user: bouncingUser }
		);

		expect( await screen.findByText( 'Email address looks good!' ) ).toBeVisible();
		expect( screen.queryByText( BOUNCING_ERROR ) ).not.toBeInTheDocument();
	} );

	test( 'hides the bouncing message when the account email is fine', async () => {
		mockAccountRecovery( { email: 'recovery@othersite.com', email_validated: true } );

		render(
			<EmailSection
				value={ ACCOUNT_EMAIL }
				onChange={ noop }
				userSettings={ userSettings }
				isEmailVerified
			/>
		);

		await waitFor( () => {
			expect( screen.queryByText( BOUNCING_ERROR ) ).not.toBeInTheDocument();
		} );
	} );
} );

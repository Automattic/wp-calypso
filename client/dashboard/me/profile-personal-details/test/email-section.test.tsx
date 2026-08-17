/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import EmailSection from '../email-section';
import type { AccountRecovery, UserSettings } from '@automattic/api-core';

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
const noop = () => {};

const CUSTOM_DOMAIN_WARNING = /uses a custom domain/;
const BOUNCING_WARNING = /bouncing back/;

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

	test( 'warns below the field when the account email is bouncing', async () => {
		mockAccountRecovery( { email: 'recovery@othersite.com', email_validated: true } );

		render(
			<EmailSection
				value={ ACCOUNT_EMAIL }
				onChange={ noop }
				userSettings={ { ...userSettings, user_email_bouncing: true } }
				isEmailVerified
			/>
		);

		expect( await screen.findByText( BOUNCING_WARNING ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'set up a recovery email' } ) ).toBeVisible();
	} );

	test( 'drops the bouncing warning once a different address is typed', async () => {
		mockAccountRecovery( { email: 'recovery@othersite.com', email_validated: true } );

		render(
			<EmailSection
				value="new@example.com"
				onChange={ noop }
				userSettings={ { ...userSettings, user_email_bouncing: true } }
				isEmailVerified
			/>
		);

		expect( await screen.findByText( 'Email address looks good!' ) ).toBeVisible();
		expect( screen.queryByText( BOUNCING_WARNING ) ).not.toBeInTheDocument();
	} );

	test( 'hides the bouncing warning when the account email is fine', async () => {
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
			expect( screen.queryByText( BOUNCING_WARNING ) ).not.toBeInTheDocument();
		} );
	} );
} );

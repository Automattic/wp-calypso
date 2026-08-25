/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import RecoveryEmail from '../recovery-email';
import type { AccountRecovery, UserSettings } from '@automattic/api-core';

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

function mockUserSettings( data: Partial< UserSettings > ) {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/settings' )
		.query( true )
		.reply( 200, data );
}

const WARNING_TEXT = /same as your account email/;

describe( '<RecoveryEmail>', () => {
	test( 'warns when the recovery email matches the account email', async () => {
		mockAccountRecovery( { email: 'owner@example.com', email_validated: true } );
		mockUserSettings( { user_email: 'owner@example.com' } );

		render( <RecoveryEmail /> );

		expect( await screen.findByText( WARNING_TEXT ) ).toBeVisible();
	} );

	test( 'matches case-insensitively', async () => {
		mockAccountRecovery( { email: 'Owner@Example.com', email_validated: true } );
		mockUserSettings( { user_email: 'owner@example.com' } );

		render( <RecoveryEmail /> );

		expect( await screen.findByText( WARNING_TEXT ) ).toBeVisible();
	} );

	test( 'does not warn when the recovery email differs from the account email', async () => {
		mockAccountRecovery( { email: 'recovery@example.com', email_validated: true } );
		mockUserSettings( { user_email: 'owner@example.com' } );

		render( <RecoveryEmail /> );

		await screen.findByRole( 'heading', { name: 'Recovery email' } );
		await waitFor( () => {
			expect( screen.queryByText( WARNING_TEXT ) ).not.toBeInTheDocument();
		} );
	} );
} );

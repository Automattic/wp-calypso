/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../../test-utils';
import EmailVerificationNotice from '../index';
import type { User, UserSettings } from '@automattic/api-core';

function mockUserSettings( data: Partial< UserSettings > ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/settings' )
		.query( true )
		.reply( 200, data );
}

describe( '<EmailVerificationNotice>', () => {
	test( 'sends a pending email change to WordPress.com to resend', async () => {
		mockUserSettings( { user_email_change_pending: true, new_user_email: 'new@example.com' } );

		render( <EmailVerificationNotice /> );

		expect( await screen.findByText( /new@example\.com/ ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: /Resend email/ } ) ).toHaveAttribute(
			'href',
			expect.stringMatching( /\/me$/ )
		);
		expect( screen.queryByRole( 'button', { name: 'Resend email' } ) ).not.toBeInTheDocument();
	} );

	test( 'resends in place when the email is just unverified', async () => {
		mockUserSettings( { user_email_change_pending: false } );

		render( <EmailVerificationNotice />, {
			user: { ID: 1, email: 'test@example.com', email_verified: false } as User,
		} );

		expect( await screen.findByRole( 'button', { name: 'Resend email' } ) ).toBeVisible();
		expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
	} );
} );

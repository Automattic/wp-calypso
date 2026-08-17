/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import Account from '../index';
import type { UserSettings } from '@automattic/api-core';

const ACCOUNT_EMAIL = 'owner@example.com';
const BOUNCING_NOTICE_TITLE = 'Your account email isn’t receiving our messages';

function mockUserSettings( data: Partial< UserSettings > ) {
	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( '/rest/v1.1/me/settings' )
		.query( true )
		.reply( 200, {
			user_email: ACCOUNT_EMAIL,
			user_login: 'owner',
			email_verified: true,
			...data,
		} );
}

describe( '<Account>', () => {
	beforeEach( () => {
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( '/rest/v1.2/read/teams' )
			.query( true )
			.reply( 200, { teams: [] } );

		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( '/rest/v1.1/me/account-recovery' )
			.query( true )
			.reply( 200, { email: '', email_validated: false, phone: null, phone_validated: false } );
	} );

	test( 'shows the bouncing-email notice when the account email is bouncing', async () => {
		mockUserSettings( { user_email_bouncing: true } );

		render( <Account /> );

		expect( await screen.findByText( BOUNCING_NOTICE_TITLE ) ).toBeVisible();
	} );

	test( 'hides the bouncing-email notice when the account email is fine', async () => {
		mockUserSettings( { user_email_bouncing: false } );

		render( <Account /> );

		await screen.findByRole( 'heading', { name: 'Personal details' } );
		expect( screen.queryByText( BOUNCING_NOTICE_TITLE ) ).not.toBeInTheDocument();
	} );
} );

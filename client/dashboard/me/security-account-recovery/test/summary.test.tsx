/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import SecurityAccountRecoverySummary from '../summary';
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

describe( '<SecurityAccountRecoverySummary>', () => {
	test( 'flags a recovery email that matches the account email', async () => {
		mockAccountRecovery( { email: 'owner@example.com', email_validated: true } );
		mockUserSettings( { user_email: 'owner@example.com' } );

		render( <SecurityAccountRecoverySummary /> );

		expect( await screen.findByText( 'Recovery email matches account email' ) ).toBeVisible();
		expect( screen.queryByText( 'Email added' ) ).not.toBeInTheDocument();
	} );

	test( 'shows "Email added" for a distinct validated recovery email', async () => {
		mockAccountRecovery( { email: 'recovery@example.com', email_validated: true } );
		mockUserSettings( { user_email: 'owner@example.com' } );

		render( <SecurityAccountRecoverySummary /> );

		expect( await screen.findByText( 'Email added' ) ).toBeVisible();
		expect( screen.queryByText( 'Recovery email matches account email' ) ).not.toBeInTheDocument();
	} );
} );

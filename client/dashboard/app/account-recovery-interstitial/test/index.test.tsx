/**
 * @jest-environment jsdom
 */

import { disable, enable } from '@automattic/calypso-config';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import { RECOVERY_INTERSTITIAL_FLAG, RECOVERY_INTERSTITIAL_SNOOZE_META } from '../constants';
import AccountRecoveryInterstitial from '../index';
import type { AccountRecovery, UserSettings } from '@automattic/api-core';

const NONE_RECOVERY = {
	email: '',
	email_validated: false,
	phone: null,
	phone_validated: false,
} as AccountRecovery;

const STRONG_RECOVERY = {
	email: 'recovery@example.com',
	email_validated: true,
	phone: null,
	phone_validated: false,
} as AccountRecovery;

function mockAccountRecovery( data: AccountRecovery ) {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/account-recovery' )
		.query( true )
		.reply( 200, data );
}

function mockUserSettings( data: Partial< UserSettings > ) {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/settings' )
		.query( true )
		.reply( 200, data );
}

beforeAll( () => {
	enable( RECOVERY_INTERSTITIAL_FLAG );
} );

afterAll( () => {
	disable( RECOVERY_INTERSTITIAL_FLAG );
} );

afterEach( () => {
	nock.cleanAll();
} );

describe( '<AccountRecoveryInterstitial>', () => {
	test( 'shows the modal and records an impression for a user with no recovery method', async () => {
		mockAccountRecovery( NONE_RECOVERY );
		mockUserSettings( { two_step_enabled: false } );

		const { recordTracksEvent } = render( <AccountRecoveryInterstitial /> );

		const dialog = await screen.findByRole( 'dialog', {
			name: 'Add a recovery method in case you get locked out',
		} );
		expect( dialog ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Add a recovery method' } ) ).toBeVisible();

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_account_recovery_interstitial_impression',
			{ security_level: 'none' }
		);
	} );

	test( 'does not show for a fully-covered user', async () => {
		mockAccountRecovery( STRONG_RECOVERY );
		mockUserSettings( { two_step_enabled: true } );

		render( <AccountRecoveryInterstitial /> );

		// Give the queries a chance to resolve, then assert nothing renders.
		await waitFor( () => {
			expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		} );
	} );

	test( 'does not show when the user is currently snoozed', async () => {
		const future = Math.floor( Date.now() / 1000 ) + 7 * 86400;
		mockAccountRecovery( NONE_RECOVERY );
		mockUserSettings( {
			two_step_enabled: false,
			[ RECOVERY_INTERSTITIAL_SNOOZE_META ]: future,
		} );

		render( <AccountRecoveryInterstitial /> );

		await waitFor( () => {
			expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		} );
	} );

	test( 'snoozes (writes the meta field and closes) when "Remind me later" is clicked', async () => {
		const user = userEvent.setup();
		mockAccountRecovery( NONE_RECOVERY );
		mockUserSettings( { two_step_enabled: false } );

		let snoozedValue: number | undefined;
		const savePost = nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/settings', ( body ) => {
				snoozedValue = body[ RECOVERY_INTERSTITIAL_SNOOZE_META ];
				return typeof snoozedValue === 'number';
			} )
			.query( true )
			.reply( 200, {} );

		const { recordTracksEvent } = render( <AccountRecoveryInterstitial /> );

		await screen.findByRole( 'dialog' );
		await user.click( screen.getByRole( 'button', { name: 'Remind me later' } ) );

		await waitFor( () => {
			expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		} );
		expect( savePost.isDone() ).toBe( true );
		// none-tier window is 14 days into the future.
		expect( snoozedValue ).toBeGreaterThan( Math.floor( Date.now() / 1000 ) );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_account_recovery_interstitial_dismiss',
			{ security_level: 'none' }
		);
	} );
} );

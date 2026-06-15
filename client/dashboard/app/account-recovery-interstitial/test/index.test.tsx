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

// Has a validated recovery email but (paired with two_step_enabled: false) no 2FA.
const EMAIL_ONLY_RECOVERY = {
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
			name: 'Add a way back into your account',
		} );
		expect( dialog ).toBeVisible();
		expect(
			screen.getByRole( 'button', { name: 'Set up recovery email or phone' } )
		).toBeVisible();
		expect(
			screen.getByRole( 'button', { name: 'Add two-step authentication and backup codes' } )
		).toBeVisible();

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_account_recovery_interstitial_impression',
			{ security_level: 'none', recovery_status: 'none' }
		);
	} );

	test( 'shows the "add 2FA" copy for a user with a recovery method but no 2FA', async () => {
		mockAccountRecovery( EMAIL_ONLY_RECOVERY );
		mockUserSettings( { two_step_enabled: false } );

		const { recordTracksEvent } = render( <AccountRecoveryInterstitial /> );

		expect(
			await screen.findByRole( 'dialog', { name: 'Take your security further' } )
		).toBeVisible();
		expect(
			screen.getByRole( 'button', { name: 'Set up two-step authentication' } )
		).toBeVisible();
		expect(
			screen.getByRole( 'button', { name: 'Review recovery email or phone' } )
		).toBeVisible();
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_account_recovery_interstitial_impression',
			{ security_level: 'partial', recovery_status: 'add-two-factor' }
		);
	} );

	test( 'shows the "add a recovery method" copy for a user with 2FA but no recovery method', async () => {
		mockAccountRecovery( NONE_RECOVERY );
		mockUserSettings( { two_step_enabled: true } );

		render( <AccountRecoveryInterstitial /> );

		expect(
			await screen.findByRole( 'dialog', { name: 'Don’t get locked out of your account' } )
		).toBeVisible();
		expect(
			screen.getByRole( 'button', { name: 'Set up recovery email or phone' } )
		).toBeVisible();
		expect(
			screen.getByRole( 'button', { name: 'Review two-step authentication and add backup codes' } )
		).toBeVisible();
	} );

	test( 'shows the "download backup codes" copy when 2FA + recovery are set but backup codes are not', async () => {
		mockAccountRecovery( STRONG_RECOVERY );
		mockUserSettings( { two_step_enabled: true, two_step_backup_codes_printed: false } );

		const { recordTracksEvent } = render( <AccountRecoveryInterstitial /> );

		expect(
			await screen.findByRole( 'dialog', { name: 'Don’t get locked out of your account' } )
		).toBeVisible();
		expect(
			screen.getByRole( 'button', {
				name: 'Review two-step authentication and download backup codes',
			} )
		).toBeVisible();
		expect(
			screen.getByRole( 'button', { name: 'Review recovery email or phone' } )
		).toBeVisible();
		// Coarse tier stays 'strong'; the fine-grained dimension captures the missing backup codes.
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_account_recovery_interstitial_impression',
			{ security_level: 'strong', recovery_status: 'add-backup-codes' }
		);
	} );

	test( 'shows the strong-tier modal with masked recovery details for a fully-covered user', async () => {
		mockAccountRecovery( STRONG_RECOVERY );
		mockUserSettings( { two_step_enabled: true, two_step_backup_codes_printed: true } );

		const { recordTracksEvent } = render( <AccountRecoveryInterstitial /> );

		const dialog = await screen.findByRole( 'dialog', { name: 'Still have access to these?' } );
		expect( dialog ).toBeVisible();
		// Recovery email is masked in the body copy.
		expect( screen.getByText( /r••••@example\.com/ ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Yes, all good' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Update recovery information' } ) ).toBeVisible();

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_account_recovery_interstitial_impression',
			{ security_level: 'strong', recovery_status: 'strong' }
		);
	} );

	test( 'confirming "Yes, all good" snoozes for the strong window and records a cta_click', async () => {
		const user = userEvent.setup();
		mockAccountRecovery( STRONG_RECOVERY );
		mockUserSettings( { two_step_enabled: true, two_step_backup_codes_printed: true } );

		let snoozedValue: number | undefined;
		const savePost = nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/settings', ( body ) => {
				snoozedValue = body[ RECOVERY_INTERSTITIAL_SNOOZE_META ];
				return typeof snoozedValue === 'number';
			} )
			.query( true )
			.reply( 200, {} );

		const { recordTracksEvent } = render( <AccountRecoveryInterstitial /> );

		await screen.findByRole( 'dialog', { name: 'Still have access to these?' } );
		await user.click( screen.getByRole( 'button', { name: 'Yes, all good' } ) );

		await waitFor( () => {
			expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		} );
		expect( savePost.isDone() ).toBe( true );
		// strong-tier window is 365 days into the future.
		expect( snoozedValue ).toBeGreaterThan( Math.floor( Date.now() / 1000 ) + 300 * 86400 );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_account_recovery_interstitial_cta_click',
			{ security_level: 'strong', recovery_status: 'strong', cta_id: 'confirm_recovery' }
		);
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

	test( 'snoozes (writes the meta field and closes) when the reminder link is clicked', async () => {
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
		// none-tier window is 14 days, surfaced in the reminder label.
		await user.click( screen.getByRole( 'button', { name: 'Remind me in 14 days' } ) );

		await waitFor( () => {
			expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		} );
		expect( savePost.isDone() ).toBe( true );
		// none-tier window is 14 days into the future.
		expect( snoozedValue ).toBeGreaterThan( Math.floor( Date.now() / 1000 ) );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_account_recovery_interstitial_dismiss',
			{ security_level: 'none', recovery_status: 'none' }
		);
	} );
} );

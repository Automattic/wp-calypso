/**
 * @jest-environment jsdom
 * @jest-environment-options { "url": "https://my.localhost/" }
 */

import { disable, enable } from '@automattic/calypso-config';
import { QueryClient } from '@tanstack/react-query';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import AccountRecoveryInterstitial from '../index';
import type { AccountRecovery, UserPreferences, UserSettings } from '@automattic/api-core';

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
	return nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/account-recovery' )
		.query( true )
		.reply( 200, data );
}

function mockUserSettings( data: Partial< UserSettings > ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/settings' )
		.query( true )
		.reply( 200, data );
}

function mockPreferences( calypso_preferences: Partial< UserPreferences > = {} ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences } );
}

const EXPERIMENT_NAME = 'calypso_onboarding_account_recovery_modal_202606';
const TREATMENT_VARIATION = 'no_recovery_modal';

// The interstitial is hidden only for users in the `no_recovery_modal` treatment; control and
// unassigned users still see it. Seed a live assignment into the storage ExPlat reads from, so the
// real `useExperiment` hook resolves to the given variation through its normal code path — no
// network call, no mocking. `loadExperimentAssignment` returns a stored, still-alive assignment
// before hitting the server.
function assignExperiment( variationName: string | null = null ) {
	window.localStorage.setItem(
		`explat-experiment--${ EXPERIMENT_NAME }`,
		JSON.stringify( {
			experimentName: EXPERIMENT_NAME,
			variationName,
			retrievedTimestamp: Date.now(),
			ttl: 3600,
		} )
	);
}

describe( '<AccountRecoveryInterstitial>', () => {
	beforeEach( () => {
		assignExperiment();
		// On in the test config by default; the non-welcome-modal tests expect it off so the nudge is
		// not held back. Tests that need it explicitly enable it.
		disable( 'dashboard/opt-in-welcome-modal' );
	} );

	afterEach( () => {
		window.localStorage.clear();
		delete window.isSupportSession;
		disable( 'dashboard/opt-in-welcome-modal' );
	} );

	test( 'shows the modal and records an impression for a user with no recovery method', async () => {
		mockAccountRecovery( NONE_RECOVERY );
		mockUserSettings( { two_step_enabled: false } );
		mockPreferences();

		const { recordTracksEvent } = render( <AccountRecoveryInterstitial /> );

		const dialog = await screen.findByRole( 'dialog', {
			name: 'Add a way back into your account',
		} );
		expect( dialog ).toBeVisible();
		expect(
			screen.getByRole( 'button', { name: 'Set up recovery email or phone' } )
		).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Add two-step authentication' } ) ).toBeVisible();

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_account_recovery_nudge_interstitial_impression',
			{
				security_level: 'none',
				has_recovery_email: false,
				has_recovery_phone: false,
				has_two_factor: false,
				has_backup_codes: false,
			}
		);
	} );

	test( 'shows the "add 2FA" copy for a user with a recovery method but no 2FA', async () => {
		mockAccountRecovery( EMAIL_ONLY_RECOVERY );
		mockUserSettings( { two_step_enabled: false } );
		mockPreferences();

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
			'calypso_account_recovery_nudge_interstitial_impression',
			{
				security_level: 'partial-has-recovery',
				has_recovery_email: true,
				has_recovery_phone: false,
				has_two_factor: false,
				has_backup_codes: false,
			}
		);
	} );

	test( 'shows the "add a recovery method" copy for a user with 2FA but no recovery method', async () => {
		mockAccountRecovery( NONE_RECOVERY );
		mockUserSettings( { two_step_enabled: true } );
		mockPreferences();

		render( <AccountRecoveryInterstitial /> );

		expect(
			await screen.findByRole( 'dialog', { name: 'Don’t get locked out of your account' } )
		).toBeVisible();
		expect(
			screen.getByRole( 'button', { name: 'Set up recovery email or phone' } )
		).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Download backup codes' } ) ).toBeVisible();
	} );

	test( 'shows the "download backup codes" copy when 2FA + recovery are set but backup codes are not', async () => {
		mockAccountRecovery( STRONG_RECOVERY );
		mockUserSettings( { two_step_enabled: true, two_step_backup_codes_printed: false } );
		mockPreferences();

		const { recordTracksEvent } = render( <AccountRecoveryInterstitial /> );

		expect(
			await screen.findByRole( 'dialog', { name: 'Don’t get locked out of your account' } )
		).toBeVisible();
		expect(
			screen.getByRole( 'button', {
				name: 'Download backup codes',
			} )
		).toBeVisible();
		expect(
			screen.getByRole( 'button', { name: 'Review recovery email or phone' } )
		).toBeVisible();
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_account_recovery_nudge_interstitial_impression',
			{
				security_level: 'strong-no-backup-codes',
				has_recovery_email: true,
				has_recovery_phone: false,
				has_two_factor: true,
				has_backup_codes: false,
			}
		);
	} );

	test( 'does not show for a fully-secured user (recovery method, 2FA, and backup codes)', async () => {
		mockAccountRecovery( STRONG_RECOVERY );
		mockUserSettings( { two_step_enabled: true, two_step_backup_codes_printed: true } );
		mockPreferences();

		const { recordTracksEvent } = render( <AccountRecoveryInterstitial /> );

		await waitFor( () => {
			expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		} );
		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );

	test( 'does not show when the user is currently snoozed', async () => {
		const future = Math.floor( Date.now() / 1000 ) + 7 * 86400;
		mockAccountRecovery( NONE_RECOVERY );
		mockUserSettings( { two_step_enabled: false } );
		mockPreferences( { 'account-recovery-interstitial-snoozed-until': future } );

		render( <AccountRecoveryInterstitial /> );

		await waitFor( () => {
			expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		} );
	} );

	test( 'snoozes (writes the preference and closes) when the reminder link is clicked', async () => {
		const user = userEvent.setup();
		mockAccountRecovery( NONE_RECOVERY );
		mockUserSettings( { two_step_enabled: false } );
		mockPreferences();

		let snoozedValue: number | undefined;
		const savePost = nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/preferences', ( body ) => {
				snoozedValue = body.calypso_preferences?.[ 'account-recovery-interstitial-snoozed-until' ];
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
			'calypso_account_recovery_nudge_interstitial_dismiss',
			{
				security_level: 'none',
				has_recovery_email: false,
				has_recovery_phone: false,
				has_two_factor: false,
				has_backup_codes: false,
				snooze_period: 14,
			}
		);
	} );

	test( 'does not show (and records nothing) for a Happiness Engineer in a support session', async () => {
		// An otherwise-eligible user (no recovery method, not snoozed), viewed through a support
		// session. The nudge targets the account owner, not the HE acting on their behalf.
		window.isSupportSession = true;
		mockAccountRecovery( NONE_RECOVERY );
		mockUserSettings( { two_step_enabled: false } );
		mockPreferences();

		const { recordTracksEvent } = render( <AccountRecoveryInterstitial /> );

		await waitFor( () => {
			expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		} );
		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );

	test( 'does not show for a user in the experiment treatment group, even when eligible', async () => {
		// Otherwise-eligible user (no recovery method, not snoozed) assigned to the treatment that
		// suppresses the modal.
		assignExperiment( TREATMENT_VARIATION );
		mockAccountRecovery( NONE_RECOVERY );
		mockUserSettings( { two_step_enabled: false } );
		mockPreferences();

		const { recordTracksEvent } = render( <AccountRecoveryInterstitial /> );

		await waitFor( () => {
			expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		} );
		expect( recordTracksEvent ).not.toHaveBeenCalledWith(
			'calypso_account_recovery_nudge_interstitial_impression',
			expect.anything()
		);
	} );

	test( 'does not show (or record an impression) while the dashboard welcome modal is still pending', async () => {
		// Flag on + a rollout-cohort user (default test user ID 1) who has not opted in and has not
		// dismissed the welcome modal: the welcome modal would take the screen first, so the nudge
		// must stay back.
		enable( 'dashboard/opt-in-welcome-modal' );
		const recoveryScope = mockAccountRecovery( NONE_RECOVERY );
		const settingsScope = mockUserSettings( { two_step_enabled: false } );
		const preferencesScope = mockPreferences();

		const { recordTracksEvent } = render( <AccountRecoveryInterstitial /> );

		// Wait for every input the nudge depends on to load, so "hidden" reflects the welcome-modal
		// gate rather than data that simply hasn't arrived yet.
		await waitFor( () => {
			expect( recoveryScope.isDone() ).toBe( true );
			expect( settingsScope.isDone() ).toBe( true );
			expect( preferencesScope.isDone() ).toBe( true );
		} );

		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		expect( recordTracksEvent ).not.toHaveBeenCalledWith(
			'calypso_account_recovery_nudge_interstitial_impression',
			expect.anything()
		);
	} );

	test( 'shows when the welcome modal has already been dismissed', async () => {
		enable( 'dashboard/opt-in-welcome-modal' );
		mockAccountRecovery( NONE_RECOVERY );
		mockUserSettings( { two_step_enabled: false } );
		mockPreferences( {
			'hosting-dashboard-opt-in-welcome-modal-dismissed': '2026-01-01T00:00:00.000Z',
		} );

		render( <AccountRecoveryInterstitial /> );

		expect(
			await screen.findByRole( 'dialog', { name: 'Add a way back into your account' } )
		).toBeVisible();
	} );

	test( 'stays hidden for the rest of the session after the welcome modal is dismissed mid-session', async () => {
		enable( 'dashboard/opt-in-welcome-modal' );
		const recoveryScope = mockAccountRecovery( NONE_RECOVERY );
		const settingsScope = mockUserSettings( { two_step_enabled: false } );
		const preferencesScope = mockPreferences();

		const queryClient = new QueryClient( {
			defaultOptions: { queries: { retry: false } },
		} );

		render( <AccountRecoveryInterstitial />, { queryClient } );

		// All data loaded with the welcome modal still pending: the nudge is suppressed.
		await waitFor( () => {
			expect( recoveryScope.isDone() ).toBe( true );
			expect( settingsScope.isDone() ).toBe( true );
			expect( preferencesScope.isDone() ).toBe( true );
		} );
		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();

		// Dismissing the welcome modal now flips the preference the nudge reads. Because everything
		// is already loaded, an un-latched nudge would render this same tick (see the
		// dismissed-at-load test above) — so a still-empty screen proves the load-time latch holds.
		act( () => {
			queryClient.setQueryData(
				[ 'me', 'preferences' ],
				( old: Partial< UserPreferences > | undefined ) => ( {
					...old,
					'hosting-dashboard-opt-in-welcome-modal-dismissed': '2026-01-01T00:00:00.000Z',
				} )
			);
		} );

		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
	} );
} );

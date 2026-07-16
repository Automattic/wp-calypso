/**
 * @jest-environment jsdom
 * @jest-environment-options { "url": "https://wordpress.com/" }
 */

import { disable } from '@automattic/calypso-config';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import SecurityKeyReregisterInterstitial from '../index';
import type { UserPreferences, UserTwoStepAuthSecurityKeys } from '@automattic/api-core';

const MISSCOPED_KEY = {
	id: 'key-1',
	name: 'YubiKey',
	rp_id: 'my.wordpress.com',
};

const SCOPED_KEY = {
	id: 'key-2',
	name: 'Titan',
	rp_id: 'wordpress.com',
};

function mockSecurityKeys( registrations: UserTwoStepAuthSecurityKeys[ 'registrations' ] ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/two-step/security-key/get' )
		.query( true )
		.reply( 200, { registrations } );
}

function mockPreferences( calypso_preferences: Partial< UserPreferences > = {} ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences } );
}

describe( '<SecurityKeyReregisterInterstitial>', () => {
	beforeEach( () => {
		// The welcome modal would otherwise hold the screen; keep it off so the nudge isn't held back.
		disable( 'dashboard/opt-in-welcome-modal' );
	} );

	afterEach( () => {
		window.localStorage.clear();
		delete window.isSupportSession;
		nock.cleanAll();
	} );

	test( 'shows the modal and records an impression when a misscoped key exists', async () => {
		mockSecurityKeys( [ MISSCOPED_KEY ] );
		mockPreferences();

		const { recordTracksEvent } = render( <SecurityKeyReregisterInterstitial /> );

		const dialog = await screen.findByRole( 'dialog', {
			name: 'Action needed: re-register your security key',
		} );
		expect( dialog ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Register a new security key' } ) ).toBeVisible();
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_security_key_reregister_interstitial_impression',
			undefined
		);
	} );

	test( 'does not show when every key is correctly scoped', async () => {
		mockSecurityKeys( [ SCOPED_KEY ] );
		mockPreferences();

		const { recordTracksEvent } = render( <SecurityKeyReregisterInterstitial /> );

		await waitFor( () => {
			expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		} );
		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );

	test( 'does not show when there are no security keys', async () => {
		mockSecurityKeys( [] );
		mockPreferences();

		render( <SecurityKeyReregisterInterstitial /> );

		await waitFor( () => {
			expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		} );
	} );

	test( 'does not show while the user is currently snoozed', async () => {
		const future = Math.floor( Date.now() / 1000 ) + 60 * 60;
		mockSecurityKeys( [ MISSCOPED_KEY ] );
		mockPreferences( { 'security-key-reregister-interstitial-snoozed-until': future } );

		render( <SecurityKeyReregisterInterstitial /> );

		await waitFor( () => {
			expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		} );
	} );

	test( 'does not show (and records nothing) for a Happiness Engineer in a support session', async () => {
		window.isSupportSession = true;
		mockSecurityKeys( [ MISSCOPED_KEY ] );
		mockPreferences();

		const { recordTracksEvent } = render( <SecurityKeyReregisterInterstitial /> );

		await waitFor( () => {
			expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		} );
		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );

	test( 'snoozes (writes the preference and closes) when "Remind me later" is clicked', async () => {
		const user = userEvent.setup();
		mockSecurityKeys( [ MISSCOPED_KEY ] );
		mockPreferences();

		let snoozedValue: number | undefined;
		const savePost = nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/preferences', ( body ) => {
				snoozedValue =
					body.calypso_preferences?.[ 'security-key-reregister-interstitial-snoozed-until' ];
				return typeof snoozedValue === 'number';
			} )
			.query( true )
			.reply( 200, {} );

		const { recordTracksEvent } = render( <SecurityKeyReregisterInterstitial /> );

		await screen.findByRole( 'dialog' );
		await user.click( screen.getByRole( 'button', { name: 'Remind me later' } ) );

		await waitFor( () => {
			expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		} );
		expect( savePost.isDone() ).toBe( true );
		expect( snoozedValue ).toBeGreaterThan( Math.floor( Date.now() / 1000 ) );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_security_key_reregister_interstitial_dismiss',
			{ snooze_period: 7 }
		);
	} );
} );

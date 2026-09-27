/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import cookie from 'cookie';
import nock from 'nock';
import { render } from '../../../test-utils';
import DoNotSellCard from '../do-not-sell-card';

const TRACKING_PREFS_COOKIE = 'sensitive_pixel_options';

function setCookie( name: string, value: string ) {
	document.cookie = cookie.serialize( name, value, { path: '/' } );
}

function clearCookies() {
	Object.keys( cookie.parse( document.cookie ) ).forEach( ( name ) => {
		document.cookie = cookie.serialize( name, '', { path: '/', maxAge: -1 } );
	} );
}

function setRegion( countryCode: string, region: string ) {
	setCookie( 'country_code', countryCode );
	setCookie( 'region', region );
}

function getStoredPrefs() {
	const value = cookie.parse( document.cookie )[ TRACKING_PREFS_COOKIE ];
	return value ? JSON.parse( value ) : undefined;
}

function mockSaveSettings() {
	return nock( 'https://public-api.wordpress.com' )
		.post( '/rest/v1.1/me/settings' )
		.reply( 200, ( _uri, body ) => body );
}

const originalFetch = global.fetch;

// The geo lookup uses `fetch` rather than wpcom, so nock can't intercept it.
// TODO: Update nock.
function mockGeoLookup( countryCode: string, region: string ) {
	global.fetch = jest.fn().mockResolvedValue( {
		ok: true,
		json: () => Promise.resolve( { country_short: countryCode, region } ),
	} );
}

async function waitForGeoLookup( countryCode: string ) {
	await waitFor( () => expect( cookie.parse( document.cookie ).country_code ).toBe( countryCode ) );
}

async function findToggle() {
	return screen.findByRole( 'checkbox', { name: 'Do not sell or share my data' } );
}

describe( '<DoNotSellCard>', () => {
	afterEach( () => {
		clearCookies();
		global.fetch = originalFetch;
	} );

	test( 'does not render outside the CCPA zone', async () => {
		mockGeoLookup( 'US', 'Alaska' );

		render( <DoNotSellCard /> );

		await waitForGeoLookup( 'US' );
		expect( screen.queryByRole( 'checkbox' ) ).not.toBeInTheDocument();
	} );

	test( 'does not render in the GDPR zone', async () => {
		mockGeoLookup( 'FR', 'Ile-de-France' );

		render( <DoNotSellCard /> );

		await waitForGeoLookup( 'FR' );
		expect( screen.queryByRole( 'checkbox' ) ).not.toBeInTheDocument();
	} );

	test( 'shows the toggle off by default in the CCPA zone', async () => {
		setRegion( 'US', 'california' );

		render( <DoNotSellCard /> );

		expect( await findToggle() ).not.toBeChecked();
	} );

	test( 'shows the toggle on when advertising was previously refused', async () => {
		setRegion( 'US', 'california' );
		setCookie(
			TRACKING_PREFS_COOKIE,
			JSON.stringify( { ok: true, buckets: { advertising: false } } )
		);

		render( <DoNotSellCard /> );

		expect( await findToggle() ).toBeChecked();
	} );

	test( 'ignores refused analytics when deciding the toggle state', async () => {
		setRegion( 'US', 'texas' );
		setCookie(
			TRACKING_PREFS_COOKIE,
			JSON.stringify( { ok: true, buckets: { analytics: false, advertising: true } } )
		);

		render( <DoNotSellCard /> );

		expect( await findToggle() ).not.toBeChecked();
	} );

	test( 'treats an unknown US region as being in the CCPA zone', async () => {
		setRegion( 'US', 'unknown' );

		render( <DoNotSellCard /> );

		expect( await findToggle() ).toBeVisible();
	} );

	test( 'stores the opt-out in the cookie, saves the setting and records the event', async () => {
		setRegion( 'US', 'california' );
		const saveSettings = mockSaveSettings();

		const { recordTracksEvent } = render( <DoNotSellCard /> );
		await userEvent.click( await findToggle() );

		expect( getStoredPrefs() ).toEqual( {
			ok: true,
			buckets: { essential: true, analytics: true, advertising: false },
		} );
		await waitFor( () => expect( saveSettings.isDone() ).toBe( true ) );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'a8c_ccpa_optout',
			expect.objectContaining( { source: 'calypso' } )
		);
	} );

	test( 'stores the opt-in in the cookie without recording the opt-out event', async () => {
		setRegion( 'US', 'california' );
		setCookie(
			TRACKING_PREFS_COOKIE,
			JSON.stringify( { ok: true, buckets: { advertising: false } } )
		);
		const saveSettings = mockSaveSettings();

		const { recordTracksEvent } = render( <DoNotSellCard /> );
		await userEvent.click( await findToggle() );

		expect( getStoredPrefs() ).toEqual( {
			ok: true,
			buckets: { essential: true, analytics: true, advertising: true },
		} );
		await waitFor( () => expect( saveSettings.isDone() ).toBe( true ) );
		expect( recordTracksEvent ).not.toHaveBeenCalledWith( 'a8c_ccpa_optout', expect.anything() );
	} );
} );

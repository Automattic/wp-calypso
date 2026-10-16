/**
 * @jest-environment jsdom
 */
import apiFetch from '@wordpress/api-fetch';
import {
	ABILITY_COMPLETED_EVENT,
	broadcastAbilityCompleted,
	broadcastToolResult,
} from '../agent-activity-events';
import { applySavedSettings, installWpAdminSettingsSync } from '../wp-admin-settings-sync';

jest.mock( '@wordpress/api-fetch', () => jest.fn() );

const mockApiFetch = apiFetch as unknown as jest.Mock;

const STALE_NOTICE = '#agents-manager-settings-sync-notice-blogname';
const SAVED_NOTICE = 'setting-error-settings_updated';

/** What `/wp/v2/settings` answers for the screen as it loaded. */
const LOADED = {
	title: 'Foo',
	description: 'Just another site',
	users_can_register: false,
	start_of_week: 0,
	date_format: 'F j, Y',
	timezone: 'UTC',
	language: 'en_US',
	posts_per_page: 10,
};

function renderSettingsScreen() {
	document.title = 'General Settings ‹ Foo — WordPress';
	document.body.innerHTML = `
		<div id="wp-admin-bar-site-name"><a class="ab-item" href="/">Foo</a></div>
		<div class="wrap">
			<h1>General Settings</h1>
			<form method="post" action="options.php">
				<label for="blogname">Site Title</label>
				<input name="blogname" type="text" id="blogname" value="Foo" />
				<input name="blogdescription" type="text" id="blogdescription" value="Just another site" />
				<input name="users_can_register" type="checkbox" id="users_can_register" value="1" />
				<select name="start_of_week" id="start_of_week">
					<option value="0" selected>Sunday</option>
					<option value="1">Monday</option>
				</select>
				<input type="radio" name="date_format" value="F j, Y" checked />
				<input type="radio" name="date_format" value="Y-m-d" />
				<select name="timezone_string" id="timezone_string">
					<option value="UTC" selected>UTC</option>
					<option value="Europe/Paris">Paris</option>
				</select>
				<select name="WPLANG" id="WPLANG">
					<option value="" selected>English (United States)</option>
					<option value="fr_FR">Français</option>
				</select>
			</form>
		</div>
	`;
}

const field = < T extends Element >( selector: string ) => document.querySelector( selector ) as T;
const adminBarName = () => field( '#wp-admin-bar-site-name > .ab-item' );

describe( 'applySavedSettings', () => {
	beforeEach( renderSettingsScreen );

	it( 'leaves the screen alone when nothing changed', () => {
		const before = document.body.innerHTML;

		applySavedSettings( LOADED );

		expect( document.body.innerHTML ).toBe( before );
	} );

	it( 'shows a new site title in the field, the admin bar and the tab title', () => {
		applySavedSettings( { ...LOADED, title: 'Foobar' } );

		const input = field< HTMLInputElement >( '#blogname' );
		expect( input.value ).toBe( 'Foobar' );
		expect( input.defaultValue ).toBe( 'Foobar' );
		expect( adminBarName().textContent ).toBe( 'Foobar' );
		expect( document.title ).toBe( 'General Settings ‹ Foobar — WordPress' );
		expect( document.querySelector( STALE_NOTICE ) ).toBeNull();
	} );

	it( 'decodes a title core stored escaped, as the screen does', () => {
		applySavedSettings( { ...LOADED, title: 'Kavin&#039;s Thai &amp; Grill' } );

		expect( field< HTMLInputElement >( '#blogname' ).value ).toBe( "Kavin's Thai & Grill" );
		expect( adminBarName().textContent ).toBe( "Kavin's Thai & Grill" );
	} );

	it( 'cuts a long title in the admin bar as core does, without splitting an entity', () => {
		// 40 characters of the stored name end inside `&amp;`.
		const name = 'x'.repeat( 37 );

		applySavedSettings( { ...LOADED, title: `${ name }&amp; Bar` } );

		expect( adminBarName().textContent ).toBe( `${ name }…` );
		expect( field< HTMLInputElement >( '#blogname' ).value ).toBe( `${ name }& Bar` );
	} );

	it( 'keeps the site icon in the admin bar', () => {
		adminBarName().innerHTML = '<img class="avatar" src="" />Foo';

		applySavedSettings( { ...LOADED, title: 'Foobar' } );

		expect( adminBarName().innerHTML ).toBe( '<img class="avatar" src="">Foobar' );
	} );

	it( 'keeps an edit the user has made, and says the saved value changed', () => {
		const input = field< HTMLInputElement >( '#blogname' );
		input.value = 'Mine';

		applySavedSettings( { ...LOADED, title: 'Foobar' } );

		expect( input.value ).toBe( 'Mine' );
		expect( document.querySelector( STALE_NOTICE )?.textContent ).toContain( '“Site Title”' );
		expect( document.getElementById( SAVED_NOTICE ) ).toBeNull();
	} );

	it( 'sets checkboxes, selects and radios', () => {
		applySavedSettings( {
			...LOADED,
			users_can_register: true,
			start_of_week: 1,
			date_format: 'Y-m-d',
			language: 'fr_FR',
		} );

		expect( field< HTMLInputElement >( '#users_can_register' ).checked ).toBe( true );
		expect( field< HTMLSelectElement >( '#start_of_week' ).value ).toBe( '1' );
		expect( field< HTMLInputElement >( 'input[value="Y-m-d"]' ).checked ).toBe( true );
		expect( field< HTMLSelectElement >( '#WPLANG' ).value ).toBe( 'fr_FR' );
	} );

	it( 'skips values the field cannot show, such as a custom date format', () => {
		const before = document.body.innerHTML;

		applySavedSettings( { ...LOADED, date_format: 'D, d M', timezone: '' } );

		expect( document.body.innerHTML ).toBe( before );
	} );

	it( 'shows core’s “Settings saved.” notice once, however many fields changed', () => {
		applySavedSettings( { ...LOADED, title: 'Foobar' } );
		applySavedSettings( { ...LOADED, title: 'Foobaz', start_of_week: 1 } );

		const notices = document.querySelectorAll( `#${ SAVED_NOTICE }` );
		expect( notices ).toHaveLength( 1 );
		expect( notices[ 0 ].className ).toBe( 'notice notice-success settings-error is-dismissible' );
		expect( notices[ 0 ].textContent ).toBe( 'Settings saved.' );
	} );

	it( 'updates the admin bar on a screen without a site title field', () => {
		field( '#blogname' ).remove();

		applySavedSettings( { ...LOADED, title: 'Foobar' } );

		expect( adminBarName().textContent ).toBe( 'Foobar' );
		expect( document.getElementById( SAVED_NOTICE ) ).toBeNull();
	} );
} );

describe( 'installWpAdminSettingsSync', () => {
	let uninstall: () => void;

	beforeEach( () => {
		jest.useFakeTimers();
		renderSettingsScreen();
		mockApiFetch.mockReset().mockResolvedValue( { ...LOADED, title: 'Foobar' } );
		uninstall = installWpAdminSettingsSync();
	} );

	afterEach( () => {
		uninstall();
		jest.useRealTimers();
	} );

	async function flush() {
		await jest.runOnlyPendingTimersAsync();
	}

	it( 're-reads the settings once after a burst of tool results', async () => {
		broadcastToolResult( { toolCallId: 'a' } );
		broadcastToolResult( { toolCallId: 'b' } );
		await flush();

		expect( mockApiFetch ).toHaveBeenCalledTimes( 1 );
		expect( mockApiFetch ).toHaveBeenCalledWith( { path: '/wp/v2/settings' } );
		expect( field< HTMLInputElement >( '#blogname' ).value ).toBe( 'Foobar' );
	} );

	it( 're-reads after a client ability that worked, not one that failed', async () => {
		broadcastAbilityCompleted( { name: 'agents-manager/x', ok: false } );
		await flush();
		expect( mockApiFetch ).not.toHaveBeenCalled();

		window.dispatchEvent(
			new CustomEvent( ABILITY_COMPLETED_EVENT, { detail: { name: 'agents-manager/x', ok: true } } )
		);
		await flush();
		expect( mockApiFetch ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'does not read anything on a screen without a settings form', async () => {
		document.querySelector( 'form' )?.remove();

		broadcastToolResult( { toolCallId: 'a' } );
		await flush();

		expect( mockApiFetch ).not.toHaveBeenCalled();
	} );

	it( 'keeps the screen as it is when the read fails', async () => {
		mockApiFetch.mockRejectedValue( new Error( 'rest_forbidden' ) );

		broadcastToolResult( { toolCallId: 'a' } );
		await flush();

		expect( field< HTMLInputElement >( '#blogname' ).value ).toBe( 'Foo' );
	} );
} );

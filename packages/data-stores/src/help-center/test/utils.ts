/**
 * @jest-environment jsdom
 */

import { PREFERENCES_KEY } from '../constants';

jest.mock( '@wordpress/data', () => ( {
	select: jest.fn(),
} ) );

jest.mock( '../../wpcom-request', () => ( {
	__esModule: true,
	default: jest.fn(),
	canAccessWpcomApis: jest.fn(),
} ) );

describe( 'help-center utils — localStorage persistence (logged out)', () => {
	let utils: typeof import('../utils');

	beforeEach( async () => {
		jest.resetModules();
		window.localStorage.clear();
		utils = await import( '../utils' );
	} );

	it( 'persists and reads under the unscoped key when no appId is set', () => {
		utils.persistValueSafely( 'help_center_open', true );

		expect( window.localStorage.getItem( PREFERENCES_KEY + 'help_center_open' ) ).toBe( 'true' );
		expect( utils.retrieveValueSafely( 'help_center_open' ) ).toBe( true );
	} );

	it( 'persists under the app-scoped key when an appId is set', () => {
		utils.setHelpCenterAppId( 'a4a' );
		utils.persistValueSafely( 'help_center_open', true );

		expect( window.localStorage.getItem( PREFERENCES_KEY + 'help_center_open_a4a' ) ).toBe(
			'true'
		);
		// The shared, unscoped field is left untouched.
		expect( window.localStorage.getItem( PREFERENCES_KEY + 'help_center_open' ) ).toBeNull();
	} );

	it( 'falls back to the shared (unscoped) value when the scoped one is absent', () => {
		// Value written by another, unscoped context.
		window.localStorage.setItem( PREFERENCES_KEY + 'help_center_open', 'true' );
		utils.setHelpCenterAppId( 'a4a' );

		expect( utils.retrieveValueSafely( 'help_center_open' ) ).toBe( true );
	} );

	it( 'prefers the scoped value over the shared one once it exists', () => {
		window.localStorage.setItem( PREFERENCES_KEY + 'help_center_open', 'false' );
		window.localStorage.setItem( PREFERENCES_KEY + 'help_center_open_a4a', 'true' );
		utils.setHelpCenterAppId( 'a4a' );

		expect( utils.retrieveValueSafely( 'help_center_open' ) ).toBe( true );
	} );
} );

describe( 'getPersistedPreference — server preferences (logged in)', () => {
	async function setup(
		preferences: Record< string, unknown >
	): Promise< typeof import('../utils') > {
		jest.resetModules();

		const { select } = await import( '@wordpress/data' );
		( select as jest.Mock ).mockReturnValue( { getIsLoggedIn: () => true } );

		const wpcomRequest = await import( '../../wpcom-request' );
		( wpcomRequest.canAccessWpcomApis as jest.Mock ).mockReturnValue( true );
		( wpcomRequest.default as jest.Mock ).mockResolvedValue( {
			calypso_preferences: preferences,
		} );

		return import( '../utils' );
	}

	it( 'returns the scoped value when present', async () => {
		const utils = await setup( { help_center_open: false, help_center_open_a4a: true } );
		utils.setHelpCenterAppId( 'a4a' );

		await expect( utils.getPersistedPreference( 'help_center_open' ) ).resolves.toBe( true );
	} );

	it( 'falls back to the unscoped value when the scoped one is absent', async () => {
		const utils = await setup( { help_center_open: true } );
		utils.setHelpCenterAppId( 'a4a' );

		await expect( utils.getPersistedPreference( 'help_center_open' ) ).resolves.toBe( true );
	} );

	it( 'reads the unscoped value when no appId is set', async () => {
		const utils = await setup( { help_center_open: true, help_center_open_a4a: false } );
		utils.setHelpCenterAppId( undefined );

		await expect( utils.getPersistedPreference( 'help_center_open' ) ).resolves.toBe( true );
	} );
} );

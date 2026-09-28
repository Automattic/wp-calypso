import { isEnabled } from '@automattic/calypso-config';
import canManageStatsSettings from '../can-manage-stats-settings';

jest.mock( '@automattic/calypso-config', () => {
	const config = () => 'development';
	config.isEnabled = jest.fn();
	return config;
} );

const siteId = 123;

const makeState = ( { hasStatsSettings = true, canManageOptions = true } = {} ) => ( {
	currentUser: {
		capabilities: { [ siteId ]: { manage_options: canManageOptions } },
	},
	sites: {
		items: {
			[ siteId ]: {
				ID: siteId,
				jetpack: true,
				options: hasStatsSettings ? { has_stats_settings: true } : {},
			},
		},
	},
} );

describe( 'canManageStatsSettings', () => {
	beforeEach( () => {
		( isEnabled as jest.Mock ).mockImplementation(
			( flag: string ) => flag === 'is_running_in_jetpack_site'
		);
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'allows an administrator on a site whose Stats serves the settings', () => {
		expect( canManageStatsSettings( makeState(), siteId ) ).toBe( true );
	} );

	it( 'hides the settings from a site whose stats-admin does not send has_stats_settings', () => {
		expect( canManageStatsSettings( makeState( { hasStatsSettings: false } ), siteId ) ).toBe(
			false
		);
	} );

	it( 'hides the settings from a user who cannot manage options', () => {
		expect( canManageStatsSettings( makeState( { canManageOptions: false } ), siteId ) ).toBe(
			false
		);
	} );

	it( 'hides the settings outside the wp-admin dashboard', () => {
		( isEnabled as jest.Mock ).mockReturnValue( false );

		expect( canManageStatsSettings( makeState(), siteId ) ).toBe( false );
	} );
} );

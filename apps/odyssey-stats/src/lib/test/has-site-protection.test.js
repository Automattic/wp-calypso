import { vi } from 'vitest';
import config, { optionalConfig } from '../config-api';
import hasSiteProtection from '../has-site-protection';

vi.mock( '../config-api', () => {
	const configApi = vi.fn();
	configApi.isEnabled = vi.fn();
	return { __esModule: true, default: configApi, optionalConfig: vi.fn() };
} );

describe( 'hasSiteProtection', () => {
	afterEach( () => {
		config.isEnabled.mockReset();
		optionalConfig.mockReset();
	} );

	it.each( [
		[ 'a Jetpack site', true, '15.1', true ],
		[ 'a Simple site', false, '', false ],
		[ 'a standalone Stats plugin without Jetpack', true, '', false ],
		[ 'a stats-admin release older than the key', true, undefined, true ],
	] )( 'decides for %s', ( _, isJetpackSite, jetpackVersion, expected ) => {
		config.isEnabled.mockImplementation( ( feature ) =>
			feature === 'is_running_in_jetpack_site' ? isJetpackSite : false
		);
		optionalConfig.mockImplementation( ( key ) =>
			key === 'jetpack_version' ? jetpackVersion : undefined
		);

		expect( hasSiteProtection() ).toBe( expected );
	} );
} );

/**
 * Internal dependencies
 */
import getJetpackSettings from 'calypso/state/selectors/get-jetpack-settings';
import { settings as SETTINGS_FIXTURE } from './fixtures/jetpack-settings';

describe( 'getJetpackSettings()', () => {
	test( 'should return settings for all modules for a known site', () => {
		const stateIn = {
			jetpack: {
				settings: SETTINGS_FIXTURE,
			},
		};
		const siteId = 12345678;
		const output = getJetpackSettings( stateIn, siteId );
		expect( output ).toEqual( SETTINGS_FIXTURE[ siteId ] );
	} );

	test( 'should return null for an unknown site', () => {
		const stateIn = {
			jetpack: {
				settings: {
					654321: SETTINGS_FIXTURE,
				},
			},
		};
		const siteId = 12345678;
		const output = getJetpackSettings( stateIn, siteId );
		expect( output ).toBeNull();
	} );
} );

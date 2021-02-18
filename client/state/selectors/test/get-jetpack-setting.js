/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getJetpackSetting from 'calypso/state/selectors/get-jetpack-setting';
import { settings as SETTINGS_FIXTURE } from './fixtures/jetpack-settings';

describe( 'getJetpackSetting()', () => {
	test( 'should return a certain setting for a known site', () => {
		const stateIn = {
			jetpack: {
				settings: SETTINGS_FIXTURE,
			},
		};
		const siteId = 12345678;
		const setting = 'setting_1';
		const output = getJetpackSetting( stateIn, siteId, setting );
		expect( output ).to.eql( SETTINGS_FIXTURE[ siteId ][ setting ] );
	} );

	test( 'should return null for an unknown site', () => {
		const stateIn = {
			jetpack: {
				settings: {
					654321: SETTINGS_FIXTURE[ 12345678 ],
				},
			},
		};
		const siteId = 12345678;
		const setting = 'setting_1';
		const output = getJetpackSetting( stateIn, siteId, setting );
		expect( output ).to.be.null;
	} );

	test( 'should return null for an unknown setting', () => {
		const stateIn = {
			jetpack: {
				settings: {
					654321: SETTINGS_FIXTURE[ 12345678 ],
				},
			},
		};
		const siteId = 12345678;
		const setting = 'unexisting_setting';
		const output = getJetpackSetting( stateIn, siteId, setting );
		expect( output ).to.be.null;
	} );
} );

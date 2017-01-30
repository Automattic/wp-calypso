/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getJetpackSettings } from '../';
import { settings as SETTINGS_FIXTURE } from './fixtures/jetpack-settings';

describe( 'getJetpackSettings()', () => {
	it( 'should return settings for all modules for a known site', () => {
		const stateIn = {
				jetpack: {
					settings: {
						items: SETTINGS_FIXTURE
					}
				}
			},
			siteId = 12345678;
		const output = getJetpackSettings( stateIn, siteId );
		expect( output ).to.eql( SETTINGS_FIXTURE[ siteId ] );
	} );

	it( 'should return null for an unknown site', () => {
		const stateIn = {
				jetpack: {
					settings: {
						items: {
							654321: SETTINGS_FIXTURE
						}
					}
				}
			},
			siteId = 12345678;
		const output = getJetpackSettings( stateIn, siteId );
		expect( output ).to.be.null;
	} );
} );

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getJetpackModules from 'calypso/state/selectors/get-jetpack-modules';
import { moduleData as MODULE_DATA_FIXTURE } from './fixtures/jetpack-modules';

describe( 'getJetpackModules()', () => {
	test( 'should return data for all modules for a known site', () => {
		const stateIn = {
			jetpack: {
				modules: {
					items: {
						123456: MODULE_DATA_FIXTURE,
					},
				},
			},
		};
		const siteId = 123456;
		const output = getJetpackModules( stateIn, siteId );
		expect( output ).to.eql( MODULE_DATA_FIXTURE );
	} );

	test( 'should return null for an unknown site', () => {
		const stateIn = {
			jetpack: {
				modules: {
					items: {
						654321: MODULE_DATA_FIXTURE,
					},
				},
			},
		};
		const siteId = 123456;
		const output = getJetpackModules( stateIn, siteId );
		expect( output ).to.be.null;
	} );
} );

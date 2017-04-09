/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getJetpackModules } from '../';
import { moduleData as MODULE_DATA_FIXTURE } from './fixtures/jetpack-modules';

describe( 'getJetpackModules()', () => {
	it( 'should return data for all modules for a known site', () => {
		const stateIn = {
				jetpack: {
					modules: {
						items: {
							123456: MODULE_DATA_FIXTURE
						}
					}
				}
			},
			siteId = 123456;
		const output = getJetpackModules( stateIn, siteId );
		expect( output ).to.eql( MODULE_DATA_FIXTURE );
	} );

	it( 'should return null for an unknown site', () => {
		const stateIn = {
				jetpack: {
					modules: {
						items: {
							654321: MODULE_DATA_FIXTURE
						}
					}
				}
			},
			siteId = 123456;
		const output = getJetpackModules( stateIn, siteId );
		expect( output ).to.be.null;
	} );
} );

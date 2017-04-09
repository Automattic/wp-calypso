/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getJetpackModule } from '../';
import { moduleData as MODULE_DATA_FIXTURE } from './fixtures/jetpack-modules';

describe( 'getJetpackModule()', () => {
	it( 'should return data for a specified module for a known site', () => {
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
		const output = getJetpackModule( stateIn, siteId, 'module-a' );
		expect( output ).to.eql( MODULE_DATA_FIXTURE[ 'module-a' ] );
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
		const output = getJetpackModule( stateIn, siteId, 'module-a' );
		expect( output ).to.be.null;
	} );

	it( 'should return null for an unknown module', () => {
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
		const output = getJetpackModule( stateIn, siteId, 'module-z' );
		expect( output ).to.be.null;
	} );
} );

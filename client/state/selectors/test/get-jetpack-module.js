/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getJetpackModule from 'calypso/state/selectors/get-jetpack-module';
import { moduleData as MODULE_DATA_FIXTURE } from './fixtures/jetpack-modules';

describe( 'getJetpackModule()', () => {
	test( 'should return data for a specified module for a known site', () => {
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
		const output = getJetpackModule( stateIn, siteId, 'module-a' );
		expect( output ).to.eql( MODULE_DATA_FIXTURE[ 'module-a' ] );
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
		const output = getJetpackModule( stateIn, siteId, 'module-a' );
		expect( output ).to.be.null;
	} );

	test( 'should return null for an unknown module', () => {
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
		const output = getJetpackModule( stateIn, siteId, 'module-z' );
		expect( output ).to.be.null;
	} );
} );

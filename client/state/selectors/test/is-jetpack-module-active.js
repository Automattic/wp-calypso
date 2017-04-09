/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isJetpackModuleActive } from '../';
import { modules as MODULES_FIXTURE } from './fixtures/jetpack-modules';

describe( 'isJetpackModuleActive()', () => {
	it( 'should return true if the module is currently active', () => {
		const stateIn = {
				jetpack: {
					modules: {
						items: MODULES_FIXTURE
					}
				}
			},
			siteId = 123456;
		const output = isJetpackModuleActive( stateIn, siteId, 'module-b' );
		expect( output ).to.be.true;
	} );

	it( 'should return false if the module is currently not active', () => {
		const stateIn = {
				jetpack: {
					modules: {
						items: MODULES_FIXTURE
					}
				}
			},
			siteId = 123456;
		const output = isJetpackModuleActive( stateIn, siteId, 'module-a' );
		expect( output ).to.be.false;
	} );

	it( 'should return null if that module is not known', () => {
		const stateIn = {
				jetpack: {
					modules: {
						items: MODULES_FIXTURE
					}
				}
			},
			siteId = 123456;
		const output = isJetpackModuleActive( stateIn, siteId, 'module-z' );
		expect( output ).to.be.null;
	} );
} );

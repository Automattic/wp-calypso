/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isDeactivatingJetpackModule } from '../';
import { requests as REQUESTS_FIXTURE } from './fixtures/jetpack-modules';

describe( 'isDeactivatingJetpackModule()', () => {
	it( 'should return true if module is currently being deactivated', () => {
		const stateIn = {
				jetpack: {
					modules: {
						requests: REQUESTS_FIXTURE
					}
				}
			},
			siteId = 123456;
		const output = isDeactivatingJetpackModule( stateIn, siteId, 'module-a' );
		expect( output ).to.be.true;
	} );

	it( 'should return false if module is currently not being deactivated', () => {
		const stateIn = {
				jetpack: {
					modules: {
						requests: REQUESTS_FIXTURE
					}
				}
			},
			siteId = 123456;
		const output = isDeactivatingJetpackModule( stateIn, siteId, 'module-b' );
		expect( output ).to.be.false;
	} );

	it( 'should return null if that module is not known', () => {
		const stateIn = {
				jetpack: {
					modules: {
						requests: REQUESTS_FIXTURE
					}
				}
			},
			siteId = 123456;
		const output = isDeactivatingJetpackModule( stateIn, siteId, 'module-z' );
		expect( output ).to.be.null;
	} );
} );

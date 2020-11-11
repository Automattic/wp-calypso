/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import isActivatingJetpackModule from 'calypso/state/selectors/is-activating-jetpack-module';
import { requests as REQUESTS_FIXTURE } from './fixtures/jetpack-modules';

describe( 'isActivatingJetpackModule()', () => {
	test( 'should return true if module is currently being activated', () => {
		const stateIn = {
			jetpack: {
				modules: {
					requests: REQUESTS_FIXTURE,
				},
			},
		};
		const siteId = 123456;
		const output = isActivatingJetpackModule( stateIn, siteId, 'module-b' );
		expect( output ).to.be.true;
	} );

	test( 'should return false if module is currently not being activated', () => {
		const stateIn = {
			jetpack: {
				modules: {
					requests: REQUESTS_FIXTURE,
				},
			},
		};
		const siteId = 123456;
		const output = isActivatingJetpackModule( stateIn, siteId, 'module-a' );
		expect( output ).to.be.false;
	} );

	test( 'should return null if that module is not known', () => {
		const stateIn = {
			jetpack: {
				modules: {
					requests: REQUESTS_FIXTURE,
				},
			},
		};
		const siteId = 123456;
		const output = isActivatingJetpackModule( stateIn, siteId, 'module-z' );
		expect( output ).to.be.null;
	} );
} );

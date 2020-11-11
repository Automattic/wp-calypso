/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import isFetchingJetpackModules from 'calypso/state/selectors/is-fetching-jetpack-modules';
import { requests as REQUESTS_FIXTURE } from './fixtures/jetpack-modules';

describe( 'isFetchingJetpackModules()', () => {
	test( 'should return true if the list of modules is being fetched', () => {
		const stateIn = {
			jetpack: {
				modules: {
					requests: REQUESTS_FIXTURE,
				},
			},
		};
		const siteId = 123456;
		const output = isFetchingJetpackModules( stateIn, siteId );
		expect( output ).to.be.true;
	} );

	test( 'should return false if the list of modules is currently not being fetched', () => {
		const stateIn = {
			jetpack: {
				modules: {
					requests: REQUESTS_FIXTURE,
				},
			},
		};
		const siteId = 654321;
		const output = isFetchingJetpackModules( stateIn, siteId );
		expect( output ).to.be.false;
	} );

	test( 'should return null if that site is not known', () => {
		const stateIn = {
			jetpack: {
				modules: {
					requests: REQUESTS_FIXTURE,
				},
			},
		};
		const siteId = 888888;
		const output = isFetchingJetpackModules( stateIn, siteId );
		expect( output ).to.be.null;
	} );
} );

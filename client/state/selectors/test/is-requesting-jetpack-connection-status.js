/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import isRequestingJetpackConnectionStatus from 'calypso/state/selectors/is-requesting-jetpack-connection-status';
import { requests as REQUESTS_FIXTURE } from './fixtures/jetpack-connection';

describe( 'isRequestingJetpackConnectionStatus()', () => {
	test( 'should return true if the connection status is being fetched', () => {
		const stateIn = {
			jetpack: {
				connection: {
					requests: REQUESTS_FIXTURE,
				},
			},
		};
		const siteId = 87654321;
		const output = isRequestingJetpackConnectionStatus( stateIn, siteId );
		expect( output ).to.be.true;
	} );

	test( 'should return false if the connection status is not being fetched', () => {
		const stateIn = {
			jetpack: {
				connection: {
					requests: REQUESTS_FIXTURE,
				},
			},
		};
		const siteId = 12345678;
		const output = isRequestingJetpackConnectionStatus( stateIn, siteId );
		expect( output ).to.be.false;
	} );

	test( 'should return null if the site is not known yet', () => {
		const stateIn = {
			jetpack: {
				connection: {
					requests: REQUESTS_FIXTURE,
				},
			},
		};
		const siteId = 88888888;
		const output = isRequestingJetpackConnectionStatus( stateIn, siteId );
		expect( output ).to.be.null;
	} );
} );

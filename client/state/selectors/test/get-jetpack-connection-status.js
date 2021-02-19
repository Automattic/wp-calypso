/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getJetpackConnectionStatus from 'calypso/state/selectors/get-jetpack-connection-status';
import { items as ITEMS_FIXTURE } from './fixtures/jetpack-connection';

describe( 'getJetpackConnectionStatus()', () => {
	test( 'should return connection status for a known site', () => {
		const stateIn = {
			jetpack: {
				connection: {
					items: ITEMS_FIXTURE,
				},
			},
		};
		const siteId = 12345678;
		const output = getJetpackConnectionStatus( stateIn, siteId );
		expect( output ).to.eql( ITEMS_FIXTURE[ siteId ] );
	} );

	test( 'should return null for an unknown site', () => {
		const stateIn = {
			jetpack: {
				connection: {
					items: ITEMS_FIXTURE,
				},
			},
		};
		const siteId = 88888888;
		const output = getJetpackConnectionStatus( stateIn, siteId );
		expect( output ).to.be.null;
	} );
} );

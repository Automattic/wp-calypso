/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getJetpackUserConnection from 'calypso/state/selectors/get-jetpack-user-connection';
import { dataItems } from './fixtures/jetpack-connection';

describe( 'getJetpackUserConnection()', () => {
	test( 'should return user connection data for a known site', () => {
		const stateIn = {
			jetpack: {
				connection: {
					dataItems,
				},
			},
		};
		const siteId = 12345678;
		const output = getJetpackUserConnection( stateIn, siteId );
		expect( output ).to.eql( dataItems[ siteId ] );
	} );

	test( 'should return null for an unknown site', () => {
		const stateIn = {
			jetpack: {
				connection: {
					dataItems,
				},
			},
		};
		const siteId = 88888888;
		const output = getJetpackUserConnection( stateIn, siteId );
		expect( output ).to.be.null;
	} );
} );

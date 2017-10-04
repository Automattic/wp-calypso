/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getJetpackUserConnection } from '../';
import { dataItems } from './fixtures/jetpack-connection';

describe( 'getJetpackUserConnection()', () => {
	it( 'should return user connection data for a known site', () => {
		const stateIn = {
				jetpack: {
					connection: {
						dataItems,
					},
				},
			},
			siteId = 12345678;
		const output = getJetpackUserConnection( stateIn, siteId );
		expect( output ).to.eql( dataItems[ siteId ] );
	} );

	it( 'should return null for an unknown site', () => {
		const stateIn = {
				jetpack: {
					connection: {
						dataItems,
					},
				},
			},
			siteId = 88888888;
		const output = getJetpackUserConnection( stateIn, siteId );
		expect( output ).to.be.null;
	} );
} );

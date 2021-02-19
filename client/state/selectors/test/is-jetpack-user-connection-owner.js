/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import isJetpackUserConnectionOwner from 'calypso/state/selectors/is-jetpack-user-connection-owner';
import { dataItems } from './fixtures/jetpack-connection';

describe( 'isJetpackUserConnectionOwner()', () => {
	test( "should return true if the user is the owner of the site's connection", () => {
		const stateIn = {
			jetpack: {
				connection: {
					dataItems,
				},
			},
		};
		const siteId = 12345678;
		const output = isJetpackUserConnectionOwner( stateIn, siteId );
		expect( output ).to.be.true;
	} );

	test( "should return false if the user is not the owner of the site's connection", () => {
		const stateIn = {
			jetpack: {
				connection: {
					dataItems,
				},
			},
		};
		const siteId = 87654321;
		const output = isJetpackUserConnectionOwner( stateIn, siteId );
		expect( output ).to.be.false;
	} );

	test( 'should return null if the information is not known yet', () => {
		const stateIn = {
			jetpack: {
				connection: {
					dataItems,
				},
			},
		};
		const siteId = 88888888;
		const output = isJetpackUserConnectionOwner( stateIn, siteId );
		expect( output ).to.be.null;
	} );
} );

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import isJetpackUserMaster from 'state/selectors/is-jetpack-user-master';
import { dataItems } from './fixtures/jetpack-connection';

describe( 'isJetpackUserMaster()', () => {
	test( "should return true if the user is the master user of the site's connection", () => {
		const stateIn = {
				jetpack: {
					connection: {
						dataItems,
					},
				},
			},
			siteId = 12345678;
		const output = isJetpackUserMaster( stateIn, siteId );
		expect( output ).to.be.true;
	} );

	test( "should return false if the user is not the master user of the site's connection", () => {
		const stateIn = {
				jetpack: {
					connection: {
						dataItems,
					},
				},
			},
			siteId = 87654321;
		const output = isJetpackUserMaster( stateIn, siteId );
		expect( output ).to.be.false;
	} );

	test( 'should return null if the information is not known yet', () => {
		const stateIn = {
				jetpack: {
					connection: {
						dataItems,
					},
				},
			},
			siteId = 88888888;
		const output = isJetpackUserMaster( stateIn, siteId );
		expect( output ).to.be.null;
	} );
} );

/**
 * Internal dependencies
 */
import getJetpackConnectionOwner from 'calypso/state/selectors/get-jetpack-connection-owner';
import { dataItems } from './fixtures/jetpack-connection';

describe( 'isJetpackUserConnectionOwner()', () => {
	test( "should return the owner of the Jetpack site's connection", () => {
		const state = {
			jetpack: {
				connection: {
					dataItems,
				},
			},
		};
		const siteId = 87654321;
		const output = getJetpackConnectionOwner( state, siteId );
		expect( output ).toEqual( 'exampleuser' );
	} );
} );

/**
 * Internal dependencies
 */
import getJetpackConnectionOwner from 'state/selectors/get-jetpack-connection-owner';
import { dataItems } from './fixtures/jetpack-connection';

describe( 'isJetpackUserConnectionOwner()', () => {
	test( "should return the owner of the Jetpack site's connection", () => {
		const state = {
				jetpack: {
					connection: {
						dataItems,
					},
				},
			},
			siteId = 87654321;
		const output = getJetpackConnectionOwner( state, siteId );
		expect( output ).toEqual( 'exampleuser' );
	} );
} );

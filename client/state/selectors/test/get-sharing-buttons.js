/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getSharingButtons } from '../';

describe( 'getSharingButtons()', () => {
	it( 'should return null if the site is not tracked', () => {
		const state = {
			sites: {
				sharingButtons: {
					items: {
						2916284: [ { ID: 'facebook' } ]
					}
				}
			}
		};
		const buttons = getSharingButtons( state, 2916285 );

		expect( buttons ).to.be.null;
	} );

	it( 'should return the buttons for a siteId', () => {
		const state = {
			sites: {
				sharingButtons: {
					items: {
						2916284: [ { ID: 'facebook' } ]
					}
				}
			}
		};
		const buttons = getSharingButtons( state, 2916284 );

		expect( buttons ).to.eql( [ { ID: 'facebook' } ] );
	} );
} );

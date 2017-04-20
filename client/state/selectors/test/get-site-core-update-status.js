/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getSiteCoreUpdateStatus } from '../';

describe( 'getSiteCoreUpdateStatus()', () => {
	const siteId = 2916284;

	it( 'should return wordpress core update status for a known site', () => {
		const state = {
			sites: {
				updates: {
					wordpressUpdateStatus: {
						[ siteId ]: true,
					}
				}
			}
		};
		const output = getSiteCoreUpdateStatus( state, siteId );
		expect( output ).to.be.true;
	} );

	it( 'should return null for an unknown site', () => {
		const state = {
			sites: {
				updates: {
					wordpressUpdateStatus: {
						77203074: true,
					}
				}
			}
		};
		const output = getSiteCoreUpdateStatus( state, siteId );
		expect( output ).to.be.null;
	} );
} );

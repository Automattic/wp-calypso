/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getJetpackJumpstartStatus } from '../';
import { items as ITEMS_FIXTURE } from './fixtures/jetpack-jumpstart';

describe( 'getJetpackJumpstartStatus()', () => {
	it( 'should return jumpstart status for a known site', () => {
		const stateIn = {
				jetpack: {
					jumpstart: {
						items: ITEMS_FIXTURE
					}
				}
			},
			siteId = 12345678;
		const output = getJetpackJumpstartStatus( stateIn, siteId );
		expect( output ).to.eql( 'jumpstart_activated' );
	} );

	it( 'should return null for an unknown site', () => {
		const stateIn = {
				jetpack: {
					jumpstart: {
						items: ITEMS_FIXTURE
					}
				}
			},
			siteId = 88888888;
		const output = getJetpackJumpstartStatus( stateIn, siteId );
		expect( output ).to.be.null;
	} );
} );

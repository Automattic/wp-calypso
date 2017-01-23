/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getJumpstartStatus
} from '../selectors';
import { items as ITEMS_FIXTURE } from './fixture';

describe( 'selectors', () => {
	describe( '#getJumpstartStatus', () => {
		it( 'should return jumpstart status for a known site', () => {
			const stateIn = {
					jetpack: {
						jetpackJumpstart: {
							items: ITEMS_FIXTURE
						}
					}
				},
				siteId = 12345678;
			const output = getJumpstartStatus( stateIn, siteId );
			expect( output ).to.eql( 'jumpstart_activated' );
		} );

		it( 'should return null for an unknown site', () => {
			const stateIn = {
					jetpack: {
						jetpackJumpstart: {
							items: ITEMS_FIXTURE
						}
					}
				},
				siteId = 88888888;
			const output = getJumpstartStatus( stateIn, siteId );
			expect( output ).to.be.null;
		} );
	} );
} );

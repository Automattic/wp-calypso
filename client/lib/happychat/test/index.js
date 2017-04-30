/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	HAPPYCHAT_GROUP_WPCOM,
	HAPPYCHAT_GROUP_JPOP
} from 'state/happychat/constants';
import { getGroups } from 'lib/happychat';

describe( 'groups', () => {
	describe( '#getGroups()', () => {
		it( 'should return default group for no sites', () => {
			const siteId = 1;
			const state = {
				sites: {
					items: {}
				}
			};

			expect( getGroups( state, siteId ) ).to.eql( [ HAPPYCHAT_GROUP_WPCOM ] );
		} );

		it( 'should return default group for no siteId', () => {
			const siteId = undefined;
			const state = {
				sites: {
					items: {
						1: {}
					}
				}
			};

			expect( getGroups( state, siteId ) ).to.eql( [ HAPPYCHAT_GROUP_WPCOM ] );
		} );

		it( 'should return JPOP group for jetpack site', () => {
			const siteId = 1;
			const state = {
				sites: {
					items: {
						[ siteId ]: { jetpack: true }
					}
				}
			};

			expect( getGroups( state, siteId ) ).to.eql( [ HAPPYCHAT_GROUP_JPOP ] );
		} );
	} );
} );

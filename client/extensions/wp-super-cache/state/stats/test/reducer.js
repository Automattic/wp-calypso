/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { useSandbox } from 'test/helpers/use-sinon';
import {
	WP_SUPER_CACHE_GENERATE_STATS,
	WP_SUPER_CACHE_GENERATE_STATS_FAILURE,
	WP_SUPER_CACHE_GENERATE_STATS_SUCCESS,
	WP_SUPER_CACHE_RECEIVE_STATS,
} from '../../action-types';
import {
	DESERIALIZE,
	SERIALIZE,
} from 'state/action-types';
import reducer from '../reducer';

describe( 'reducer', () => {
	const primarySiteId = 123456;
	const secondarySiteId = 456789;

	useSandbox( ( sandbox ) => {
		sandbox.stub( console, 'warn' );
	} );

	describe( 'generateStatus()', () => {
		const previousState = deepFreeze( {
			generateStatus: {
				[ primarySiteId ]: {
					generating: true,
					status: 'pending',
				}
			}
		} );

		it( 'should default to an empty object', () => {
			const state = reducer( undefined, {} );

			expect( state.generateStatus ).to.eql( {} );
		} );

		it( 'should set generate status to pending if request in progress', () => {
			const state = reducer( undefined, {
				type: WP_SUPER_CACHE_GENERATE_STATS,
				siteId: primarySiteId,
			} );

			expect( state.generateStatus ).to.eql( {
				[ primarySiteId ]: {
					generating: true,
					status: 'pending',
				}
			} );
		} );

		it( 'should accumulate generate request statuses', () => {
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_GENERATE_STATS,
				siteId: secondarySiteId,
			} );

			expect( state.generateStatus ).to.eql( {
				[ primarySiteId ]: {
					generating: true,
					status: 'pending',
				},
				[ secondarySiteId ]: {
					generating: true,
					status: 'pending',
				}
			} );
		} );

		it( 'should set generate request to success if request finishes successfully', () => {
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_GENERATE_STATS_SUCCESS,
				siteId: primarySiteId,
			} );

			expect( state.generateStatus ).to.eql( {
				[ primarySiteId ]: {
					generating: false,
					status: 'success',
				}
			} );
		} );

		it( 'should set generate request to error if request finishes with failure', () => {
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_GENERATE_STATS_FAILURE,
				siteId: primarySiteId,
			} );

			expect( state.generateStatus ).to.eql( {
				[ primarySiteId ]: {
					generating: false,
					status: 'error',
				}
			} );
		} );

		it( 'should not persist state', () => {
			const state = reducer( previousState, {
				type: SERIALIZE,
			} );

			expect( state.generateStatus ).to.eql( {} );
		} );

		it( 'should not load persisted state', () => {
			const state = reducer( previousState, {
				type: DESERIALIZE,
			} );

			expect( state.generateStatus ).to.eql( {} );
		} );
	} );

	describe( 'items()', () => {
		const primaryStats = { generated: 1493997829 };
		const secondaryStats = { generated: 0 };
		const previousState = deepFreeze( {
			items: {
				[ primarySiteId ]: primaryStats,
			}
		} );

		it( 'should default to an empty object', () => {
			const state = reducer( undefined, {} );

			expect( state.items ).to.eql( {} );
		} );

		it( 'should index stats by site ID', () => {
			const state = reducer( undefined, {
				type: WP_SUPER_CACHE_RECEIVE_STATS,
				siteId: primarySiteId,
				stats: primaryStats,
			} );

			expect( state.items ).to.eql( {
				[ primarySiteId ]: primaryStats,
			} );
		} );

		it( 'should accumulate stats', () => {
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_RECEIVE_STATS,
				siteId: secondarySiteId,
				stats: secondaryStats,
			} );

			expect( state.items ).to.eql( {
				[ primarySiteId ]: primaryStats,
				[ secondarySiteId ]: secondaryStats,
			} );
		} );

		it( 'should override previous stats of same site ID', () => {
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_RECEIVE_STATS,
				siteId: primarySiteId,
				stats: secondaryStats,
			} );

			expect( state.items ).to.eql( {
				[ primarySiteId ]: secondaryStats,
			} );
		} );

		it( 'should accumulate new stats and overwrite existing ones for the same site ID', () => {
			const newStats = {
				generated: 1493997829,
				supercache: {},
			};
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_RECEIVE_STATS,
				siteId: primarySiteId,
				stats: newStats,
			} );

			expect( state.items ).to.eql( {
				[ primarySiteId ]: newStats,
			} );
		} );

		it( 'should persist state', () => {
			const state = reducer( previousState, {
				type: SERIALIZE,
			} );

			expect( state.items ).to.eql( {
				[ primarySiteId ]: primaryStats,
			} );
		} );

		it( 'should load valid persisted state', () => {
			const state = reducer( previousState, {
				type: DESERIALIZE,
			} );

			expect( state.items ).to.eql( {
				[ primarySiteId ]: primaryStats,
			} );
		} );

		it( 'should not load invalid persisted state', () => {
			const previousInvalidState = deepFreeze( {
				items: {
					[ primarySiteId ]: 2,
				}
			} );
			const state = reducer( previousInvalidState, {
				type: DESERIALIZE,
			} );

			expect( state.items ).to.eql( {} );
		} );
	} );
} );

/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import componentsUsageStats from '../reducer';
import { COMPONENTS_USAGE_STATS_REQUEST, COMPONENTS_USAGE_STATS_RECEIVE } from 'state/action-types';

describe( 'reducer', () => {
	describe( '#componentsUsageStats()', () => {
		test( 'should default to an empty array', () => {
			const state = componentsUsageStats( undefined, [] );
			expect( state ).to.eql( {
				isFetching: false,
				componentsUsageStats: {},
			} );
		} );

		test( 'should set `isFetching` to `true` during fetching', () => {
			const state = componentsUsageStats( undefined, {
				type: COMPONENTS_USAGE_STATS_REQUEST,
			} );
			expect( state ).to.eql( {
				isFetching: true,
				componentsUsageStats: {},
			} );
		} );

		test( 'should update the state with the `componentsUsageStats` when fetching completes', () => {
			const state = componentsUsageStats( undefined, {
				type: COMPONENTS_USAGE_STATS_RECEIVE,
				componentsUsageStats: {
					foo: { count: 1 },
				},
			} );
			expect( state ).to.eql( {
				isFetching: false,
				componentsUsageStats: {
					foo: { count: 1 },
				},
			} );
		} );
	} );
} );

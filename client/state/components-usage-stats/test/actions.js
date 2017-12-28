/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { receiveComponentsUsageStats, requestComponentsUsageStats } from '../actions';
import {
	COMPONENTS_USAGE_STATS_REQUEST,
	COMPONENTS_USAGE_STATS_RECEIVE,
} from 'client/state/action-types';

describe( 'actions', () => {
	describe( 'receiveComponentsUsageStats()', () => {
		test( 'should return an action object', () => {
			const action = receiveComponentsUsageStats( {
				foo: { count: 1 },
			} );

			expect( action ).to.eql( {
				type: COMPONENTS_USAGE_STATS_RECEIVE,
				componentsUsageStats: {
					foo: { count: 1 },
				},
			} );
		} );
	} );

	describe( 'requestComponentsUsageStats()', () => {
		test( 'should return an action object', () => {
			const action = requestComponentsUsageStats();

			expect( action ).to.eql( {
				type: COMPONENTS_USAGE_STATS_REQUEST,
			} );
		} );
	} );
} );

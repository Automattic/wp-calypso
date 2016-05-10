/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	COMPONENTS_USAGE_STATS_REQUEST,
	COMPONENTS_USAGE_STATS_RECEIVE
} from 'state/action-types';
import {
	receiveComponentsUsageStats,
	requestComponentsUsageStats
} from '../actions';

describe( 'actions', function() {
	describe( 'receiveComponentsUsageStats()', function() {
		it( 'should return an action object', function() {
			const action = receiveComponentsUsageStats( {
				foo: { count: 1 }
			} );

			expect( action ).to.eql( {
				type: COMPONENTS_USAGE_STATS_RECEIVE,
				componentsUsageStats: {
					foo: { count: 1 }
				}
			} );
		} );
	} );

	describe( 'requestComponentsUsageStats()', function() {
		it( 'should return an action object', function() {
			const action = requestComponentsUsageStats();

			expect( action ).to.eql( {
				type: COMPONENTS_USAGE_STATS_REQUEST
			} );
		} );
	} );
} );

/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import googleMyBusinessReducer from '../reducer';
import { getGoolgeMyBusinessSiteStats } from '../selectors';
import { GOOGLE_MY_BUSINESS_STATS_SET_DATA } from 'state/action-types';

describe( 'reducer', () => {
	describe( '#stats', () => {
		test( 'should save data', () => {
			const state = googleMyBusinessReducer( undefined, {
				type: GOOGLE_MY_BUSINESS_STATS_SET_DATA,
				siteId: 123,
				timeSpan: 'month',
				statName: 'actions',
				data: {
					hello: 'world',
				},
			} );

			expect( state ).to.eql( {
				123: {
					location: {
						id: null,
					},
					statInterval: {},
					stats: {
						actions_month: {
							hello: 'world',
						},
					},
				},
			} );
		} );
	} );
} );

describe( 'selectors', () => {
	describe( '#getGoolgeMyBusinessSiteStats', () => {
		test( 'should get null if data not availible', () => {
			expect( getGoolgeMyBusinessSiteStats( {}, 123, 'actions', 'month' ) ).to.be.null;
		} );

		test( 'should get stats data', () => {
			const state = {
				googleMyBusiness: {
					123: {
						location: {
							id: null,
						},
						stats: {
							actions_month: {
								hello: 'world',
							},
						},
					},
				},
			};

			expect( getGoolgeMyBusinessSiteStats( state, 123, 'actions', 'month' ) ).to.eql( {
				hello: 'world',
			} );
		} );
	} );
} );

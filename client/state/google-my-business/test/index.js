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
import {
	GOOGLE_MY_BUSINESS_STATS_SET_DATA,
	GOOGLE_MY_BUSINESS_STATS_REQUEST,
} from 'state/action-types';

describe( 'reducer', () => {
	describe( '#stats', () => {
		test( 'should save data', () => {
			const state = googleMyBusinessReducer( undefined, {
				type: GOOGLE_MY_BUSINESS_STATS_SET_DATA,
				siteId: 123,
				interval: 'month',
				statType: 'actions',
				aggregation: 'total',
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
						actions: {
							month: {
								total: {
									interval: 'month',
									statType: 'actions',
									aggregation: 'total',
									data: { hello: 'world' },
								},
							},
						},
					},
				},
			} );
		} );

		test( 'should reset data on request to server', () => {
			const state = {
				123: {
					location: {
						id: null,
					},
					statInterval: {},
					stats: {
						actions: {
							month: {
								total: {
									interval: 'month',
									statType: 'actions',
									aggregation: 'total',
									data: { hello: 'world' },
								},
							},
						},
					},
				},
			};

			const newState = googleMyBusinessReducer( state, {
				type: GOOGLE_MY_BUSINESS_STATS_REQUEST,
				siteId: 123,
				interval: 'month',
				statType: 'actions',
				aggregation: 'total',
			} );

			expect(
				getGoolgeMyBusinessSiteStats(
					{ googleMyBusiness: newState },
					123,
					'actions',
					'month',
					'total'
				)
			).to.be.null;
		} );

		test( 'should reset data only for specific site', () => {
			const siteData = {
				stats: {
					actions: {
						month: {
							total: {
								interval: 'month',
								statType: 'actions',
								aggregation: 'total',
								data: { hello: 'world' },
							},
						},
					},
				},
			};

			const state = {
				123: siteData,
				1234: siteData,
			};

			const newState = googleMyBusinessReducer( state, {
				type: GOOGLE_MY_BUSINESS_STATS_REQUEST,
				siteId: 123,
				interval: 'month',
				statType: 'actions',
				aggregation: 'total',
			} );

			const fullNewState = { googleMyBusiness: newState };

			expect( getGoolgeMyBusinessSiteStats( fullNewState, 123, 'actions', 'month', 'total' ) ).to.be
				.null;
			expect( getGoolgeMyBusinessSiteStats( fullNewState, 1234, 'actions', 'month', 'total' ) ).eql(
				siteData.stats.actions.month.total
			);
		} );

		test( 'should reset data only for specific stat', () => {
			const siteData = {
				stats: {
					actions: {
						month: {
							total: {
								interval: 'month',
								statType: 'actions',
								aggregation: 'total',
								data: { hello: 'world' },
							},
							daily: {
								interval: 'daily',
								statType: 'actions',
								aggregation: 'total',
								data: { hello: 'world' },
							},
						},
					},
				},
			};

			const state = {
				123: siteData,
			};

			const newState = googleMyBusinessReducer( state, {
				type: GOOGLE_MY_BUSINESS_STATS_REQUEST,
				siteId: 123,
				interval: 'month',
				statType: 'actions',
				aggregation: 'total',
			} );

			const fullNewState = { googleMyBusiness: newState };

			expect( getGoolgeMyBusinessSiteStats( fullNewState, 123, 'actions', 'month', 'total' ) ).to.be
				.null;
			expect( getGoolgeMyBusinessSiteStats( fullNewState, 123, 'actions', 'month', 'daily' ) ).eql(
				siteData.stats.actions.month.daily
			);
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
							actions: {
								month: {
									total: {
										interval: 'month',
										statType: 'actions',
										aggregation: 'total',
										data: { hello: 'world' },
									},
								},
							},
						},
					},
				},
			};

			expect( getGoolgeMyBusinessSiteStats( state, 123, 'actions', 'month', 'total' ) ).to.eql( {
				interval: 'month',
				statType: 'actions',
				aggregation: 'total',
				data: { hello: 'world' },
			} );
		} );
	} );
} );

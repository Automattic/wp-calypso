/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import googleMyBusinessReducer from '../reducer';
import {
	GOOGLE_MY_BUSINESS_STATS_RECEIVE,
	GOOGLE_MY_BUSINESS_STATS_REQUEST,
} from 'calypso/state/action-types';

describe( 'reducer', () => {
	describe( '#stats', () => {
		test( 'should save data', () => {
			const state = googleMyBusinessReducer( undefined, {
				type: GOOGLE_MY_BUSINESS_STATS_RECEIVE,
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
					stats: {
						actions: {
							month: {
								total: { hello: 'world' },
							},
						},
					},
					statsError: {},
					statsInterval: {},
				},
			} );
		} );

		test( 'should reset data on request to server', () => {
			const state = {
				123: {
					stats: {
						actions: {
							month: {
								total: { hello: 'world' },
							},
						},
					},
				},
			};

			expect(
				googleMyBusinessReducer( state, {
					type: GOOGLE_MY_BUSINESS_STATS_REQUEST,
					siteId: 123,
					interval: 'month',
					statType: 'actions',
					aggregation: 'total',
				} )
			).to.be.empty;
		} );

		test( 'should reset data only for specific site', () => {
			const siteData = {
				stats: {
					actions: {
						month: {
							total: { hello: 'world' },
						},
					},
				},
			};

			const state = {
				123: siteData,
				1234: siteData,
			};

			expect(
				googleMyBusinessReducer( state, {
					type: GOOGLE_MY_BUSINESS_STATS_REQUEST,
					siteId: 123,
					interval: 'month',
					statType: 'actions',
					aggregation: 'total',
				} )
			).to.eql( {
				1234: {
					stats: {
						actions: {
							month: {
								total: { hello: 'world' },
							},
						},
					},
				},
			} );
		} );

		test( 'should reset data only for specific stat', () => {
			const state = {
				123: {
					stats: {
						actions: {
							month: {
								total: { hello: 'world' },
								daily: { hello: 'world' },
							},
						},
					},
				},
			};

			expect(
				googleMyBusinessReducer( state, {
					type: GOOGLE_MY_BUSINESS_STATS_REQUEST,
					siteId: 123,
					interval: 'month',
					statType: 'actions',
					aggregation: 'total',
				} )
			).to.eql( {
				123: {
					stats: {
						actions: {
							month: {
								daily: { hello: 'world' },
							},
						},
					},
					statsError: {},
					statsInterval: {},
				},
			} );
		} );
	} );
} );

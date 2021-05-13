/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getSiteStatsForQuery,
	getSiteStatsPostStreakData,
	getSiteStatsNormalizedData,
	isRequestingSiteStatsForQuery,
	getSiteStatsCSVData,
	hasSiteStatsQueryFailed,
} from '../selectors';
import { userState } from 'calypso/state/selectors/test/fixtures/user-state';

describe( 'selectors', () => {
	beforeEach( () => {
		getSiteStatsPostStreakData.clearCache();
		getSiteStatsNormalizedData.clearCache();
	} );

	describe( 'isRequestingSiteStatsForQuery()', () => {
		test( 'should return false if no request exists', () => {
			const requesting = isRequestingSiteStatsForQuery(
				{
					stats: {
						lists: {
							requests: {},
						},
					},
				},
				2916284,
				'statsStreak',
				{}
			);

			expect( requesting ).to.be.false;
		} );

		test( 'should return false if query is not requesting', () => {
			const requesting = isRequestingSiteStatsForQuery(
				{
					stats: {
						lists: {
							requests: {
								2916284: {
									statsStreak: {
										'[["endDate","2016-06-01"],["startDate","2015-06-01"]]': { requesting: false },
									},
								},
							},
						},
					},
				},
				2916284,
				'statsStreak',
				{ startDate: '2015-06-01', endDate: '2016-06-01' }
			);

			expect( requesting ).to.be.false;
		} );

		test( 'should return true if query is in progress', () => {
			const requesting = isRequestingSiteStatsForQuery(
				{
					stats: {
						lists: {
							requests: {
								2916284: {
									statsStreak: {
										'[["endDate","2016-06-01"],["startDate","2015-06-01"]]': { requesting: true },
									},
								},
							},
						},
					},
				},
				2916284,
				'statsStreak',
				{ startDate: '2015-06-01', endDate: '2016-06-01' }
			);

			expect( requesting ).to.be.true;
		} );
	} );

	describe( 'hasSiteStatsQueryFailed()', () => {
		test( 'should return false if no request exists', () => {
			const hasFailed = hasSiteStatsQueryFailed(
				{
					stats: {
						lists: {
							requests: {},
						},
					},
				},
				2916284,
				'statsStreak',
				{}
			);

			expect( hasFailed ).to.be.false;
		} );

		test( 'should return false if the request status is success', () => {
			const hasFailed = hasSiteStatsQueryFailed(
				{
					stats: {
						lists: {
							requests: {
								2916284: {
									statsStreak: {
										'[["endDate","2016-06-01"],["startDate","2015-06-01"]]': {
											requesting: false,
											status: 'success',
										},
									},
								},
							},
						},
					},
				},
				2916284,
				'statsStreak',
				{ startDate: '2015-06-01', endDate: '2016-06-01' }
			);

			expect( hasFailed ).to.be.false;
		} );

		test( 'should return true if the request status is error', () => {
			const hasFailed = hasSiteStatsQueryFailed(
				{
					stats: {
						lists: {
							requests: {
								2916284: {
									statsStreak: {
										'[["endDate","2016-06-01"],["startDate","2015-06-01"]]': {
											requesting: false,
											status: 'error',
										},
									},
								},
							},
						},
					},
				},
				2916284,
				'statsStreak',
				{ startDate: '2015-06-01', endDate: '2016-06-01' }
			);

			expect( hasFailed ).to.be.true;
		} );
	} );

	describe( 'getSiteStatsForQuery()', () => {
		test( 'should return null if no matching query results exist', () => {
			const stats = getSiteStatsForQuery(
				{
					stats: {
						lists: {
							items: {},
						},
					},
				},
				2916284,
				'statsStreak',
				{}
			);

			expect( stats ).to.be.null;
		} );

		test( 'should return matching stats', () => {
			const stats = getSiteStatsForQuery(
				{
					stats: {
						lists: {
							items: {
								2916284: {
									statsStreak: {
										'[["endDate","2016-06-01"],["startDate","2015-06-01"]]': {
											1461889800: 1, // 2016-04-29 00:30:00 (UTC)
											1461972600: 1, // 2016-04-29 23:30:00 (UTC)
											1462059000: 1, // 2016-04-30 23:30:00 (UTC)
										},
									},
								},
							},
						},
					},
				},
				2916284,
				'statsStreak',
				{ startDate: '2015-06-01', endDate: '2016-06-01' }
			);

			expect( stats ).to.eql( {
				1461889800: 1,
				1461972600: 1,
				1462059000: 1,
			} );
		} );
	} );

	describe( 'getSiteStatsPostStreakData()', () => {
		test( 'should return an empty object if no matching query results exist', () => {
			const stats = getSiteStatsPostStreakData(
				{
					stats: {
						lists: {
							items: {},
						},
					},
				},
				2916284,
				{}
			);

			expect( stats ).to.eql( {} );
		} );

		test( 'should return properly formatted data if matching data for query exists', () => {
			const stats = getSiteStatsPostStreakData(
				{
					stats: {
						lists: {
							items: {
								2916284: {
									statsStreak: {
										'[["endDate","2016-06-01"],["startDate","2015-06-01"]]': {
											streak: {},
											data: {
												1461889800: 1, // 2016-04-29 00:30:00 (UTC)
												1461972600: 1, // 2016-04-29 23:30:00 (UTC)
												1462059000: 1, // 2016-04-30 23:30:00 (UTC)
											},
										},
									},
								},
							},
						},
					},
				},
				2916284,
				{ startDate: '2015-06-01', endDate: '2016-06-01' }
			);

			expect( stats ).to.eql( {
				'2016-04-29': 2,
				'2016-04-30': 1,
			} );
		} );

		test( 'should handle malformed data if matching data for query exists', () => {
			const stats = getSiteStatsPostStreakData(
				{
					stats: {
						lists: {
							items: {
								2916284: {
									statsStreak: {
										'[["endDate","2016-06-01"],["startDate","2015-06-01"]]': {
											streak: {},
											data: [ 1461889800 ],
										},
									},
								},
							},
						},
					},
				},
				2916284,
				{ startDate: '2015-06-01', endDate: '2016-06-01' }
			);

			expect( stats ).to.eql( {} );
		} );

		test( 'should return post streak data based on the GMT offset of the current site', () => {
			const state = {
				stats: {
					lists: {
						items: {
							2916284: {
								statsStreak: {
									[ '[["endDate","2016-06-01"],["gmtOffset",-10],["startDate","2015-06-01"]]' ]: {
										streak: {},
										data: {
											1461889800: 1, // 2016-04-29 00:30:00 (UTC)
											1461972600: 1, // 2016-04-29 23:30:00 (UTC)
											1462059000: 1, // 2016-04-30 23:30:00 (UTC)
										},
									},
									[ '[["endDate","2016-06-01"],["gmtOffset",0],["startDate","2015-06-01"]]' ]: {
										streak: {},
										data: {
											1461889800: 1, // 2016-04-29 00:30:00 (UTC)
											1461972600: 1, // 2016-04-29 23:30:00 (UTC)
											1462059000: 1, // 2016-04-30 23:30:00 (UTC)
										},
									},
									[ '[["endDate","2016-06-01"],["gmtOffset",10],["startDate","2015-06-01"]]' ]: {
										streak: {},
										data: {
											1461889800: 1, // 2016-04-29 00:30:00 (UTC)
											1461972600: 1, // 2016-04-29 23:30:00 (UTC)
											1462059000: 1, // 2016-04-30 23:30:00 (UTC)
										},
									},
								},
							},
						},
					},
				},
			};

			const stats1 = getSiteStatsPostStreakData( state, 2916284, {
				startDate: '2015-06-01',
				endDate: '2016-06-01',
				gmtOffset: -10,
			} );

			const stats2 = getSiteStatsPostStreakData( state, 2916284, {
				startDate: '2015-06-01',
				endDate: '2016-06-01',
				gmtOffset: 0,
			} );

			const stats3 = getSiteStatsPostStreakData( state, 2916284, {
				startDate: '2015-06-01',
				endDate: '2016-06-01',
				gmtOffset: 10,
			} );

			expect( stats1 ).to.eql( {
				'2016-04-28': 1,
				'2016-04-29': 1,
				'2016-04-30': 1,
			} );

			expect( stats2 ).to.eql( {
				'2016-04-29': 2,
				'2016-04-30': 1,
			} );

			expect( stats3 ).to.eql( {
				'2016-04-29': 1,
				'2016-04-30': 1,
				'2016-05-01': 1,
			} );
		} );
	} );

	describe( 'getSiteStatsNormalizedData()', () => {
		test( 'should return null if no matching query results exist', () => {
			const stats = getSiteStatsNormalizedData(
				{
					...userState,
					stats: {
						lists: {
							items: {},
						},
					},
					sites: {
						items: {},
					},
				},
				2916284,
				'stats',
				{}
			);

			expect( stats ).to.be.null;
		} );

		test( 'should return API payload data, if no normalizer exists', () => {
			const stats = getSiteStatsNormalizedData(
				{
					...userState,
					stats: {
						lists: {
							items: {
								2916284: {
									notReallyStats: {
										'[]': {
											bestPostTitleEver: 'Chicken and Ribs',
										},
									},
								},
							},
						},
					},
					sites: {
						items: {},
					},
				},
				2916284,
				'notReallyStats',
				{}
			);

			expect( stats ).to.eql( {
				bestPostTitleEver: 'Chicken and Ribs',
			} );
		} );

		test( 'should return normalized data, if normalizer exists', () => {
			const stats = getSiteStatsNormalizedData(
				{
					...userState,
					stats: {
						lists: {
							items: {
								2916284: {
									stats: {
										'[]': {
											stats: {
												posts: 2,
												views: 300,
												visitors: 400,
												views_best_day: '2010-09-29',
												views_best_day_total: 100,
											},
										},
									},
								},
							},
						},
					},
					sites: {
						items: {},
					},
				},
				2916284,
				'stats',
				{}
			);

			expect( stats ).to.eql( {
				posts: 2,
				views: 300,
				visitors: 400,
				viewsBestDay: '2010-09-29',
				viewsBestDayTotal: 100,
			} );
		} );
	} );

	describe( 'getSiteStatsCSVData()', () => {
		test( 'should return an empty array if no matching query results exist', () => {
			const stats = getSiteStatsCSVData(
				{
					...userState,
					stats: {
						lists: {
							items: {},
						},
					},
					sites: {
						items: {},
					},
				},
				2916284,
				'stats',
				{}
			);

			expect( stats ).to.eql( [] );
		} );

		test( 'should return normalized data, if normalizer exists', () => {
			const stats = getSiteStatsCSVData(
				{
					...userState,
					stats: {
						lists: {
							items: {
								2916284: {
									statsCountryViews: {
										'[["date","2015-12-25"],["period","day"]]': {
											date: '2015-12-25',
											days: {
												'2015-12-25': {
													views: [
														{
															country_code: 'US',
															views: 1,
														},
													],
													other_views: 0,
													total_views: 1,
												},
											},
											'country-info': {
												US: {
													flag_icon:
														'https://secure.gravatar.com/blavatar/5a83891a81b057fed56930a6aaaf7b3c?s=48',
													flat_flag_icon:
														'https://secure.gravatar.com/blavatar/9f4faa5ad0c723474f7a6d810172447c?s=48',
													country_full: 'United States',
													map_region: '021',
												},
											},
										},
									},
								},
							},
						},
					},
					sites: {
						items: {},
					},
				},
				2916284,
				'statsCountryViews',
				{
					date: '2015-12-25',
					period: 'day',
				}
			);

			expect( stats ).to.eql( [ [ '"United States"', 1 ] ] );
		} );
	} );
} );

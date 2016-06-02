/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getParsedStreakDataForQuery,
	getSiteStatsForQuery,
	isRequestingSiteStatsForQuery
} from '../selectors';

describe( 'selectors', () => {
	beforeEach( () => {
		getParsedStreakDataForQuery.memoizedSelector.cache.clear();
	} );

	describe( 'isRequestingSiteStatsForQuery()', () => {
		it( 'should return false if no request exists', () => {
			const requesting = isRequestingSiteStatsForQuery( {
				stats: {
					lists: {
						requesting: {}
					}
				}
			}, 2916284, 'statsStreak', {} );

			expect( requesting ).to.be.false;
		} );

		it( 'should return false if query is not requesting', () => {
			const requesting = isRequestingSiteStatsForQuery( {
				stats: {
					lists: {
						requesting: {
							2916284: {
								statsStreak: {
									'[["endDate","2016-06-01"],["startDate","2015-06-01"]]': false
								}
							}
						}
					}
				}
			}, 2916284, 'statsStreak', { startDate: '2015-06-01', endDate: '2016-06-01' } );

			expect( requesting ).to.be.false;
		} );

		it( 'should return true if query is in progress', () => {
			const requesting = isRequestingSiteStatsForQuery( {
				stats: {
					lists: {
						requesting: {
							2916284: {
								statsStreak: {
									'[["endDate","2016-06-01"],["startDate","2015-06-01"]]': true
								}
							}
						}
					}
				}
			}, 2916284, 'statsStreak', { startDate: '2015-06-01', endDate: '2016-06-01' } );

			expect( requesting ).to.be.true;
		} );
	} );

	describe( 'getSiteStatsForQuery()', () => {
		it( 'should return null if no matching query results exist', () => {
			const stats = getSiteStatsForQuery( {
				stats: {
					lists: {
						items: {}
					}
				}
			}, 2916284, 'statsStreak', {} );

			expect( stats ).to.be.null;
		} );

		it( 'should return matching stats', () => {
			const stats = getSiteStatsForQuery( {
				stats: {
					lists: {
						items: {
							2916284: {
								statsStreak: {
									'[["endDate","2016-06-01"],["startDate","2015-06-01"]]': {
										1461961382: 1,
										1464110402: 1,
										1464110448: 1
									}
								}
							}
						}
					}
				}
			}, 2916284, 'statsStreak', { startDate: '2015-06-01', endDate: '2016-06-01' } );

			expect( stats ).to.eql( {
				1461961382: 1,
				1464110402: 1,
				1464110448: 1
			} );
		} );
	} );

	describe( 'getParsedStreakDataForQuery()', () => {
		it( 'should return default object if no matching query results exist', () => {
			const stats = getParsedStreakDataForQuery( {
				stats: {
					lists: {
						items: {}
					}
				}
			}, 2916284, {} );

			expect( stats ).to.eql( { days: {}, best: { day: 0, percent: 0 }, max: 0 } );
		} );

		it( 'should properly formatted data if matching data for query exists', () => {
			const stats = getParsedStreakDataForQuery( {
				stats: {
					lists: {
						items: {
							2916284: {
								statsStreak: {
									'[["endDate","2016-06-01"],["startDate","2015-06-01"]]': {
										1461961382: 1,
										1464110402: 1,
										1464110448: 1
									}
								}
							}
						}
					}
				}
			}, 2916284, { startDate: '2015-06-01', endDate: '2016-06-01' } );

			expect( stats ).to.eql( {
				best: {
					day: 2,
					percent: 67
				},
				days: {
					'2016-04-29': 1,
					'2016-05-24': 2
				},
				max: 2
			} );
		} );
	} );
} );

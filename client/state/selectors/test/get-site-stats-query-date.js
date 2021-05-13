/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getSiteStatsQueryDate } from 'calypso/state/stats/lists/selectors';

describe( 'getSiteStatsQueryDate()', () => {
	test( 'should return undefined if no request exists', () => {
		const date = getSiteStatsQueryDate(
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

		expect( date ).to.be.undefined;
	} );

	test( 'should return the query date properly', () => {
		const today = new Date();
		const date = getSiteStatsQueryDate(
			{
				stats: {
					lists: {
						requests: {
							2916284: {
								statsStreak: {
									'[["endDate","2016-06-01"],["startDate","2015-06-01"]]': { date: today },
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

		expect( date ).to.eql( today );
	} );
} );

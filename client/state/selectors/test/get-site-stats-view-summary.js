/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getSiteStatsViewSummary } from 'calypso/state/stats/lists/selectors';

describe( 'getSiteStatsViewSummary()', () => {
	test( 'should return null if no data exists', () => {
		const data = getSiteStatsViewSummary(
			{
				stats: {
					lists: {
						items: {},
					},
				},
			},
			2916284
		);

		expect( data ).to.be.null;
	} );

	test( 'should return an empty object if data is empty', () => {
		const data = getSiteStatsViewSummary(
			{
				stats: {
					lists: {
						items: {
							2916284: {
								statsVisits: {
									'[["quantity",-1],["stat_fields","views"]]': {
										data: [],
										fields: [ 'period', 'views' ],
										unit: 'day',
									},
								},
							},
						},
					},
				},
			},
			2916284
		);

		expect( data ).to.eql( {} );
	} );

	test( 'should return a parsed object if data is present', () => {
		const data = getSiteStatsViewSummary(
			{
				stats: {
					lists: {
						items: {
							2916284: {
								statsVisits: {
									'[["quantity",-1],["stat_fields","views"]]': {
										data: [
											[ '2014-01-01', 4 ],
											[ '2014-01-02', 4 ],
											[ '2014-01-03', 23 ],
											[ '2015-01-01', 10 ],
										],
										fields: [ 'period', 'views' ],
										unit: 'day',
									},
								},
							},
						},
					},
				},
			},
			2916284
		);

		expect( data ).to.eql( {
			2014: {
				0: {
					total: 31,
					average: 1,
					daysInMonth: 31,
					data: [
						[ '2014-01-01', 4 ],
						[ '2014-01-02', 4 ],
						[ '2014-01-03', 23 ],
					],
				},
			},
			2015: {
				0: {
					total: 10,
					average: 0,
					daysInMonth: 31,
					data: [ [ '2015-01-01', 10 ] ],
				},
			},
		} );
	} );
} );

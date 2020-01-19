/**
 * Internal dependencies
 */
import { getCountRecords, getLoadingTabs } from '../selectors';

describe( 'selectors', () => {
	const siteId = 1234;
	const period = 'month';

	const state = {
		stats: {
			chartTabs: {
				counts: {
					[ siteId ]: {
						[ period ]: [
							{
								period: '2100-11-10',
								views: 247,
								labelDay: 'Nov 10',
								classNames: [],
							},
							{
								period: '2100-11-11',
								views: 247,
								labelDay: 'Nov 11',
								classNames: [],
							},
							{
								period: '2100-11-12',
								views: 247,
								labelDay: 'Nov 12',
								classNames: [],
							},
						],
					},
				},
				isLoading: {
					[ siteId ]: {
						[ period ]: {
							views: false,
							visitors: true,
							likes: true,
							comments: true,
							post_titles: true,
						},
					},
				},
			},
		},
	};

	describe( '#getCountRecords()', () => {
		test( 'should default to an empty array', () => {
			expect( getCountRecords( state, -1, period ) ).toEqual( [] );
			expect( getCountRecords( state, siteId, 'nonsense' ) ).toEqual( [] );
		} );

		test( "should return a site's chart counts given a duration period", () => {
			expect( getCountRecords( state, siteId, period ) ).toEqual( [
				{
					period: '2100-11-10',
					views: 247,
					labelDay: 'Nov 10',
					classNames: [],
				},
				{
					period: '2100-11-11',
					views: 247,
					labelDay: 'Nov 11',
					classNames: [],
				},
				{
					period: '2100-11-12',
					views: 247,
					labelDay: 'Nov 12',
					classNames: [],
				},
			] );
		} );
	} );
	describe( '#getLoadingTabs()', () => {
		const loadingTabs = getLoadingTabs( state, siteId, period );
		test( 'should return an array', () => {
			expect( Array.isArray( loadingTabs ) ).toBeTruthy();
		} );
		test( 'should return an array of statistical types that are being loaded', () => {
			expect( loadingTabs ).toEqual( [ 'visitors', 'likes', 'comments', 'post_titles' ] );
		} );
	} );
} );

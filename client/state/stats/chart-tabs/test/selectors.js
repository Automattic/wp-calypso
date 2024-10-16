import { getCountRecords, getLoadingTabs } from '../selectors';

describe( 'selectors', () => {
	const siteId = 1234;
	const date = '2100-11-10';
	const period = 'month';
	const quantity = 3;

	const requestKey = `${ date }-${ period }-${ quantity }`;

	const state = {
		stats: {
			chartTabs: {
				counts: {
					[ siteId ]: {
						[ requestKey ]: [
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
						[ requestKey ]: {
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
			expect( getCountRecords( state, siteId, date, period, quantity ) ).toEqual( [
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
		const loadingTabs = getLoadingTabs( state, siteId, date, period, quantity );
		test( 'should return an array', () => {
			expect( Array.isArray( loadingTabs ) ).toBeTruthy();
		} );
		test( 'should return an array of statistical types that are being loaded', () => {
			expect( loadingTabs ).toEqual( [ 'visitors', 'likes', 'comments', 'post_titles' ] );
		} );
	} );
} );

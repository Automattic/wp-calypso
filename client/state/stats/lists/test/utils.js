/**
 * External dependencies
 */
import moment from 'moment';

/**
 * Internal dependencies
 */
import {
	buildExportArray,
	getChartLabels,
	getPeriodFormat,
	getSerializedStatsQuery,
	isAutoRefreshAllowedForQuery,
	normalizers,
	parseOrderDeltas,
	parseOrdersChartData,
	parseStoreStatsReferrers,
	rangeOfPeriod,
} from '../utils';

describe( 'utils', () => {
	const orderPayload = {
		date: '2017',
		unit: 'year',
		quantity: '10',
		fields: [ 'period', 'orders', 'currency' ],
		data: [
			[ 2016, 0, 'NZD' ],
			[ 2017, 14, 'NZD' ],
		],
		delta_fields: [
			'period',
			'delta',
			'percentage_change',
			'reference_period',
			'favorable',
			'direction',
			'currency',
		],
		deltas: [
			{
				period: 2016,
				orders: [ 2016, 0, 0, 2015, '', 'is-neutral', 'NZD' ],
			},
			{
				period: 2017,
				orders: [ 2017, 14, 0, 2016, 'is-favorable', 'is-undefined-increase', 'NZD' ],
			},
		],
		total_orders: 14,
	};

	describe( 'parseOrderDeltas', () => {
		const expectedDeltas = [
			{
				period: '2016-12-31',
				orders: {
					period: 2016,
					delta: 0,
					percentage_change: 0,
					reference_period: 2015,
					favorable: '',
					direction: 'is-neutral',
					currency: 'NZD',
				},
			},
			{
				period: '2017-12-31',
				orders: {
					period: 2017,
					delta: 14,
					percentage_change: 0,
					reference_period: 2016,
					favorable: 'is-favorable',
					direction: 'is-undefined-increase',
					currency: 'NZD',
				},
			},
		];

		test( 'should return empty array if payload is null', () => {
			expect( parseOrderDeltas( null ) ).toEqual( [] );
		} );

		test( 'should return empty array if payload.deltas has no keys', () => {
			expect(
				parseOrderDeltas( {
					date: '2017',
					deltas: {},
					delta_fields: [ 'period' ],
				} )
			).toEqual( [] );
		} );

		test( 'should return empty array if payload.deltas or delta_fields are missing', () => {
			expect( parseOrderDeltas( { date: '2017' } ) ).toEqual( [] );
		} );

		test( 'should return a well formed array of delta objects', () => {
			expect( parseOrderDeltas( orderPayload ) ).toHaveProperty( '0.orders' );
		} );

		test( 'should return an array of delta objects as expected', () => {
			expect( parseOrderDeltas( orderPayload ) ).toEqual( expectedDeltas );
		} );
	} );
	describe( 'parseOrdersChartData', () => {
		const expectedOrders = [
			{
				period: '2016-12-31',
				orders: 0,
				currency: 'NZD',
				labelYear: '2016',
				classNames: [],
			},
			{
				period: '2017-12-31',
				orders: 14,
				currency: 'NZD',
				labelYear: '2017',
				classNames: [],
			},
		];

		test( 'should return empty array if payload.data is missing', () => {
			expect( parseOrdersChartData( { date: '2017' } ) ).toEqual( [] );
		} );

		test( 'should return a well-formed array of objects', () => {
			const actualOrders = parseOrdersChartData( orderPayload );
			expect( actualOrders ).toBeInstanceOf( Array );
			actualOrders.forEach( ( item ) => expect( typeof item ).toBe( 'object' ) );
		} );

		test( 'should return an array of objects as expected', () => {
			expect( parseOrdersChartData( orderPayload ) ).toEqual( expectedOrders );
		} );
	} );

	describe( 'getPeriodFormat', () => {
		test( 'should return correctly day format for long formats', () => {
			expect( getPeriodFormat( 'day', '2017-07-07' ) ).toBe( 'YYYY-MM-DD' );
		} );

		test( 'should return correctly week format for long formats', () => {
			expect( getPeriodFormat( 'week', '2017-07-07' ) ).toBe( 'YYYY-MM-DD' );
		} );

		test( 'should return correctly month format for long formats', () => {
			expect( getPeriodFormat( 'month', '2017-07-07' ) ).toBe( 'YYYY-MM-DD' );
		} );

		test( 'should return correctly year format for long formats', () => {
			expect( getPeriodFormat( 'year', '2017-07-07' ) ).toBe( 'YYYY-MM-DD' );
		} );

		test( 'should return correctly day format for short (new) formats', () => {
			expect( getPeriodFormat( 'day', '2017-07-07' ) ).toBe( 'YYYY-MM-DD' );
		} );

		test( 'should return correctly week format for short (new) formats', () => {
			expect( getPeriodFormat( 'week', '2017-W27' ) ).toBe( 'YYYY-[W]WW' );
		} );

		test( 'should return correctly month format for short (new) formats', () => {
			expect( getPeriodFormat( 'month', '2017-07' ) ).toBe( 'YYYY-MM' );
		} );

		test( 'should return correctly year format for short (new) formats', () => {
			expect( getPeriodFormat( 'year', '2017' ) ).toBe( 'YYYY' );
		} );
	} );

	describe( 'buildExportArray()', () => {
		test( 'should an empty array if data not supplied', () => {
			expect( buildExportArray( {} ) ).toEqual( [] );
		} );

		test( 'should parse simple object to csv', () => {
			expect(
				buildExportArray( {
					label: 'Chicken',
					value: 10,
				} )
			).toEqual( [ [ '"Chicken"', 10 ] ] );
		} );

		test( 'should escape simple object to csv', () => {
			expect(
				buildExportArray( {
					label: 'Chicken and "Ribs"',
					value: 10,
				} )
			).toEqual( [ [ '"Chicken and ""Ribs""', 10 ] ] );
		} );

		test( 'should recurse child data', () => {
			expect(
				buildExportArray( {
					label: 'BBQ',
					value: 10,
					children: [
						{
							label: 'Chicken',
							value: 5,
						},
						{
							label: 'Ribs',
							value: 2,
							children: [
								{
									label: 'Babyback',
									value: 1,
								},
							],
						},
					],
				} )
			).toEqual( [
				[ '"BBQ"', 10 ],
				[ '"BBQ > Chicken"', 5 ],
				[ '"BBQ > Ribs"', 2 ],
				[ '"BBQ > Ribs > Babyback"', 1 ],
			] );
		} );
	} );

	describe( 'rangeOfPeriod()', () => {
		test( 'should return a period object for day', () => {
			expect( rangeOfPeriod( 'day', '2016-06-01' ) ).toEqual( {
				startOf: '2016-06-01',
				endOf: '2016-06-01',
			} );
		} );

		test( 'should return a period object for week', () => {
			expect( rangeOfPeriod( 'week', '2016-06-01' ) ).toEqual( {
				startOf: '2016-05-30',
				endOf: '2016-06-05',
			} );
		} );

		test( 'should return a period object for month', () => {
			expect( rangeOfPeriod( 'month', '2016-06-05' ) ).toEqual( {
				startOf: '2016-06-01',
				endOf: '2016-06-30',
			} );
		} );

		test( 'should return a period object for year', () => {
			expect( rangeOfPeriod( 'year', '2016-06-05' ) ).toEqual( {
				startOf: '2016-01-01',
				endOf: '2016-12-31',
			} );
		} );
	} );

	describe( 'getSerializedStatsQuery()', () => {
		test( 'should return a JSON string of a query', () => {
			expect(
				getSerializedStatsQuery( {
					startDate: '2016-06-01',
					endDate: '2016-07-01',
				} )
			).toBe( '[["endDate","2016-07-01"],["startDate","2016-06-01"]]' );
		} );

		test( 'should return the same JSON string of a query regardless of query object order', () => {
			expect(
				getSerializedStatsQuery( {
					startDate: '2016-06-01',
					endDate: '2016-07-01',
				} )
			).toEqual(
				getSerializedStatsQuery( {
					endDate: '2016-07-01',
					startDate: '2016-06-01',
				} )
			);
		} );
	} );

	describe( 'isAutoRefreshAllowedForQuery()', () => {
		test( 'should return true if not query specified', () => {
			expect( isAutoRefreshAllowedForQuery() ).toBe( true );
		} );

		test( 'should return true for empty queries', () => {
			expect( isAutoRefreshAllowedForQuery( {} ) ).toBe( true );
		} );

		test( 'should return true for queries without date', () => {
			expect( isAutoRefreshAllowedForQuery( { quantity: 3 } ) ).toBe( true );
		} );

		test( 'should return true for queries without period', () => {
			expect( isAutoRefreshAllowedForQuery( { date: '2016-06-01' } ) ).toBe( true );
		} );

		test( "should return false for a period that doesn't include today", () => {
			expect( isAutoRefreshAllowedForQuery( { period: 'week', date: '2016-06-01' } ) ).toBe(
				false
			);
		} );

		test( 'should return true for a period that includes today', () => {
			expect(
				isAutoRefreshAllowedForQuery( {
					period: 'day',
					date: moment().format( 'YYYY-MM-DD' ),
				} )
			).toBe( true );
		} );
	} );

	describe( 'normalizers', () => {
		describe( 'stats()', () => {
			test( 'should return null if no data is passed', () => {
				expect( normalizers.stats() ).toBeNull();
			} );

			test( 'should return null if data object is missing stats attribute', () => {
				expect( normalizers.stats( { foo: false } ) ).toBeNull();
			} );

			test( 'should return parsed camelCased stats object', () => {
				expect(
					normalizers.stats( {
						stats: {
							posts: 2,
							views: 300,
							visitors: 400,
							views_best_day: '2010-09-29',
							views_best_day_total: 100,
						},
					} )
				).toEqual( {
					posts: 2,
					views: 300,
					visitors: 400,
					viewsBestDay: '2010-09-29',
					viewsBestDayTotal: 100,
				} );
			} );
		} );

		describe( 'statsFollowers()', () => {
			test( 'should return null if no data is provided', () => {
				expect( normalizers.statsFollowers() ).toBeNull();
			} );

			test( 'should properly parse followers response', () => {
				expect(
					normalizers.statsFollowers( {
						page: 1,
						pages: 1,
						total: 1,
						total_email: 5,
						total_wpcom: 120,
						subscribers: [
							{
								avatar: null,
								label: 'wapuu@wordpress.org',
								ID: 11111111,
								url: null,
								follow_data: null,
								date_subscribed: '2015-04-07T18:53:05+00:00',
							},
						],
					} )
				).toEqual( {
					total_email: 5,
					total_wpcom: 120,
					subscribers: [
						{
							label: 'wapuu@wordpress.org',
							iconClassName: 'avatar-user',
							icon: null,
							link: null,
							value: {
								type: 'relative-date',
								value: '2015-04-07T18:53:05+00:00',
							},
							actions: [
								{
									type: 'follow',
									data: false,
								},
							],
						},
					],
				} );
			} );
		} );

		describe( 'statsCommentFollowers()', () => {
			test( 'should return null if no data is provided', () => {
				expect( normalizers.statsCommentFollowers() ).toBeNull();
			} );

			test( 'should properly parse followers response', () => {
				expect(
					normalizers.statsCommentFollowers( {
						page: 1,
						pages: 1,
						total: 1,
						posts: [
							{
								id: 0,
								followers: 20,
							},
							{
								id: 1111,
								title: 'My title',
								followers: 10,
								url: 'https://en.blog.wordpress.com/chicken',
							},
						],
					} )
				).toEqual( {
					page: 1,
					pages: 1,
					total: 1,
					posts: [
						{
							label: 'All Posts',
							value: 20,
						},
						{
							label: 'My title',
							labelIcon: 'external',
							link: 'https://en.blog.wordpress.com/chicken',
							value: 10,
						},
					],
				} );
			} );
		} );

		describe( 'statsComments()', () => {
			test( 'should return null if no data is provided', () => {
				expect( normalizers.statsComments() ).toBeNull();
			} );

			test( 'should properly parse comments stats response', () => {
				expect(
					normalizers.statsComments( {
						authors: [
							{
								name: 'John',
								comments: 12,
								link: '?user_id=1662656',
								gravatar:
									'https://secure.gravatar.com/blavatar/5a83891a81b057fed56930a6aaaf7b3c?s=48',
								follow_data: null,
							},
						],
						posts: [
							{
								id: 1111,
								name: 'My title',
								comments: 10,
								link: 'https://en.blog.wordpress.com/chicken',
							},
						],
					} )
				).toEqual( {
					posts: [
						{
							actions: [
								{
									data: 'https://en.blog.wordpress.com/chicken',
									type: 'link',
								},
							],
							label: 'My title',
							page: null,
							value: 10,
						},
					],
					authors: [
						{
							actions: [
								{
									data: false,
									type: 'follow',
								},
							],
							className: 'module-content-list-item-large',
							icon: 'https://secure.gravatar.com/blavatar/5a83891a81b057fed56930a6aaaf7b3c?d=mm',
							iconClassName: 'avatar-user',
							label: 'John',
							link: 'nulledit-comments.php?user_id=1662656',
							value: 12,
						},
					],
				} );
			} );
		} );

		describe( 'statsTopPosts()', () => {
			test( 'should return an empty array if data is null', () => {
				expect( normalizers.statsTopPosts() ).toEqual( [] );
			} );

			test( 'should return an empty array if query.period is null', () => {
				expect( normalizers.statsTopPosts( {}, { date: '2016-12-25' } ) ).toEqual( [] );
			} );

			test( 'should return an empty array if query.date is null', () => {
				expect( normalizers.statsTopPosts( {}, { period: 'day' } ) ).toEqual( [] );
			} );

			test( 'should properly parse day period response', () => {
				expect(
					normalizers.statsTopPosts(
						{
							date: '2017-01-12',
							days: {
								'2017-01-12': {
									postviews: [
										{
											id: 0,
											href: 'http://en.blog.wordpress.com',
											date: null,
											title: 'Home Page / Archives',
											type: 'homepage',
											views: 3939,
										},
									],
									total_views: 0,
								},
							},
						},
						{
							period: 'day',
							date: '2017-01-12',
						},
						10,
						{
							slug: 'en.blog.wordpress.com',
						}
					)
				).toEqual( [
					{
						label: 'Home Page / Archives',
						value: 3939,
						page: '/stats/post/0/en.blog.wordpress.com',
						actions: [
							{
								type: 'link',
								data: 'http://en.blog.wordpress.com',
							},
						],
						labelIcon: null,
						children: null,
						className: null,
					},
				] );
			} );

			test( 'should properly add published className for posts published in period', () => {
				expect(
					normalizers.statsTopPosts(
						{
							date: '2017-01-12',
							days: {
								'2017-01-12': {
									postviews: [
										{
											id: 777,
											href: 'http://en.blog.wordpress.com/2017/01/12/wordpress-com-lightroom/',
											date: '2017-01-12 15:55:34',
											title: 'New WordPress.com for Lightroom Makes Publishing Your Photos Easy',
											type: 'post',
											views: 774,
										},
									],
									total_views: 0,
								},
							},
						},
						{
							period: 'day',
							date: '2017-01-12',
						},
						10,
						{
							slug: 'en.blog.wordpress.com',
						}
					)
				).toEqual( [
					{
						label: 'New WordPress.com for Lightroom Makes Publishing Your Photos Easy',
						value: 774,
						page: '/stats/post/777/en.blog.wordpress.com',
						actions: [
							{
								type: 'link',
								data: 'http://en.blog.wordpress.com/2017/01/12/wordpress-com-lightroom/',
							},
						],
						labelIcon: null,
						children: null,
						className: 'published',
					},
				] );
			} );

			test( 'should properly parse summarized response', () => {
				expect(
					normalizers.statsTopPosts(
						{
							date: '2017-01-12',
							summary: {
								postviews: [
									{
										id: 0,
										href: 'http://en.blog.wordpress.com',
										date: null,
										title: 'Home Page / Archives',
										type: 'homepage',
										views: 3939,
									},
								],
								total_views: 0,
							},
						},
						{
							period: 'day',
							date: '2017-01-12',
							summarize: 1,
						},
						10,
						{
							slug: 'en.blog.wordpress.com',
						}
					)
				).toEqual( [
					{
						label: 'Home Page / Archives',
						value: 3939,
						page: '/stats/post/0/en.blog.wordpress.com',
						actions: [
							{
								type: 'link',
								data: 'http://en.blog.wordpress.com',
							},
						],
						labelIcon: null,
						children: null,
						className: null,
					},
				] );
			} );
		} );

		describe( 'statsCountryViews()', () => {
			test( 'should return null if data is null', () => {
				expect( normalizers.statsCountryViews() ).toBeNull();
			} );

			test( 'should return null if query.period is null', () => {
				expect( normalizers.statsCountryViews( {}, { date: '2016-12-25' } ) ).toBeNull();
			} );

			test( 'should return null if query.date is null', () => {
				expect( normalizers.statsCountryViews( {}, { period: 'day' } ) ).toBeNull();
			} );

			test( 'should properly parse day period response', () => {
				expect(
					normalizers.statsCountryViews(
						{
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
						{
							period: 'day',
							date: '2015-12-25',
						}
					)
				).toEqual( [
					{
						label: 'United States',
						countryCode: 'US',
						value: 1,
						region: '021',
					},
				] );
			} );

			test( 'should properly parse week period response', () => {
				expect(
					normalizers.statsCountryViews(
						{
							date: '2015-12-25',
							days: {
								'2015-12-21': {
									views: [
										{
											country_code: 'US',
											views: 10,
										},
									],
									other_views: 0,
									total_views: 10,
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
						{
							period: 'week',
							date: '2015-12-25',
						}
					)
				).toEqual( [
					{
						label: 'United States',
						countryCode: 'US',
						value: 10,
						region: '021',
					},
				] );
			} );

			test( 'should properly parse summarized response', () => {
				expect(
					normalizers.statsCountryViews(
						{
							date: '2015-12-25',
							summary: {
								views: [
									{
										country_code: 'US',
										views: 100,
									},
								],
								other_views: 0,
								total_views: 100,
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
						{
							period: 'day',
							summarize: 1,
							date: '2015-12-25',
						}
					)
				).toEqual( [
					{
						label: 'United States',
						countryCode: 'US',
						value: 100,
						region: '021',
					},
				] );
			} );

			test( 'should properly parse month period response', () => {
				expect(
					normalizers.statsCountryViews(
						{
							date: '2015-12-25',
							days: {
								'2015-12-01': {
									views: [
										{
											country_code: 'US',
											views: 100,
										},
									],
									other_views: 0,
									total_views: 100,
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
						{
							period: 'month',
							date: '2015-12-25',
						}
					)
				).toEqual( [
					{
						label: 'United States',
						countryCode: 'US',
						value: 100,
						region: '021',
					},
				] );
			} );

			test( 'should sanitize ’ from country names', () => {
				expect(
					normalizers.statsCountryViews(
						{
							date: '2015-12-25',
							days: {
								'2015-12-01': {
									views: [
										{
											country_code: 'US',
											views: 100,
										},
									],
									other_views: 0,
									total_views: 100,
								},
							},
							'country-info': {
								US: {
									flag_icon:
										'https://secure.gravatar.com/blavatar/5a83891a81b057fed56930a6aaaf7b3c?s=48',
									flat_flag_icon: 'https://s-ssl.wordpress.com/i/stats/square-grey.png',
									country_full: 'US’A',
									map_region: '021',
								},
							},
						},
						{
							period: 'month',
							date: '2015-12-25',
						}
					)
				).toEqual( [
					{
						label: "US'A",
						countryCode: 'US',
						value: 100,
						region: '021',
					},
				] );
			} );

			test( 'should ignore country_codes with no country-info', () => {
				expect(
					normalizers.statsCountryViews(
						{
							date: '2015-12-25',
							days: {
								'2015-12-01': {
									views: [
										{
											country_code: 'US',
											views: 100,
										},
										{
											country_code: 'DERP',
											views: 100,
										},
									],
									other_views: 0,
									total_views: 100,
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
						{
							period: 'month',
							date: '2015-12-25',
						}
					)
				).toEqual( [
					{
						label: 'United States',
						countryCode: 'US',
						value: 100,
						region: '021',
					},
				] );
			} );
		} );

		describe( 'statsInsights()', () => {
			test( 'should return an empty object if no data is passed', () => {
				expect( normalizers.statsInsights() ).toEqual( {} );
			} );

			test( 'should return null if data.highest_day_of_week is not numeric', () => {
				expect( normalizers.statsInsights( { highest_day_of_week: false } ) ).toEqual( {} );
			} );

			test( 'should return properly formatted data if matching data exists', () => {
				expect(
					normalizers.statsInsights( {
						highest_hour: 11,
						highest_day_percent: 10,
						highest_day_of_week: 6,
						highest_hour_percent: 5,
						hourly_views: [],
						years: [],
					} )
				).toEqual( {
					day: 'Sunday',
					hour: '11:00 AM',
					hourPercent: 5,
					percent: 10,
					hourlyViews: [],
					years: [],
				} );
			} );
		} );

		describe( 'statsPublicize()', () => {
			test( 'should return an empty array if not data is passed', () => {
				expect( normalizers.statsPublicize() ).toEqual( [] );
			} );

			test( 'should return an empty array if not data has no services attribute', () => {
				expect( normalizers.statsPublicize( { bad: [] } ) ).toEqual( [] );
			} );

			test( 'should return an a properly parsed services array', () => {
				expect(
					normalizers.statsPublicize( {
						services: [
							{
								service: 'twitter',
								followers: 528,
							},
							{
								service: 'facebook',
								followers: 282,
							},
						],
					} )
				).toEqual( [
					{
						label: 'Twitter',
						icon: 'https://secure.gravatar.com/blavatar/7905d1c4e12c54933a44d19fcd5f9356?s=48',
						value: 528,
					},
					{
						label: 'Facebook',
						icon: 'https://secure.gravatar.com/blavatar/2343ec78a04c6ea9d80806345d31fd78?s=48',
						value: 282,
					},
				] );
			} );
		} );

		describe( 'statsVideoPlays()', () => {
			test( 'should return an empty array if not data is passed', () => {
				expect( normalizers.statsVideoPlays() ).toEqual( [] );
			} );

			test( 'should return an empty array if query.period is null', () => {
				expect( normalizers.statsVideoPlays( {}, { date: '2016-12-25' } ) ).toEqual( [] );
			} );

			test( 'should return an empty array if query.date is null', () => {
				expect( normalizers.statsVideoPlays( {}, { period: 'day' } ) ).toEqual( [] );
			} );

			test( 'should properly parse day period response', () => {
				expect(
					normalizers.statsVideoPlays(
						{
							date: '2017-01-12',
							days: {
								'2017-01-12': {
									plays: [
										{
											plays: 32,
											post_id: 111111111,
											title: 'Press This!',
											url:
												'http://en.blog.wordpress.com/wp-admin/media.php?action=edit&attachment_id=111111111',
										},
									],
								},
							},
						},
						{
							period: 'day',
							date: '2017-01-12',
						},
						10,
						{
							slug: 'en.blog.wordpress.com',
						}
					)
				).toEqual( [
					{
						actions: [
							{
								data:
									'http://en.blog.wordpress.com/wp-admin/media.php?action=edit&attachment_id=111111111',
								type: 'link',
							},
						],
						label: 'Press This!',
						page: '/stats/day/videodetails/en.blog.wordpress.com?post=111111111',
						value: 32,
					},
				] );
			} );
		} );

		describe( 'statsVideo()', () => {
			test( 'should return null if not data is passed', () => {
				expect( normalizers.statsVideo() ).toBeNull();
			} );

			test( 'should return an a properly parsed data array', () => {
				expect(
					normalizers.statsVideo( {
						data: [
							[ '2016-11-12', 1 ],
							[ '2016-11-13', 0 ],
						],
						pages: [
							'https://vip.wordpress.com/category/themes/',
							'http://freewordpressthemes.ru/p2-theme-for-the-blog-inspired-twitter.html',
							'http://www.themepremium.com/blog-with-the-speed-of-your-thought-with-the-p2-theme/',
						],
					} )
				).toEqual( {
					data: [
						{
							period: '2016-11-13',
							value: 0,
						},
					],
					pages: [
						{
							label: 'https://vip.wordpress.com/category/themes/',
							link: 'https://vip.wordpress.com/category/themes/',
						},
						{
							label: 'http://freewordpressthemes.ru/p2-theme-for-the-blog-inspired-twitter.html',
							link: 'http://freewordpressthemes.ru/p2-theme-for-the-blog-inspired-twitter.html',
						},
						{
							label:
								'http://www.themepremium.com/blog-with-the-speed-of-your-thought-with-the-p2-theme/',
							link:
								'http://www.themepremium.com/blog-with-the-speed-of-your-thought-with-the-p2-theme/',
						},
					],
				} );
			} );
		} );

		describe( 'statsTopAuthors()', () => {
			test( 'should return an empty array if not data is passed', () => {
				expect( normalizers.statsTopAuthors() ).toEqual( [] );
			} );

			test( 'should return an empty array if query.period is null', () => {
				expect( normalizers.statsTopAuthors( {}, { date: '2016-12-25' } ) ).toEqual( [] );
			} );

			test( 'should return an empty array if query.date is null', () => {
				expect( normalizers.statsTopAuthors( {}, { period: 'day' } ) ).toEqual( [] );
			} );

			test( 'should return an a properly parsed data array', () => {
				expect(
					normalizers.statsTopAuthors(
						{
							date: '2017-01-17',
							days: {
								'2017-01-17': {
									authors: [
										{
											name: 'Timmy Crawford',
											avatar:
												'https://0.gravatar.com/avatar/9929daa7594d5afa910a777ccb9e88e4?s=64&size=G',
											posts: [
												{
													id: 30,
													title: 'Chicken',
													url: 'http://en.blog.wordpress.com/chicken',
													views: 6,
												},
												{
													id: 32,
													title: 'Ribs',
													url: 'http://en.blog.wordpress.com/ribs',
													views: 10,
												},
											],
										},
									],
								},
							},
						},
						{
							period: 'day',
							date: '2017-01-17',
							domain: 'en.blog.wordpress.com',
						},
						10,
						{
							slug: 'en.blog.wordpress.com',
						}
					)
				).toEqual( [
					{
						children: [
							{
								actions: [
									{
										data: 'http://en.blog.wordpress.com/chicken',
										type: 'link',
									},
								],
								children: null,
								label: 'Chicken',
								page: '/stats/post/30/en.blog.wordpress.com',
								value: 6,
							},
							{
								actions: [
									{
										data: 'http://en.blog.wordpress.com/ribs',
										type: 'link',
									},
								],
								children: null,
								label: 'Ribs',
								page: '/stats/post/32/en.blog.wordpress.com',
								value: 10,
							},
						],
						className: 'module-content-list-item-large',
						icon: 'https://0.gravatar.com/avatar/9929daa7594d5afa910a777ccb9e88e4?d=mm',
						iconClassName: 'avatar-user',
						label: 'Timmy Crawford',
						value: undefined,
					},
				] );
			} );
		} );

		describe( 'statsTags()', () => {
			test( 'should return an empty array if not data is passed', () => {
				expect( normalizers.statsTags() ).toEqual( [] );
			} );

			test( 'should return an empty array if not data has no tags attribute', () => {
				expect( normalizers.statsTags( { bad: [] } ) ).toEqual( [] );
			} );

			test( 'should return an a properly parsed data array', () => {
				expect(
					normalizers.statsTags( {
						date: '2014-10-01',
						tags: [
							{
								tags: [
									{
										type: 'category',
										name: 'Uncategorized',
										link: 'http://example.wordpress.com/category/uncategorized/',
									},
								],
								views: 2381,
							},
							{
								tags: [
									{
										type: 'tag',
										name: 'supertag-chicken',
										link: 'http://example.wordpress.com/tag/supertag-chicken/',
									},
									{
										type: 'tag',
										name: 'supertag-ribs',
										link: 'http://example.wordpress.com/tag/supertag-ribs/',
									},
								],
								views: 740,
							},
						],
					} )
				).toEqual( [
					{
						children: undefined,
						label: [
							{
								label: 'Uncategorized',
								labelIcon: 'folder',
								link: 'http://example.wordpress.com/category/uncategorized/',
							},
						],
						link: 'http://example.wordpress.com/category/uncategorized/',
						value: 2381,
					},
					{
						children: [
							{
								label: 'supertag-chicken',
								labelIcon: 'tag',
								link: 'http://example.wordpress.com/tag/supertag-chicken/',
								children: null,
								value: null,
							},
							{
								label: 'supertag-ribs',
								labelIcon: 'tag',
								link: 'http://example.wordpress.com/tag/supertag-ribs/',
								children: null,
								value: null,
							},
						],
						label: [
							{
								label: 'supertag-chicken',
								labelIcon: 'tag',
								link: null,
							},
							{
								label: 'supertag-ribs',
								labelIcon: 'tag',
								link: null,
							},
						],
						link: null,
						value: 740,
					},
				] );
			} );
		} );

		describe( 'statsClicks()', () => {
			test( 'should return an empty array if not data is passed', () => {
				expect( normalizers.statsClicks() ).toEqual( [] );
			} );

			test( 'should return an empty array if query.period is null', () => {
				expect( normalizers.statsClicks( {}, { date: '2016-12-25' } ) ).toEqual( [] );
			} );

			test( 'should return an empty array if query.date is null', () => {
				expect( normalizers.statsClicks( {}, { period: 'day' } ) ).toEqual( [] );
			} );

			test( 'should return an a properly parsed data array', () => {
				expect(
					normalizers.statsClicks(
						{
							date: '2017-01-12',
							days: {
								'2017-01-12': {
									clicks: [
										{
											icon:
												'https://secure.gravatar.com/blavatar/94ea57385f5018d2b84169cab22d3b33?s=48',
											name: 'wordpress.com/support',
											url: null,
											views: 45,
											children: [
												{
													name: 'wordpress.com/support',
													url: 'https://wordpress.com/support/',
													views: 5,
												},
											],
										},
										{
											children: null,
											icon:
												'https://secure.gravatar.com/blavatar/3dbcb399a9112e3bb46f706b01c80062?s=48',
											name: 'en.forums.wordpress.com',
											url: 'https://en.forums.wordpress.com/',
											views: 6,
										},
									],
								},
							},
						},
						{
							period: 'day',
							date: '2017-01-12',
						}
					)
				).toEqual( [
					{
						children: [
							{
								children: null,
								label: 'wordpress.com/support',
								labelIcon: 'external',
								link: 'https://wordpress.com/support/',
								value: 5,
							},
						],
						icon: 'https://secure.gravatar.com/blavatar/94ea57385f5018d2b84169cab22d3b33?s=48',
						label: 'wordpress.com/support',
						labelIcon: null,
						link: null,
						value: 45,
					},
					{
						children: null,
						icon: 'https://secure.gravatar.com/blavatar/3dbcb399a9112e3bb46f706b01c80062?s=48',
						label: 'en.forums.wordpress.com',
						labelIcon: 'external',
						link: 'https://en.forums.wordpress.com/',
						value: 6,
					},
				] );
			} );

			test( 'should return an a properly parsed summary data array', () => {
				expect(
					normalizers.statsClicks(
						{
							date: '2017-01-12',
							summary: {
								clicks: [
									{
										icon:
											'https://secure.gravatar.com/blavatar/94ea57385f5018d2b84169cab22d3b33?s=48',
										name: 'wordpress.com/support',
										url: null,
										views: 50,
										children: [
											{
												name: 'wordpress.com/support',
												url: 'https://wordpress.com/support/',
												views: 50,
											},
										],
									},
									{
										children: null,
										icon:
											'https://secure.gravatar.com/blavatar/3dbcb399a9112e3bb46f706b01c80062?s=48',
										name: 'en.forums.wordpress.com',
										url: 'https://en.forums.wordpress.com/',
										views: 10,
									},
								],
							},
						},
						{
							period: 'day',
							date: '2017-01-12',
							summarize: 1,
						}
					)
				).toEqual( [
					{
						children: [
							{
								children: null,
								label: 'wordpress.com/support',
								labelIcon: 'external',
								link: 'https://wordpress.com/support/',
								value: 50,
							},
						],
						icon: 'https://secure.gravatar.com/blavatar/94ea57385f5018d2b84169cab22d3b33?s=48',
						label: 'wordpress.com/support',
						labelIcon: null,
						link: null,
						value: 50,
					},
					{
						children: null,
						icon: 'https://secure.gravatar.com/blavatar/3dbcb399a9112e3bb46f706b01c80062?s=48',
						label: 'en.forums.wordpress.com',
						labelIcon: 'external',
						link: 'https://en.forums.wordpress.com/',
						value: 10,
					},
				] );
			} );
		} );

		describe( 'statsReferrers()', () => {
			test( 'should return an empty array if not data is passed', () => {
				expect( normalizers.statsReferrers() ).toEqual( [] );
			} );

			test( 'should return an empty array if query.period is null', () => {
				expect( normalizers.statsReferrers( {}, { date: '2016-12-25' } ) ).toEqual( [] );
			} );

			test( 'should return an empty array if query.date is null', () => {
				expect( normalizers.statsReferrers( {}, { period: 'day' } ) ).toEqual( [] );
			} );

			test( 'should return an a properly parsed summary data array', () => {
				expect(
					normalizers.statsReferrers(
						{
							date: '2017-01-12',
							summary: {
								groups: [
									{
										group: 'WordPress.com Reader',
										name: 'WordPress.com Reader',
										url: 'https://wordpress.com',
										icon:
											'https://secure.gravatar.com/blavatar/236c008da9dc0edb4b3464ecebb3fc1d?s=48',
										results: {
											views: 500,
										},
										total: 500,
									},
									{
										group: 'wordpress.com/support',
										icon:
											'https://secure.gravatar.com/blavatar/94ea57385f5018d2b84169cab22d3b33?s=48',
										name: 'wordpress.com/support',
										results: [
											{ name: 'homepage', url: 'https://wordpress.com/support/', views: 200 },
											{ name: 'start', url: 'https://wordpress.com/support/start/', views: 100 },
										],
										total: 300,
									},
								],
							},
						},
						{
							period: 'day',
							date: '2017-01-12',
							domain: 'en.blog.wordpress.com',
							summarize: 1,
						},
						100
					)
				).toEqual( [
					{
						actionMenu: 0,
						actions: [],
						children: undefined,
						icon: 'https://secure.gravatar.com/blavatar/236c008da9dc0edb4b3464ecebb3fc1d?s=48',
						label: 'WordPress.com Reader',
						labelIcon: 'external',
						link: 'https://wordpress.com',
						value: 500,
					},
					{
						actionMenu: 1,
						actions: [
							{
								data: {
									domain: 'wordpress.com/support',
									siteID: 100,
								},
								type: 'spam',
							},
						],
						children: [
							{
								children: undefined,
								label: 'homepage',
								labelIcon: 'external',
								link: 'https://wordpress.com/support/',
								value: 200,
							},
							{
								children: undefined,
								label: 'start',
								labelIcon: 'external',
								link: 'https://wordpress.com/support/start/',
								value: 100,
							},
						],
						icon: 'https://secure.gravatar.com/blavatar/94ea57385f5018d2b84169cab22d3b33?s=48',
						label: 'wordpress.com/support',
						labelIcon: null,
						link: undefined,
						value: 300,
					},
				] );
			} );

			test( 'should return an a properly parsed data array', () => {
				expect(
					normalizers.statsReferrers(
						{
							date: '2017-01-12',
							days: {
								'2017-01-12': {
									groups: [
										{
											group: 'WordPress.com Reader',
											name: 'WordPress.com Reader',
											url: 'https://wordpress.com',
											icon:
												'https://secure.gravatar.com/blavatar/236c008da9dc0edb4b3464ecebb3fc1d?s=48',
											results: {
												views: 407,
											},
											total: 407,
										},
										{
											group: 'wordpress.com/support',
											icon:
												'https://secure.gravatar.com/blavatar/94ea57385f5018d2b84169cab22d3b33?s=48',
											name: 'wordpress.com/support',
											results: [
												{ name: 'homepage', url: 'https://wordpress.com/support/', views: 42 },
												{
													name: 'start',
													url: 'https://wordpress.com/support/start/',
													views: 10,
												},
											],
											total: 207,
										},
									],
								},
							},
						},
						{
							period: 'day',
							date: '2017-01-12',
							domain: 'en.blog.wordpress.com',
						},
						100
					)
				).toEqual( [
					{
						actionMenu: 0,
						actions: [],
						children: undefined,
						icon: 'https://secure.gravatar.com/blavatar/236c008da9dc0edb4b3464ecebb3fc1d?s=48',
						label: 'WordPress.com Reader',
						labelIcon: 'external',
						link: 'https://wordpress.com',
						value: 407,
					},
					{
						actionMenu: 1,
						actions: [
							{
								data: {
									domain: 'wordpress.com/support',
									siteID: 100,
								},
								type: 'spam',
							},
						],
						children: [
							{
								children: undefined,
								label: 'homepage',
								labelIcon: 'external',
								link: 'https://wordpress.com/support/',
								value: 42,
							},
							{
								children: undefined,
								label: 'start',
								labelIcon: 'external',
								link: 'https://wordpress.com/support/start/',
								value: 10,
							},
						],
						icon: 'https://secure.gravatar.com/blavatar/94ea57385f5018d2b84169cab22d3b33?s=48',
						label: 'wordpress.com/support',
						labelIcon: null,
						link: undefined,
						value: 207,
					},
				] );
			} );
		} );

		describe( 'statsSearchTerms()', () => {
			test( 'should return an empty array if not data is passed', () => {
				expect( normalizers.statsSearchTerms() ).toEqual( [] );
			} );

			test( 'should return an empty array if query.period is null', () => {
				expect( normalizers.statsSearchTerms( {}, { date: '2016-12-25' } ) ).toEqual( [] );
			} );

			test( 'should return an empty array if query.date is null', () => {
				expect( normalizers.statsSearchTerms( {}, { period: 'day' } ) ).toEqual( [] );
			} );

			test( 'should return an a properly parsed data array', () => {
				expect(
					normalizers.statsSearchTerms(
						{
							date: '2017-01-12',
							days: {
								'2017-01-12': {
									encrypted_search_terms: 221,
									search_terms: [
										{
											term: 'chicken',
											views: 3,
										},
										{
											term: 'ribs',
											views: 10,
										},
									],
								},
							},
						},
						{
							period: 'day',
							date: '2017-01-12',
						}
					)
				).toEqual( [
					{
						className: 'user-selectable',
						label: 'chicken',
						value: 3,
					},
					{
						className: 'user-selectable',
						label: 'ribs',
						value: 10,
					},
					{
						label: 'Unknown Search Terms',
						labelIcon: 'external',
						link: 'http://wordpress.com/support/stats/#search-engine-terms',
						value: 221,
					},
				] );
			} );

			test( 'should return an a properly parsed summarized data array', () => {
				expect(
					normalizers.statsSearchTerms(
						{
							date: '2017-01-12',
							summary: {
								encrypted_search_terms: 400,
								search_terms: [
									{
										term: 'chicken',
										views: 200,
									},
									{
										term: 'ribs',
										views: 100,
									},
								],
							},
						},
						{
							period: 'day',
							date: '2017-01-12',
							summarize: 1,
							num: 90,
						}
					)
				).toEqual( [
					{
						className: 'user-selectable',
						label: 'chicken',
						value: 200,
					},
					{
						className: 'user-selectable',
						label: 'ribs',
						value: 100,
					},
					{
						label: 'Unknown Search Terms',
						labelIcon: 'external',
						link: 'http://wordpress.com/support/stats/#search-engine-terms',
						value: 400,
					},
				] );
			} );
		} );

		describe( 'statsVisits()', () => {
			test( 'should return an empty array if not data is passed', () => {
				expect( normalizers.statsVisits() ).toEqual( [] );
			} );

			test( 'should return an empty array if the payload no data attribute', () => {
				expect( normalizers.statsVisits( { bad: [] } ) ).toEqual( [] );
			} );

			test( 'should return an a properly parsed data array', () => {
				expect(
					normalizers.statsVisits( {
						fields: [ 'period', 'views', 'visitors' ],
						data: [
							[ '2016-12-22', 0, 0 ],
							[ '2016-12-23', 10, 6 ],
						],
						unit: 'week',
					} )
				).toEqual( [
					{
						classNames: [],
						comments: null,
						labelWeek: 'Dec 22',
						likes: null,
						period: '2016-12-22',
						posts: null,
						views: 0,
						visitors: 0,
						visits: null,
					},
					{
						classNames: [],
						comments: null,
						labelWeek: 'Dec 23',
						likes: null,
						period: '2016-12-23',
						posts: null,
						views: 10,
						visitors: 6,
						visits: null,
					},
				] );
			} );

			test( 'should parse the weekends properly', () => {
				expect(
					normalizers.statsVisits( {
						fields: [ 'period', 'views', 'visitors' ],
						data: [
							[ '2016W11W07', 0, 0 ],
							[ '2016W10W31', 10, 6 ],
						],
						unit: 'day',
					} )
				).toEqual( [
					{
						classNames: [],
						comments: null,
						labelDay: 'Nov 7',
						likes: null,
						period: '2016-11-07',
						posts: null,
						views: 0,
						visitors: 0,
						visits: null,
					},
					{
						classNames: [],
						comments: null,
						labelDay: 'Oct 31',
						likes: null,
						period: '2016-10-31',
						posts: null,
						views: 10,
						visitors: 6,
						visits: null,
					},
				] );
			} );
		} );

		describe( 'statsFileDownloads()', () => {
			test( 'should return an empty array if data is null', () => {
				expect( normalizers.statsFileDownloads() ).toEqual( [] );
			} );

			test( 'should return an empty array if query.period is null', () => {
				expect( normalizers.statsFileDownloads( {}, { date: '2016-12-25' } ) ).toEqual( [] );
			} );

			test( 'should return an empty array if query.date is null', () => {
				expect( normalizers.statsFileDownloads( {}, { period: 'day' } ) ).toEqual( [] );
			} );

			test( 'should properly parse day period response', () => {
				expect(
					normalizers.statsFileDownloads(
						{
							date: '2017-01-12',
							days: {
								'2017-01-12': {
									files: [
										{
											filename: 'awesome.mov',
											relative_url: '/2019/01/awesome.mov',
											downloads: 3939,
										},
									],
								},
							},
						},
						{
							period: 'day',
							date: '2017-01-12',
						},
						10,
						{
							slug: 'en.blog.wordpress.com',
						}
					)
				).toMatchObject( [
					{
						value: 3939,
						label: '/2019/01/awesome.mov',
						shortLabel: 'awesome.mov',
						labelIcon: 'external',
					},
				] );
			} );
		} );

		describe( 'parseStoreStatsReferrers', () => {
			const validData = {
				data: [
					{
						date: '2018-04-10',
						data: [
							[ 'green', 4 ],
							[ 'red', 8 ],
						],
					},
					{
						date: '2018-04-09',
						data: [
							[ 'orange', 12 ],
							[ 'blue', 16 ],
						],
					},
				],
				fields: [ 'color', 'age' ],
			};

			test( 'should return empty array for malformed payload', () => {
				const noPayload = parseStoreStatsReferrers( undefined );
				const noData = parseStoreStatsReferrers( {} );
				const dataNotArray = parseStoreStatsReferrers( { data: {} } );

				expect( noPayload ).toEqual( [] );
				expect( noData ).toEqual( [] );
				expect( dataNotArray ).toEqual( [] );
			} );

			test( 'should an array of objects with all fields', () => {
				const parsedData = parseStoreStatsReferrers( validData );

				expect( parsedData ).toHaveLength( validData.data.length );

				const { fields } = validData;
				const firstRecord = parsedData[ 0 ];

				// Make sure all fields are present
				firstRecord.data.forEach( ( d ) => {
					expect( d[ fields[ 0 ] ] ).toBeDefined();
					expect( d[ fields[ 1 ] ] ).toBeDefined();
				} );

				// Make sure values are correctly lined up
				firstRecord.data.forEach( ( d, idx ) => {
					expect( d.color ).toBe( validData.data[ 0 ].data[ idx ][ 0 ] );
					expect( d.age ).toBe( validData.data[ 0 ].data[ idx ][ 1 ] );
				} );

				expect( firstRecord ).toHaveProperty( 'date', '2018-04-10' );
			} );
		} );
	} );

	describe( 'getChartLabels', () => {
		test( 'should return empty object on missing unit parameter', () => {
			expect( getChartLabels( undefined, moment(), moment() ) ).toEqual( {} );
		} );

		test( 'should return empty object on missing date parameter', () => {
			expect( getChartLabels( 'day', undefined, moment() ) ).toEqual( {} );
		} );

		test( 'should return empty object on missing localizedDate parameter', () => {
			expect( getChartLabels( 'day', moment(), undefined ) ).toEqual( {} );
		} );

		test( 'should return a correct property label', () => {
			const label = getChartLabels( 'day', moment(), moment() );
			expect( Object.keys( label )[ 0 ] ).toBe( 'labelDay' );
		} );

		test( 'should return an "is-weekend" className for a weekend date', () => {
			const sunday = moment( '2018-04-08' );
			expect( getChartLabels( 'day', sunday, sunday ) ).toHaveProperty(
				'classNames.0',
				'is-weekend'
			);
		} );

		test( 'should not return an "is-weekend" className a weekday', () => {
			const monday = moment( '2018-04-09' );
			expect( getChartLabels( 'day', monday, monday ) ).toHaveProperty( 'classNames', [] );
		} );

		test( 'should return a correctly formatted date', () => {
			const april9 = moment( '2018-04-09' );
			expect( getChartLabels( 'day', april9, april9.locale( 'en' ) ) ).toHaveProperty(
				'labelDay',
				'Apr 9'
			);
			expect( getChartLabels( 'week', april9, april9.locale( 'en' ) ) ).toHaveProperty(
				'labelWeek',
				'Apr 9'
			);
			expect( getChartLabels( 'month', april9, april9.locale( 'en' ) ) ).toHaveProperty(
				'labelMonth',
				'Apr'
			);
			expect( getChartLabels( 'year', april9, april9.locale( 'en' ) ) ).toHaveProperty(
				'labelYear',
				'2018'
			);
		} );

		test( 'should return a correctly formatted localized date', () => {
			const april9 = moment( '2018-04-09' );
			expect( getChartLabels( 'day', april9, april9.locale( 'fr' ) ) ).toHaveProperty(
				'labelDay',
				'avr. 9'
			);
		} );
	} );
} );

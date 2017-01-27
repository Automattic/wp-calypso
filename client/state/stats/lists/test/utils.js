/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getSerializedStatsQuery,
	normalizers,
	rangeOfPeriod,
	buildExportArray,
} from '../utils';

describe( 'utils', () => {
	describe( 'buildExportArray()', () => {
		it( 'should an empty array if data not supplied', () => {
			const data = buildExportArray( {} );

			expect( data ).to.eql( [] );
		} );

		it( 'should parse simple object to csv', () => {
			const data = buildExportArray( {
				label: 'Chicken',
				value: 10
			} );

			expect( data ).to.eql( [ [ '"Chicken"', 10 ] ] );
		} );

		it( 'should escape simple object to csv', () => {
			const data = buildExportArray( {
				label: 'Chicken and "Ribs"',
				value: 10
			} );

			expect( data ).to.eql( [ [ '"Chicken and ""Ribs""', 10 ] ] );
		} );

		it( 'should recurse child data', () => {
			const data = buildExportArray( {
				label: 'BBQ',
				value: 10,
				children: [ {
					label: 'Chicken',
					value: 5
				}, {
					label: 'Ribs',
					value: 2,
					children: [ {
						label: 'Babyback',
						value: 1
					} ]
				} ]
			} );

			expect( data ).to.eql( [
				[ '"BBQ"', 10 ],
				[ '"BBQ > Chicken"', 5 ],
				[ '"BBQ > Ribs"', 2 ],
				[ '"BBQ > Ribs > Babyback"', 1 ]
			] );
		} );
	} );

	describe( 'rangeOfPeriod()', () => {
		it( 'should return a period object for day', () => {
			const period = rangeOfPeriod( 'day', '2016-06-01' );

			expect( period ).to.eql( {
				startOf: '2016-06-01',
				endOf: '2016-06-01'
			} );
		} );

		it( 'should return a period object for week', () => {
			const period = rangeOfPeriod( 'week', '2016-06-01' );

			expect( period ).to.eql( {
				startOf: '2016-05-30',
				endOf: '2016-06-05'
			} );
		} );

		it( 'should return a period object for month', () => {
			const period = rangeOfPeriod( 'month', '2016-06-05' );

			expect( period ).to.eql( {
				startOf: '2016-06-01',
				endOf: '2016-06-30'
			} );
		} );

		it( 'should return a period object for year', () => {
			const period = rangeOfPeriod( 'year', '2016-06-05' );

			expect( period ).to.eql( {
				startOf: '2016-01-01',
				endOf: '2016-12-31'
			} );
		} );
	} );

	describe( 'getSerializedStatsQuery()', () => {
		it( 'should return a JSON string of a query', () => {
			const serializedQuery = getSerializedStatsQuery( {
				startDate: '2016-06-01',
				endDate: '2016-07-01'
			} );

			expect( serializedQuery ).to.equal( '[["endDate","2016-07-01"],["startDate","2016-06-01"]]' );
		} );

		it( 'should return the same JSON string of a query regardless of query object order', () => {
			const serializedQuery = getSerializedStatsQuery( {
				startDate: '2016-06-01',
				endDate: '2016-07-01'
			} );

			const serializedQueryTwo = getSerializedStatsQuery( {
				endDate: '2016-07-01',
				startDate: '2016-06-01'
			} );

			expect( serializedQuery ).to.eql( serializedQueryTwo );
		} );
	} );

	describe( 'normalizers', () => {
		describe( 'stats()', () => {
			it( 'should return null if no data is passed', () => {
				const parsedData = normalizers.stats();

				expect( parsedData ).to.be.null;
			} );

			it( 'should return null if data object is missing stats attribute', () => {
				const parsedData = normalizers.stats( { foo: false } );

				expect( parsedData ).to.be.null;
			} );

			it( 'should return parsed camelCased stats object', () => {
				const parsedData = normalizers.stats( { stats: {
					posts: 2,
					views: 300,
					visitors: 400,
					views_best_day: '2010-09-29',
					views_best_day_total: 100
				} } );

				expect( parsedData ).to.eql( {
					posts: 2,
					views: 300,
					visitors: 400,
					viewsBestDay: '2010-09-29',
					viewsBestDayTotal: 100
				} );
			} );
		} );

		describe( 'statsFollowers()', () => {
			it( 'should return null if no data is provided', () => {
				const parsedData = normalizers.statsFollowers();
				expect( parsedData ).to.be.null;
			} );

			it( 'should properly parse followers response', () => {
				const parsedData = normalizers.statsFollowers( {
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
							date_subscribed: '2015-04-07T18:53:05+00:00'
						}
					]
				} );

				expect( parsedData ).to.eql( {
					total_email: 5,
					total_wpcom: 120,
					subscribers: [ {
						label: 'wapuu@wordpress.org',
						iconClassName: 'avatar-user',
						icon: null,
						link: null,
						value: {
							type: 'relative-date',
							value: '2015-04-07T18:53:05+00:00'
						},
						actions: [ {
							type: 'follow',
							data: false
						} ]
					} ]
				} );
			} );
		} );

		describe( 'statsCommentFollowers()', () => {
			it( 'should return null if no data is provided', () => {
				const parsedData = normalizers.statsCommentFollowers();
				expect( parsedData ).to.be.null;
			} );

			it( 'should properly parse followers response', () => {
				const parsedData = normalizers.statsCommentFollowers( {
					page: 1,
					pages: 1,
					total: 1,
					posts: [
						{
							id: 0,
							followers: 20
						},
						{
							id: 1111,
							title: 'My title',
							followers: 10,
							url: 'https://en.blog.wordpress.com/chicken'
						}
					]
				} );

				expect( parsedData ).to.eql( {
					page: 1,
					pages: 1,
					total: 1,
					posts: [
						{
							label: 'All Posts',
							value: 20
						},
						{
							label: 'My title',
							labelIcon: 'external',
							link: 'https://en.blog.wordpress.com/chicken',
							value: 10
						}
					]
				} );
			} );
		} );

		describe( 'statsTopPosts()', () => {
			it( 'should return an empty array if data is null', () => {
				const parsedData = normalizers.statsTopPosts();

				expect( parsedData ).to.eql( [] );
			} );

			it( 'should return an empty array if query.period is null', () => {
				const parsedData = normalizers.statsTopPosts( {}, { date: '2016-12-25' } );

				expect( parsedData ).to.eql( [] );
			} );

			it( 'should return an empty array if query.date is null', () => {
				const parsedData = normalizers.statsTopPosts( {}, { period: 'day' } );

				expect( parsedData ).to.eql( [] );
			} );

			it( 'should properly parse day period response', () => {
				const parsedData = normalizers.statsTopPosts( {
					date: '2017-01-12',
					days: {
						'2017-01-12': {
							postviews: [ {
								id: 0,
								href: 'http://en.blog.wordpress.com',
								date: null,
								title: 'Home Page / Archives',
								type: 'homepage',
								views: 3939
							} ],
							total_views: 0
						}
					}
				}, {
					period: 'day',
					date: '2017-01-12'
				}, 10, {
					slug: 'en.blog.wordpress.com'
				} );

				expect( parsedData ).to.eql( [ {
					label: 'Home Page / Archives',
					value: 3939,
					page: '/stats/post/0/en.blog.wordpress.com',
					actions: [ {
						type: 'link',
						data: 'http://en.blog.wordpress.com'
					} ],
					labelIcon: null,
					children: null,
					className: null
				} ] );
			} );

			it( 'should properly add published className for posts published in period', () => {
				const parsedData = normalizers.statsTopPosts( {
					date: '2017-01-12',
					days: {
						'2017-01-12': {
							postviews: [ {
								id: 777,
								href: 'http://en.blog.wordpress.com/2017/01/12/wordpress-com-lightroom/',
								date: '2017-01-12 15:55:34',
								title: 'New WordPress.com for Lightroom Makes Publishing Your Photos Easy',
								type: 'post',
								views: 774
							} ],
							total_views: 0
						}
					}
				}, {
					period: 'day',
					date: '2017-01-12'
				}, 10, {
					slug: 'en.blog.wordpress.com'
				} );

				expect( parsedData ).to.eql( [ {
					label: 'New WordPress.com for Lightroom Makes Publishing Your Photos Easy',
					value: 774,
					page: '/stats/post/777/en.blog.wordpress.com',
					actions: [ {
						type: 'link',
						data: 'http://en.blog.wordpress.com/2017/01/12/wordpress-com-lightroom/'
					} ],
					labelIcon: null,
					children: null,
					className: 'published'
				}
				] );
			} );

			it( 'should properly parse summarized response', () => {
				const parsedData = normalizers.statsTopPosts( {
					date: '2017-01-12',
					summary: {
						postviews: [ {
							id: 0,
							href: 'http://en.blog.wordpress.com',
							date: null,
							title: 'Home Page / Archives',
							type: 'homepage',
							views: 3939
						} ],
						total_views: 0
					}
				}, {
					period: 'day',
					date: '2017-01-12',
					summarize: 1
				}, 10, {
					slug: 'en.blog.wordpress.com'
				} );

				expect( parsedData ).to.eql( [ {
					label: 'Home Page / Archives',
					value: 3939,
					page: '/stats/post/0/en.blog.wordpress.com',
					actions: [ {
						type: 'link',
						data: 'http://en.blog.wordpress.com'
					} ],
					labelIcon: null,
					children: null,
					className: null
				} ] );
			} );
		} );

		describe( 'statsCountryViews()', () => {
			it( 'should return null if data is null', () => {
				const parsedData = normalizers.statsCountryViews();

				expect( parsedData ).to.be.null;
			} );

			it( 'should return null if query.period is null', () => {
				const parsedData = normalizers.statsCountryViews( {}, { date: '2016-12-25' } );

				expect( parsedData ).to.be.null;
			} );

			it( 'should return null if query.date is null', () => {
				const parsedData = normalizers.statsCountryViews( {}, { period: 'day' } );

				expect( parsedData ).to.be.null;
			} );

			it( 'should properly parse day period response', () => {
				const parsedData = normalizers.statsCountryViews( {
					date: '2015-12-25',
					days: {
						'2015-12-25': {
							views: [ {
								country_code: 'US',
								views: 1
							} ],
							other_views: 0,
							total_views: 1
						}
					},
					'country-info': {
						US: {
							flag_icon: 'https://secure.gravatar.com/blavatar/5a83891a81b057fed56930a6aaaf7b3c?s=48',
							flat_flag_icon: 'https://secure.gravatar.com/blavatar/9f4faa5ad0c723474f7a6d810172447c?s=48',
							country_full: 'United States',
							map_region: '021'
						}
					}
				}, {
					period: 'day',
					date: '2015-12-25'
				} );

				expect( parsedData ).to.eql( [
					{
						label: 'United States',
						value: 1,
						region: '021',
						icon: 'https://secure.gravatar.com/blavatar/9f4faa5ad0c723474f7a6d810172447c?s=48'
					}
				] );
			} );

			it( 'should properly parse week period response', () => {
				const parsedData = normalizers.statsCountryViews( {
					date: '2015-12-25',
					days: {
						'2015-12-21': {
							views: [ {
								country_code: 'US',
								views: 10
							} ],
							other_views: 0,
							total_views: 10
						}
					},
					'country-info': {
						US: {
							flag_icon: 'https://secure.gravatar.com/blavatar/5a83891a81b057fed56930a6aaaf7b3c?s=48',
							flat_flag_icon: 'https://secure.gravatar.com/blavatar/9f4faa5ad0c723474f7a6d810172447c?s=48',
							country_full: 'United States',
							map_region: '021'
						}
					}
				}, {
					period: 'week',
					date: '2015-12-25'
				} );

				expect( parsedData ).to.eql( [
					{
						label: 'United States',
						value: 10,
						region: '021',
						icon: 'https://secure.gravatar.com/blavatar/9f4faa5ad0c723474f7a6d810172447c?s=48'
					}
				] );
			} );

			it( 'should properly parse summarized response', () => {
				const parsedData = normalizers.statsCountryViews( {
					date: '2015-12-25',
					summary: {
						views: [ {
							country_code: 'US',
							views: 100
						} ],
						other_views: 0,
						total_views: 100
					},
					'country-info': {
						US: {
							flag_icon: 'https://secure.gravatar.com/blavatar/5a83891a81b057fed56930a6aaaf7b3c?s=48',
							flat_flag_icon: 'https://secure.gravatar.com/blavatar/9f4faa5ad0c723474f7a6d810172447c?s=48',
							country_full: 'United States',
							map_region: '021'
						}
					}
				}, {
					period: 'day',
					summarize: 1,
					date: '2015-12-25'
				} );

				expect( parsedData ).to.eql( [
					{
						label: 'United States',
						value: 100,
						region: '021',
						icon: 'https://secure.gravatar.com/blavatar/9f4faa5ad0c723474f7a6d810172447c?s=48'
					}
				] );
			} );

			it( 'should properly parse month period response', () => {
				const parsedData = normalizers.statsCountryViews( {
					date: '2015-12-25',
					days: {
						'2015-12-01': {
							views: [ {
								country_code: 'US',
								views: 100
							} ],
							other_views: 0,
							total_views: 100
						}
					},
					'country-info': {
						US: {
							flag_icon: 'https://secure.gravatar.com/blavatar/5a83891a81b057fed56930a6aaaf7b3c?s=48',
							flat_flag_icon: 'https://secure.gravatar.com/blavatar/9f4faa5ad0c723474f7a6d810172447c?s=48',
							country_full: 'United States',
							map_region: '021'
						}
					}
				}, {
					period: 'month',
					date: '2015-12-25'
				} );

				expect( parsedData ).to.eql( [
					{
						label: 'United States',
						value: 100,
						region: '021',
						icon: 'https://secure.gravatar.com/blavatar/9f4faa5ad0c723474f7a6d810172447c?s=48'
					}
				] );
			} );

			it( 'should ignore missing grey flag icons', () => {
				const parsedData = normalizers.statsCountryViews( {
					date: '2015-12-25',
					days: {
						'2015-12-01': {
							views: [ {
								country_code: 'US',
								views: 100
							} ],
							other_views: 0,
							total_views: 100
						}
					},
					'country-info': {
						US: {
							flag_icon: 'https://secure.gravatar.com/blavatar/5a83891a81b057fed56930a6aaaf7b3c?s=48',
							flat_flag_icon: 'https://s-ssl.wordpress.com/i/stats/square-grey.png',
							country_full: 'United States',
							map_region: '021'
						}
					}
				}, {
					period: 'month',
					date: '2015-12-25'
				} );

				expect( parsedData ).to.eql( [
					{
						label: 'United States',
						value: 100,
						region: '021',
						icon: null
					}
				] );
			} );

			it( 'should sanitize ’ from country names', () => {
				const parsedData = normalizers.statsCountryViews( {
					date: '2015-12-25',
					days: {
						'2015-12-01': {
							views: [ {
								country_code: 'US',
								views: 100
							} ],
							other_views: 0,
							total_views: 100
						}
					},
					'country-info': {
						US: {
							flag_icon: 'https://secure.gravatar.com/blavatar/5a83891a81b057fed56930a6aaaf7b3c?s=48',
							flat_flag_icon: 'https://s-ssl.wordpress.com/i/stats/square-grey.png',
							country_full: 'US’A',
							map_region: '021'
						}
					}
				}, {
					period: 'month',
					date: '2015-12-25'
				} );

				expect( parsedData ).to.eql( [
					{
						label: 'US\'A',
						value: 100,
						region: '021',
						icon: null
					}
				] );
			} );

			it( 'should ignore country_codes with no country-info', () => {
				const parsedData = normalizers.statsCountryViews( {
					date: '2015-12-25',
					days: {
						'2015-12-01': {
							views: [ {
								country_code: 'US',
								views: 100
							}, {
								country_code: 'DERP',
								views: 100
							} ],
							other_views: 0,
							total_views: 100
						}
					},
					'country-info': {
						US: {
							flag_icon: 'https://secure.gravatar.com/blavatar/5a83891a81b057fed56930a6aaaf7b3c?s=48',
							flat_flag_icon: 'https://secure.gravatar.com/blavatar/9f4faa5ad0c723474f7a6d810172447c?s=48',
							country_full: 'United States',
							map_region: '021'
						}
					}
				}, {
					period: 'month',
					date: '2015-12-25'
				} );

				expect( parsedData ).to.eql( [
					{
						label: 'United States',
						value: 100,
						region: '021',
						icon: 'https://secure.gravatar.com/blavatar/9f4faa5ad0c723474f7a6d810172447c?s=48'
					}
				] );
			} );
		} );

		describe( 'statsInsights()', () => {
			it( 'should return an empty object if no data is passed', () => {
				const stats = normalizers.statsInsights();

				expect( stats ).to.eql( {} );
			} );

			it( 'should return null if data.highest_day_of_week is not numeric', () => {
				const stats = normalizers.statsInsights( { highest_day_of_week: false } );

				expect( stats ).to.eql( {} );
			} );

			it( 'should return properly formatted data if matching data exists', () => {
				const stats = normalizers.statsInsights( {
					highest_hour: 11,
					highest_day_percent: 10,
					highest_day_of_week: 6,
					highest_hour_percent: 5
				} );

				expect( stats ).to.eql( {
					day: 'Sunday',
					hour: '11:00 AM',
					hourPercent: 5,
					percent: 10
				} );
			} );
		} );

		describe( 'statsPublicize()', () => {
			it( 'should return an empty array if not data is passed', () => {
				const parsedData = normalizers.statsPublicize();

				expect( parsedData ).to.eql( [] );
			} );

			it( 'should return an empty array if not data has no services attribute', () => {
				const parsedData = normalizers.statsPublicize( { bad: [] } );

				expect( parsedData ).to.eql( [] );
			} );

			it( 'should return an a properly parsed services array', () => {
				const parsedData = normalizers.statsPublicize( {
					services: [ {
						service: 'twitter',
						followers: 528
					}, {
						service: 'facebook',
						followers: 282
					} ]
				} );

				expect( parsedData ).to.eql( [
					{
						label: 'Twitter',
						icon: 'https://secure.gravatar.com/blavatar/7905d1c4e12c54933a44d19fcd5f9356?s=48',
						value: 528
					}, {
						label: 'Facebook',
						icon: 'https://secure.gravatar.com/blavatar/2343ec78a04c6ea9d80806345d31fd78?s=48',
						value: 282
					}
				] );
			} );
		} );

		describe( 'statsVideoPlays()', () => {
			it( 'should return an empty array if not data is passed', () => {
				const parsedData = normalizers.statsVideoPlays();

				expect( parsedData ).to.eql( [] );
			} );

			it( 'should return an empty array if query.period is null', () => {
				const parsedData = normalizers.statsVideoPlays( {}, { date: '2016-12-25' } );

				expect( parsedData ).to.eql( [] );
			} );

			it( 'should return an empty array if query.date is null', () => {
				const parsedData = normalizers.statsVideoPlays( {}, { period: 'day' } );

				expect( parsedData ).to.eql( [] );
			} );

			it( 'should properly parse day period response', () => {
				const parsedData = normalizers.statsVideoPlays( {
					date: '2017-01-12',
					days: {
						'2017-01-12': {
							plays: [
								{
									plays: 32,
									post_id: 111111111,
									title: 'Press This!',
									url: 'http://en.blog.wordpress.com/wp-admin/media.php?action=edit&attachment_id=111111111'
								}
							]
						}
					}
				}, {
					period: 'day',
					date: '2017-01-12'
				}, 10, {
					slug: 'en.blog.wordpress.com'
				} );

				expect( parsedData ).to.eql( [
					{
						actions: [ {
							data: 'http://en.blog.wordpress.com/wp-admin/media.php?action=edit&attachment_id=111111111',
							type: 'link'
						} ],
						label: 'Press This!',
						page: '/stats/day/videodetails/en.blog.wordpress.com?post=111111111',
						value: 32
					}
				] );
			} );
		} );

		describe( 'statsVideo()', () => {
			it( 'should return an empty array if not data is passed', () => {
				const parsedData = normalizers.statsVideo();

				expect( parsedData ).to.eql( [] );
			} );

			it( 'should return an empty array if not data has no data attribute', () => {
				const parsedData = normalizers.statsVideo( { bad: [] } );

				expect( parsedData ).to.eql( [] );
			} );

			it( 'should return an a properly parsed data array', () => {
				const parsedData = normalizers.statsVideo( {
					data: [
						[ '2016-11-12', 1 ],
						[ '2016-11-13', 0 ]
					]
				} );

				expect( parsedData ).to.eql( [
					{
						period: '2016-11-13',
						value: 0,
					}
				] );
			} );
		} );

		describe( 'statsTopAuthors()', () => {
			it( 'should return an empty array if not data is passed', () => {
				const parsedData = normalizers.statsTopAuthors();

				expect( parsedData ).to.eql( [] );
			} );

			it( 'should return an empty array if query.period is null', () => {
				const parsedData = normalizers.statsTopAuthors( {}, { date: '2016-12-25' } );

				expect( parsedData ).to.eql( [] );
			} );

			it( 'should return an empty array if query.date is null', () => {
				const parsedData = normalizers.statsTopAuthors( {}, { period: 'day' } );

				expect( parsedData ).to.eql( [] );
			} );

			it( 'should return an a properly parsed data array', () => {
				const parsedData = normalizers.statsTopAuthors( {
					date: '2017-01-17',
					days: {
						'2017-01-17': {
							authors: [
								{
									name: 'Timmy Crawford',
									avatar: 'https://0.gravatar.com/avatar/9929daa7594d5afa910a777ccb9e88e4?s=64&size=G',
									posts: [
										{ id: 30, title: 'Chicken', url: 'http://en.blog.wordpress.com/chicken', views: 6 },
										{ id: 32, title: 'Ribs', url: 'http://en.blog.wordpress.com/ribs', views: 10 }
									]
								}
							]
						}
					}
				}, {
					period: 'day',
					date: '2017-01-17',
					domain: 'en.blog.wordpress.com'
				}, 10, {
					slug: 'en.blog.wordpress.com'
				} );

				expect( parsedData ).to.eql( [
					{
						children: [
							{
								actions: [ {
									data: 'http://en.blog.wordpress.com/chicken',
									type: 'link'
								} ],
								children: null,
								label: 'Chicken',
								page: '/stats/post/30/en.blog.wordpress.com',
								value: 6
							},
							{
								actions: [ {
									data: 'http://en.blog.wordpress.com/ribs',
									type: 'link'
								} ],
								children: null,
								label: 'Ribs',
								page: '/stats/post/32/en.blog.wordpress.com',
								value: 10
							},
						],
						className: 'module-content-list-item-large',
						icon: 'https://0.gravatar.com/avatar/9929daa7594d5afa910a777ccb9e88e4?d=mm',
						iconClassName: 'avatar-user',
						label: 'Timmy Crawford',
						value: undefined
					}
				] );
			} );
		} );

		describe( 'statsTags()', () => {
			it( 'should return an empty array if not data is passed', () => {
				const parsedData = normalizers.statsTags();
				expect( parsedData ).to.eql( [] );
			} );

			it( 'should return an empty array if not data has no tags attribute', () => {
				const parsedData = normalizers.statsTags( { bad: [] } );

				expect( parsedData ).to.eql( [] );
			} );

			it( 'should return an a properly parsed data array', () => {
				const parsedData = normalizers.statsTags( {
					date: '2014-10-01',
					tags: [
						{
							tags: [
								{ type: 'category', name: 'Uncategorized', link: 'http://example.wordpress.com/category/uncategorized/' }
							],
							views: 2381
						},
						{
							tags: [
								{ type: 'tag', name: 'supertag-chicken', link: 'http://example.wordpress.com/tag/supertag-chicken/' },
								{ type: 'tag', name: 'supertag-ribs', link: 'http://example.wordpress.com/tag/supertag-ribs/' }
							],
							views: 740
						},
					]
				} );

				expect( parsedData ).to.eql( [
					{
						children: undefined,
						label: [ {
							label: 'Uncategorized',
							labelIcon: 'folder',
							link: 'http://example.wordpress.com/category/uncategorized/'
						} ],
						link: 'http://example.wordpress.com/category/uncategorized/',
						value: 2381
					},
					{
						children: [
							{
								label: 'supertag-chicken',
								labelIcon: 'tag',
								link: 'http://example.wordpress.com/tag/supertag-chicken/',
								children: null,
								value: null
							},
							{
								label: 'supertag-ribs',
								labelIcon: 'tag',
								link: 'http://example.wordpress.com/tag/supertag-ribs/',
								children: null,
								value: null
							}
						],
						label: [
							{
								label: 'supertag-chicken',
								labelIcon: 'tag',
								link: null
							},
							{
								label: 'supertag-ribs',
								labelIcon: 'tag',
								link: null
							}
						],
						link: null,
						value: 740
					}
				] );
			} );
		} );

		describe( 'statsClicks()', () => {
			it( 'should return an empty array if not data is passed', () => {
				const parsedData = normalizers.statsClicks();
				expect( parsedData ).to.eql( [] );
			} );

			it( 'should return an empty array if query.period is null', () => {
				const parsedData = normalizers.statsClicks( {}, { date: '2016-12-25' } );
				expect( parsedData ).to.eql( [] );
			} );

			it( 'should return an empty array if query.date is null', () => {
				const parsedData = normalizers.statsClicks( {}, { period: 'day' } );
				expect( parsedData ).to.eql( [] );
			} );

			it( 'should return an a properly parsed data array', () => {
				const parsedData = normalizers.statsClicks( {
					date: '2017-01-12',
					days: {
						'2017-01-12': {
							clicks: [
								{
									icon: 'https://secure.gravatar.com/blavatar/94ea57385f5018d2b84169cab22d3b33?s=48',
									name: 'en.support.wordpress.com',
									url: null,
									views: 45,
									children: [
										{
											name: 'en.support.wordpress.com',
											url: 'https://en.support.wordpress.com/',
											views: 5
										}
									]
								},
								{
									children: null,
									icon: 'https://secure.gravatar.com/blavatar/3dbcb399a9112e3bb46f706b01c80062?s=48',
									name: 'en.forums.wordpress.com',
									url: 'https://en.forums.wordpress.com/',
									views: 6
								}
							]
						}
					}
				}, {
					period: 'day',
					date: '2017-01-12'
				} );

				expect( parsedData ).to.eql( [
					{
						children: [
							{
								children: null,
								label: 'en.support.wordpress.com',
								labelIcon: 'external',
								link: 'https://en.support.wordpress.com/',
								value: 5
							}
						],
						icon: 'https://secure.gravatar.com/blavatar/94ea57385f5018d2b84169cab22d3b33?s=48',
						label: 'en.support.wordpress.com',
						labelIcon: null,
						link: null,
						value: 45
					},
					{
						children: null,
						icon: 'https://secure.gravatar.com/blavatar/3dbcb399a9112e3bb46f706b01c80062?s=48',
						label: 'en.forums.wordpress.com',
						labelIcon: 'external',
						link: 'https://en.forums.wordpress.com/',
						value: 6
					}
				] );
			} );
		} );

		describe( 'statsReferrers()', () => {
			it( 'should return an empty array if not data is passed', () => {
				const parsedData = normalizers.statsReferrers();
				expect( parsedData ).to.eql( [] );
			} );

			it( 'should return an empty array if query.period is null', () => {
				const parsedData = normalizers.statsReferrers( {}, { date: '2016-12-25' } );
				expect( parsedData ).to.eql( [] );
			} );

			it( 'should return an empty array if query.date is null', () => {
				const parsedData = normalizers.statsReferrers( {}, { period: 'day' } );
				expect( parsedData ).to.eql( [] );
			} );

			it( 'should return an a properly parsed data array', () => {
				const parsedData = normalizers.statsReferrers( {
					date: '2017-01-12',
					days: {
						'2017-01-12': {
							groups: [
								{
									group: 'WordPress.com Reader',
									name: 'WordPress.com Reader',
									url: 'https://wordpress.com',
									icon: 'https://secure.gravatar.com/blavatar/236c008da9dc0edb4b3464ecebb3fc1d?s=48',
									results: {
										views: 407
									},
									total: 407
								},
								{
									group: 'en.support.wordpress.com',
									icon: 'https://secure.gravatar.com/blavatar/94ea57385f5018d2b84169cab22d3b33?s=48',
									name: 'en.support.wordpress.com',
									results: [
										{ name: 'homepage', url: 'https://en.support.wordpress.com/', views: 42 },
										{ name: 'start', url: 'https://en.support.wordpress.com/start/', views: 10 }
									],
									total: 207
								}
							]
						}
					}
				}, {
					period: 'day',
					date: '2017-01-12',
					domain: 'en.blog.wordpress.com'
				},
				100 );

				expect( parsedData ).to.eql( [
					{
						actionMenu: 0,
						actions: [],
						children: undefined,
						icon: 'https://secure.gravatar.com/blavatar/236c008da9dc0edb4b3464ecebb3fc1d?s=48',
						label: 'WordPress.com Reader',
						labelIcon: 'external',
						link: 'https://wordpress.com',
						value: 407
					},
					{
						actionMenu: 1,
						actions: [
							{
								data: {
									domain: 'en.support.wordpress.com',
									siteID: 100
								},
								type: 'spam'
							}
						],
						children: [
							{
								children: undefined,
								label: 'homepage',
								labelIcon: 'external',
								link: 'https://en.support.wordpress.com/',
								value: 42
							},
							{
								children: undefined,
								label: 'start',
								labelIcon: 'external',
								link: 'https://en.support.wordpress.com/start/',
								value: 10
							}
						],
						icon: 'https://secure.gravatar.com/blavatar/94ea57385f5018d2b84169cab22d3b33?s=48',
						label: 'en.support.wordpress.com',
						labelIcon: null,
						link: undefined,
						value: 207
					},
				] );
			} );
		} );

		describe( 'statsSearchTerms()', () => {
			it( 'should return an empty array if not data is passed', () => {
				const parsedData = normalizers.statsSearchTerms();
				expect( parsedData ).to.eql( [] );
			} );

			it( 'should return an empty array if query.period is null', () => {
				const parsedData = normalizers.statsSearchTerms( {}, { date: '2016-12-25' } );
				expect( parsedData ).to.eql( [] );
			} );

			it( 'should return an empty array if query.date is null', () => {
				const parsedData = normalizers.statsSearchTerms( {}, { period: 'day' } );
				expect( parsedData ).to.eql( [] );
			} );

			it( 'should return an a properly parsed data array', () => {
				const parsedData = normalizers.statsSearchTerms( {
					date: '2017-01-12',
					days: {
						'2017-01-12': {
							encrypted_search_terms: 221,
							search_terms: [
								{
									term: 'chicken',
									views: 3
								},
								{
									term: 'ribs',
									views: 10
								}
							]
						}
					}
				}, {
					period: 'day',
					date: '2017-01-12'
				} );

				expect( parsedData ).to.eql( [
					{
						className: 'user-selectable',
						label: 'chicken',
						value: 3
					},
					{
						className: 'user-selectable',
						label: 'ribs',
						value: 10
					},
					{
						label: 'Unknown Search Terms',
						labelIcon: 'external',
						link: 'http://en.support.wordpress.com/stats/#search-engine-terms',
						value: 221
					}
				] );
			} );
		} );

		describe( 'statsVisits()', () => {
			it( 'should return an empty array if not data is passed', () => {
				const parsedData = normalizers.statsVisits();
				expect( parsedData ).to.eql( [] );
			} );

			it( 'should return an empty array if the payload no data attribute', () => {
				const parsedData = normalizers.statsVisits( { bad: [] } );

				expect( parsedData ).to.eql( [] );
			} );

			it( 'should return an a properly parsed data array', () => {
				const parsedData = normalizers.statsVisits( {
					fields: [ 'period', 'views', 'visitors' ],
					data: [
						[ '2016-12-22', 0, 0 ],
						[ '2016-12-23', 10, 6 ]
					]
				} );

				expect( parsedData ).to.eql( [
					{
						classNames: [],
						comments: null,
						labelDay: 'Dec 22',
						labelMonth: 'Dec',
						labelWeek: 'Dec 22',
						labelYear: '2016',
						likes: null,
						period: '2016-12-22',
						posts: null,
						views: 0,
						visitors: 0,
						visits: null
					},
					{
						classNames: [],
						comments: null,
						labelDay: 'Dec 23',
						labelMonth: 'Dec',
						labelWeek: 'Dec 23',
						labelYear: '2016',
						likes: null,
						period: '2016-12-23',
						posts: null,
						views: 10,
						visitors: 6,
						visits: null
					}
				] );
			} );

			it( 'should parse the weekends properly', () => {
				const parsedData = normalizers.statsVisits( {
					fields: [ 'period', 'views', 'visitors' ],
					data: [
						[ '2016W11W07', 0, 0 ],
						[ '2016W10W31', 10, 6 ]
					]
				} );

				expect( parsedData ).to.eql( [
					{
						classNames: [],
						comments: null,
						labelDay: 'Nov 7',
						labelMonth: 'Nov',
						labelWeek: 'Nov 7',
						labelYear: '2016',
						likes: null,
						period: '2016-11-07',
						posts: null,
						views: 0,
						visitors: 0,
						visits: null
					},
					{
						classNames: [],
						comments: null,
						labelDay: 'Oct 31',
						labelMonth: 'Oct',
						labelWeek: 'Oct 31',
						labelYear: '2016',
						likes: null,
						period: '2016-10-31',
						posts: null,
						views: 10,
						visitors: 6,
						visits: null
					}
				] );
			} );
		} );

		describe( 'statsPodcastDownloads()', () => {
			it( 'should return an empty array if data is null', () => {
				const parsedData = normalizers.statsPodcastDownloads();

				expect( parsedData ).to.eql( [] );
			} );

			it( 'should return an empty array if query.period is null', () => {
				const parsedData = normalizers.statsPodcastDownloads( {}, { date: '2016-12-25' } );

				expect( parsedData ).to.eql( [] );
			} );

			it( 'should return an empty array if query.date is null', () => {
				const parsedData = normalizers.statsPodcastDownloads( {}, { period: 'day' } );

				expect( parsedData ).to.eql( [] );
			} );

			it( 'should properly parse day period response', () => {
				const parsedData = normalizers.statsPodcastDownloads( {
					date: '2017-01-12',
					days: {
						'2017-01-12': {
							downloads: [ {
								url: 'http://en.blog.wordpress.com/awesome',
								post_id: 10,
								title: 'My awesome podcast',
								downloads: 3939
							} ]
						}
					}
				}, {
					period: 'day',
					date: '2017-01-12'
				}, 10, {
					slug: 'en.blog.wordpress.com'
				} );

				expect( parsedData ).to.eql( [
					{
						actions: [ {
							data: 'http://en.blog.wordpress.com/awesome',
							type: 'link'
						} ],
						label: 'My awesome podcast',
						page: '/stats/day/podcastdownloads/en.blog.wordpress.com?post=10',
						value: 3939
					}
				] );
			} );
		} );
	} );
} );

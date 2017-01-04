/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getTheme,
	getThemeRequestErrors,
	isRequestingTheme,
	getThemesForQuery,
	getLastThemeQuery,
	isRequestingThemesForQuery,
	getThemesFoundForQuery,
	getThemesLastPageForQuery,
	isThemesLastPageForQuery,
	getThemesForQueryIgnoringPage,
	isRequestingThemesForQueryIgnoringPage,
	getThemeDetailsUrl,
	getThemeSupportUrl,
	getThemeHelpUrl,
	getThemePurchaseUrl,
	getThemeCustomizeUrl,
	getThemeSignupUrl,
	getThemeForumUrl,
	getActiveTheme,
	isRequestingActiveTheme,
	isWporgTheme,
	isThemeActive,
	isActivatingTheme,
	hasActivatedTheme,
	isInstallingTheme,
	isThemePremium,
	isThemePurchased,
} from '../selectors';
import ThemeQueryManager from 'lib/query-manager/theme';

const twentyfifteen = {
	id: 'twentyfifteen',
	name: 'Twenty Fifteen',
	author: 'the WordPress team',
	screenshot: 'https://i1.wp.com/theme.wordpress.com/wp-content/themes/pub/twentyfifteen/screenshot.png',
	stylesheet: 'pub/twentyfifteen',
	demo_uri: 'https://twentyfifteendemo.wordpress.com/',
	author_uri: 'https://wordpress.org/'
};

const twentysixteen = {
	id: 'twentysixteen',
	name: 'Twenty Sixteen',
	author: 'the WordPress team',
	screenshot: 'https://i0.wp.com/theme.wordpress.com/wp-content/themes/pub/twentysixteen/screenshot.png',
	stylesheet: 'pub/twentysixteen',
	demo_uri: 'https://twentysixteendemo.wordpress.com/',
	author_uri: 'https://wordpress.org/'
};

const mood = {
	id: 'mood',
	name: 'Mood',
	author: 'Automattic',
	screenshot: 'mood.jpg',
	price: '$20',
	stylesheet: 'premium/mood',
	demo_uri: 'https://mooddemo.wordpress.com/',
	author_uri: 'https://wordpress.com/themes/'
};

describe( 'themes selectors', () => {
	beforeEach( () => {
		getTheme.memoizedSelector.cache.clear();
		getThemesForQuery.memoizedSelector.cache.clear();
		getThemesForQueryIgnoringPage.memoizedSelector.cache.clear();
		isRequestingThemesForQueryIgnoringPage.memoizedSelector.cache.clear();
	} );

	describe( '#getTheme()', () => {
		it( 'should return null if the theme is not known for the site', () => {
			const theme = getTheme( {
				themes: {
					queries: {}
				}
			}, 2916284, 413 );

			expect( theme ).to.be.null;
		} );

		it( 'should return the object for the site ID, theme ID pair', () => {
			const theme = getTheme( {
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: { twentysixteen }
						} )
					}
				}
			}, 2916284, 'twentysixteen' );

			expect( theme ).to.equal( twentysixteen );
		} );

		context( 'on a Jetpack site', () => {
			it( 'with a theme not found on WP.org, should return the theme object', () => {
				const jetpackTheme = {
					id: 'twentyseventeen',
					name: 'Twenty Seventeen',
					author: 'the WordPress team',
				};

				const theme = getTheme( {
					themes: {
						queries: {
							2916284: new ThemeQueryManager( {
								items: { twentyseventeen: jetpackTheme }
							} )
						}
					}
				}, 2916284, 'twentyseventeen' );

				expect( theme ).to.deep.equal( jetpackTheme );
			} );

			it( 'with a theme found on WP.org, should return an object with some attrs merged from WP.org', () => {
				const jetpackTheme = {
					id: 'twentyseventeen',
					name: 'Twenty Seventeen',
					author: 'the WordPress team',
				};
				const wporgTheme = {
					demo_uri: 'https://wp-themes.com/twentyseventeen',
					download: 'http://downloads.wordpress.org/theme/twentyseventeen.1.1.zip',
					taxonomies: {
						theme_feature: {
							'custom-header': 'Custom Header'
						}
					}
				};
				const theme = getTheme( {
					themes: {
						queries: {
							2916284: new ThemeQueryManager( {
								items: { twentyseventeen: jetpackTheme }
							} ),
							wporg: new ThemeQueryManager( {
								items: { twentyseventeen: wporgTheme }
							} ),
						}
					}
				}, 2916284, 'twentyseventeen' );

				expect( theme ).to.deep.equal( {
					...jetpackTheme,
					...wporgTheme
				} );
			} );
		} );
	} );

	describe( '#getThemesRequestError()', () => {
		it( 'should return null if thre is not request error storred for that theme on site', () => {
			const error = getThemeRequestErrors( {
				themes: {
					themeRequestErrors: {}
				}
			}, 'twentysixteen', 413 );

			expect( error ).to.be.null;
		} );

		it( 'should return the error object for the site ID, theme ID pair', () => {
			const error = getThemeRequestErrors( {
				themes: {
					themeRequestErrors: {
						2916284: {
							twentysixteen: 'Request error'
						}
					}
				}
			}, 'twentysixteen', 2916284, );

			expect( error ).to.equal( 'Request error' );
		} );
	} );

	describe( '#isRequestingTheme()', () => {
		it( 'should return false if there are no active requests for site', () => {
			const isRequesting = isRequestingTheme( {
				themes: {
					themeRequests: { }
				}
			}, 2916284, 'twentyfifteen' );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return false if there is no active request for theme for site', () => {
			const isRequesting = isRequestingTheme( {
				themes: {
					themeRequests: {
						2916284: {
							twentysixteen: true,
						}
					}
				}
			}, 2916284, 'twentyfifteen' );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return true if there is request ongoing for theme for site', () => {
			const isRequesting = isRequestingTheme( {
				themes: {
					themeRequests: {
						2916284: {
							twentysixteen: true,
						}
					}
				}
			}, 2916284, 'twentysixteen' );

			expect( isRequesting ).to.be.true;
		} );
	} );

	describe( '#getThemesForQuery()', () => {
		it( 'should return null if the site query is not tracked', () => {
			const siteThemes = getThemesForQuery( {
				themes: {
					queries: {}
				}
			}, 2916284, { search: 'Sixteen' } );

			expect( siteThemes ).to.be.null;
		} );

		it( 'should return null if the query is not tracked to the query manager', () => {
			const siteThemes = getThemesForQuery( {
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {},
							queries: {}
						} )
					}
				}
			}, 2916284, { search: 'Sixteen' } );

			expect( siteThemes ).to.be.null;
		} );

		it( 'should return an array of normalized known queried themes', () => {
			const siteThemes = getThemesForQuery( {
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								twentysixteen
							},
							queries: {
								'[["search","Sixteen"]]': {
									itemKeys: [ 'twentysixteen' ]
								}
							}
						} )
					}
				}
			}, 2916284, { search: 'Sixteen' } );

			expect( siteThemes ).to.eql( [ twentysixteen ] );
		} );

		it( 'should return null if we know the number of found items but the requested set hasn\'t been received', () => {
			const siteThemes = getThemesForQuery( {
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								twentyfifteen
							},
							queries: {
								'[["search","Fifteen"]]': {
									itemKeys: [ 'twentyfifteen', undefined ],
									found: 2
								}
							}
						} )
					}
				}
			}, 2916284, { search: 'Fifteen', number: 1, page: 2 } );

			expect( siteThemes ).to.be.null;
		} );
	} );

	describe( '#getLastThemeQuery', () => {
		it( 'given no site, should return empty object', () => {
			const query = getLastThemeQuery( {
				themes: {
					lastQuery: {}
				}
			} );

			expect( query ).to.deep.equal( {} );
		} );

		it( 'given a site, should return last used query', () => {
			const query = getLastThemeQuery(
				{
					themes: {
						lastQuery: {
							2916284: { search: 'theme that has this thing and does not have the other one' }
						}
					}
				},
				2916284
			);

			expect( query ).to.deep.equal( { search: 'theme that has this thing and does not have the other one' } );
		} );
	} );

	describe( '#isRequestingThemesForQuery()', () => {
		it( 'should return false if the site has not been queried', () => {
			const isRequesting = isRequestingThemesForQuery( {
				themes: {
					queryRequests: {}
				}
			}, 2916284, { search: 'Sixteen' } );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return false if the site has not been queried for the specific query', () => {
			const isRequesting = isRequestingThemesForQuery( {
				themes: {
					queryRequests: {
						'2916284:{"search":"Six"}': true
					}
				}
			}, 2916284, { search: 'Sixteen' } );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return true if the site has been queried for the specific query', () => {
			const isRequesting = isRequestingThemesForQuery( {
				themes: {
					queryRequests: {
						'2916284:{"search":"Sixteen"}': true
					}
				}
			}, 2916284, { search: 'Sixteen' } );

			expect( isRequesting ).to.be.true;
		} );

		it( 'should return false if the site has previously, but is not currently, querying for the specified query', () => {
			const isRequesting = isRequestingThemesForQuery( {
				themes: {
					queryRequests: {
						'2916284:{"search":"Sixteen"}': false
					}
				}
			}, 2916284, { search: 'Sixteen' } );

			expect( isRequesting ).to.be.false;
		} );
	} );

	describe( '#getThemesFoundForQuery()', () => {
		it( 'should return null if the site query is not tracked', () => {
			const found = getThemesFoundForQuery( {
				themes: {
					queries: {}
				}
			}, 2916284, { search: 'Sixteen' } );

			expect( found ).to.be.null;
		} );

		it( 'should return the found items for a site query', () => {
			const found = getThemesFoundForQuery( {
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								twentysixteen
							},
							queries: {
								'[["search","Sixteen"]]': {
									itemKeys: [ 'twentysixteen' ],
									found: 1
								}
							}
						} )
					}
				}
			}, 2916284, { search: 'Sixteen' } );

			expect( found ).to.equal( 1 );
		} );

		it( 'should return zero if in-fact there are zero items', () => {
			const found = getThemesFoundForQuery( {
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {},
							queries: {
								'[["search","Umpteen"]]': {
									itemKeys: [],
									found: 0
								}
							}
						} )
					}
				}
			}, 2916284, { search: 'Umpteen' } );

			expect( found ).to.equal( 0 );
		} );
	} );

	describe( '#getThemesLastPageForQuery()', () => {
		it( 'should return null if the site query is not tracked', () => {
			const lastPage = getThemesLastPageForQuery( {
				sites: {
					items: {}
				},
				themes: {
					queries: {}
				}
			}, 2916284, { search: 'Sixteen' } );

			expect( lastPage ).to.be.null;
		} );

		it( 'should return the last page value for a site query', () => {
			const lastPage = getThemesLastPageForQuery( {
				sites: {
					items: {}
				},
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								twentysixteen
							},
							queries: {
								'[["search","Sixteen"]]': {
									itemKeys: [ 'sixteen' ],
									found: 1
								}
							}
						} )
					}
				}
			}, 2916284, { search: 'Sixteen' } );

			expect( lastPage ).to.equal( 1 );
		} );

		it( 'should return the last page value for a site query, even if including page param', () => {
			const lastPage = getThemesLastPageForQuery( {
				sites: {
					items: {}
				},
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								twentysixteen
							},
							queries: {
								'[["search","Twenty"]]': {
									itemKeys: [ 'twentysixteen' ],
									found: 7
								}
							}
						} )
					}
				}
			}, 2916284, { search: 'Twenty', page: 3, number: 1 } );

			expect( lastPage ).to.equal( 7 );
		} );

		it( 'should return 1 if there are no found themes', () => {
			const lastPage = getThemesLastPageForQuery( {
				sites: {
					items: {}
				},
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {},
							queries: {
								'[["search","Umpteen"]]': {
									itemKeys: [],
									found: 0
								}
							}
						} )
					}
				}
			}, 2916284, { search: 'Umpteen' } );

			expect( lastPage ).to.equal( 1 );
		} );

		it( 'should return 1 for a Jetpack site', () => {
			const lastPage = getThemesLastPageForQuery( {
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							URL: 'https://example.net',
							jetpack: true
						}
					}
				},
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								twentysixteen
							},
							queries: {
								'[["search","Twenty"]]': {
									itemKeys: [ 'twentysixteen' ],
									found: 7
								}
							}
						} )
					}
				}
			}, 2916284, { search: 'Twenty' } );

			expect( lastPage ).to.equal( 1 );
		} );
	} );

	describe( '#isThemesLastPageForQuery()', () => {
		it( 'should return null if the last page is not known', () => {
			const isLastPage = isThemesLastPageForQuery( {
				themes: {
					queries: {}
				}
			}, 2916284, { search: 'Umpteen' } );

			expect( isLastPage ).to.be.null;
		} );

		it( 'should return false if the query explicit value is not the last page', () => {
			const isLastPage = isThemesLastPageForQuery( {
				sites: {
					items: {}
				},
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								twentysixteen
							},
							queries: {
								'[["search","Twenty"]]': {
									itemKeys: [ 'twentysixteen' ],
									found: 7
								}
							}
						} )
					}
				}
			}, 2916284, { search: 'Twenty', page: 6, number: 1 } );

			expect( isLastPage ).to.be.false;
		} );

		it( 'should return true if the query explicit value is the last page', () => {
			const isLastPage = isThemesLastPageForQuery( {
				sites: {
					items: {}
				},
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								twentysixteen
							},
							queries: {
								'[["search","Twenty"]]': {
									itemKeys: [ 'twentysixteen' ],
									found: 7
								}
							}
						} )
					}
				}
			}, 2916284, { search: 'Twenty', page: 7, number: 1 } );

			expect( isLastPage ).to.be.true;
		} );

		it( 'should return true if the query implicit value is the last page', () => {
			const isLastPage = isThemesLastPageForQuery( {
				sites: {
					items: {}
				},
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								twentysixteen
							},
							queries: {
								'[["search","Sixteen"]]': {
									itemKeys: [ 'twentysixteen' ],
									found: 1
								}
							}
						} )
					}
				}
			}, 2916284, { search: 'Sixteen', number: 1 } );

			expect( isLastPage ).to.be.true;
		} );

		it( 'should return true for a Jetpack site', () => {
			const isLastPage = isThemesLastPageForQuery( {
				sites: {
					items: {
						77203074: {
							ID: 77203074,
							URL: 'https://example.net',
							jetpack: true
						}
					}
				},
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								twentysixteen
							},
							queries: {
								'[["search","Twenty"]]': {
									itemKeys: [ 'twentysixteen' ],
									found: 7
								}
							}
						} )
					}
				}
			}, 2916284, { search: 'Twenty' } );

			expect( isLastPage ).to.be.true;
		} );
	} );

	describe( '#getThemesForQueryIgnoringPage()', () => {
		it( 'should return null if the query is not tracked', () => {
			const themes = getThemesForQueryIgnoringPage( {
				themes: {
					queries: {}
				}
			}, 2916284, { search: '', number: 1 } );

			expect( themes ).to.be.null;
		} );

		it( 'should return null if the query manager has not received items for query', () => {
			const themes = getThemesForQueryIgnoringPage( {
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {},
							queries: {}
						} )
					}
				}
			}, 2916284, { search: '', number: 1 } );

			expect( themes ).to.be.null;
		} );

		it( 'should return a concatenated array of all site themes ignoring page', () => {
			const themes = getThemesForQueryIgnoringPage( {
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								twentyfifteen,
								twentysixteen
							},
							queries: {
								'[]': {
									itemKeys: [ 'twentyfifteen', 'twentysixteen' ]
								}
							}
						} )
					}
				}
			}, 2916284, { search: '', number: 1 } );

			expect( themes ).to.eql( [
				twentyfifteen,
				twentysixteen
			] );
		} );

		it( 'should omit found items for which the requested result hasn\'t been received', () => {
			const themes = getThemesForQueryIgnoringPage( {
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								twentysixteen
							},
							queries: {
								'[["search","Sixteen"]]': {
									itemKeys: [ 'twentysixteen', undefined ],
									found: 2
								}
							}
						} )
					}
				}
			}, 2916284, { search: 'Sixteen', number: 1 } );

			expect( themes ).to.eql( [
				twentysixteen
			] );
		} );
	} );

	describe( '#isRequestingThemesForQueryIgnoringPage()', () => {
		it( 'should return false if not requesting for query', () => {
			const isRequesting = isRequestingThemesForQueryIgnoringPage( {
				themes: {
					queryRequests: {}
				}
			}, 2916284, { search: 'twen' } );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return true requesting for query at exact page', () => {
			const isRequesting = isRequestingThemesForQueryIgnoringPage( {
				themes: {
					queryRequests: {
						'2916284:{"search":"twen","page":4}': true
					}
				}
			}, 2916284, { search: 'twen', page: 4 } );

			expect( isRequesting ).to.be.true;
		} );

		it( 'should return true requesting for query without page specified', () => {
			const isRequesting = isRequestingThemesForQueryIgnoringPage( {
				themes: {
					queryRequests: {
						'2916284:{"search":"twen","page":4}': true
					}
				}
			}, 2916284, { search: 'twen' } );

			expect( isRequesting ).to.be.true;
		} );
	} );

	describe( '#getThemeDetailsUrl', () => {
		it( 'given a theme and no site ID, should return the Calypso theme sheet URL', () => {
			const detailsUrl = getThemeDetailsUrl(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.wordpress.com'
							}
						}
					}
				},
				{
					id: 'twentysixteen',
					stylesheet: 'pub/twentysixteen'
				}
			);
			expect( detailsUrl ).to.equal( '/theme/twentysixteen' );
		} );

		it( 'given a theme and wpcom site ID, should return the Calypso theme sheet URL', () => {
			const detailsUrl = getThemeDetailsUrl(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.wordpress.com'
							}
						}
					}
				},
				{
					id: 'twentysixteen',
					stylesheet: 'pub/twentysixteen'
				},
				2916284
			);
			expect( detailsUrl ).to.equal( '/theme/twentysixteen/example.wordpress.com' );
		} );

		context( 'given a theme and a Jetpack site ID', () => {
			context( 'with JP version < 4.4.2', () => {
				it( 'should return the site\'s wp-admin theme details URL', () => {
					const detailsUrl = getThemeDetailsUrl(
						{
							sites: {
								items: {
									77203074: {
										ID: 77203074,
										URL: 'https://example.net',
										jetpack: true,
										options: {
											admin_url: 'https://example.net/wp-admin/',
											jetpack_version: '4.4.1'
										}
									}
								}
							}
						},
						{
							id: 'twentysixteen',
							stylesheet: 'pub/twentysixteen'
						},
						77203074
					);
					expect( detailsUrl ).to.equal( 'https://example.net/wp-admin/themes.php?theme=twentysixteen' );
				} );
			} );

			context( 'with JP version >= 4.4.2', () => {
				context( 'with Jetpack Manage turned off', () => {
					it( 'should return the site\'s wp-admin theme details URL', () => {
						const detailsUrl = getThemeDetailsUrl(
							{
								sites: {
									items: {
										77203074: {
											ID: 77203074,
											URL: 'https://example.net',
											jetpack: true,
											options: {
												admin_url: 'https://example.net/wp-admin/',
												jetpack_version: '4.4.2',
												active_modules: []
											}
										}
									}
								}
							},
							{
								id: 'twentysixteen',
								stylesheet: 'pub/twentysixteen'
							},
							77203074
						);
						expect( detailsUrl ).to.equal( 'https://example.net/wp-admin/themes.php?theme=twentysixteen' );
					} );
				} );

				context( 'with Jetpack Manage not explicitly turned off', () => {
					it( 'should return the Calypso theme sheet URL', () => {
						const detailsUrl = getThemeDetailsUrl(
							{
								sites: {
									items: {
										77203074: {
											ID: 77203074,
											URL: 'https://example.net',
											jetpack: true,
											options: {
												admin_url: 'https://example.net/wp-admin/',
												jetpack_version: '4.4.2'
											}
										}
									}
								}
							},
							{
								id: 'twentysixteen',
								stylesheet: 'pub/twentysixteen'
							},
							77203074
						);
						expect( detailsUrl ).to.equal( '/theme/twentysixteen/example.net' );
					} );
				} );
			} );
		} );
	} );

	describe( '#getThemeSupportUrl', () => {
		context( 'for a premium theme', () => {
			it( 'given no site ID, should return the support URL', () => {
				const supportUrl = getThemeSupportUrl(
					{
						sites: {
							items: {
								2916284: {
									ID: 2916284,
									URL: 'https://example.wordpress.com'
								}
							}
						},
						themes: {
							queries: {
								wpcom: new ThemeQueryManager( {
									items: { mood }
								} )
							}
						}
					},
					{
						id: 'mood'
					}
				);
				expect( supportUrl ).to.equal( '/theme/mood/setup' );
			} );

			it( 'given a wpcom site ID, should return the support URL', () => {
				const supportUrl = getThemeSupportUrl(
					{
						sites: {
							items: {
								2916284: {
									ID: 2916284,
									URL: 'https://example.wordpress.com'
								}
							}
						},
						themes: {
							queries: {
								wpcom: new ThemeQueryManager( {
									items: { mood }
								} )
							}
						}
					},
					{
						id: 'mood'
					},
					2916284
				);
				expect( supportUrl ).to.equal( '/theme/mood/setup/example.wordpress.com' );
			} );
		} );

		context( 'for a free theme', () => {
			it( 'given no site ID, should return null', () => {
				const supportUrl = getThemeSupportUrl(
					{
						sites: {
							items: {
								2916284: {
									ID: 2916284,
									URL: 'https://example.wordpress.com'
								}
							}
						},
						themes: {
							queries: {
								wpcom: new ThemeQueryManager( {
									items: { twentysixteen }
								} )
							}
						}
					},
					{
						id: 'twentysixteen'
					}
				);
				expect( supportUrl ).to.be.null;
			} );

			it( 'given a wpcom site ID, should return null', () => {
				const supportUrl = getThemeSupportUrl(
					{
						sites: {
							items: {
								2916284: {
									ID: 2916284,
									URL: 'https://example.wordpress.com'
								}
							}
						},
						themes: {
							queries: {
								wpcom: new ThemeQueryManager( {
									items: { twentysixteen }
								} )
							}
						}
					},
					{
						id: 'twentysixteen'
					},
					2916284
				);
				expect( supportUrl ).to.be.null;
			} );

			it( 'given a Jetpack site ID, should return null', () => {
				const supportUrl = getThemeSupportUrl(
					{
						sites: {
							items: {
								77203074: {
									ID: 77203074,
									URL: 'https://example.net',
									jetpack: true,
									options: {
										admin_url: 'https://example.net/wp-admin/'
									}
								}
							}
						},
						themes: {
							queries: {
								wpcom: new ThemeQueryManager( {
									items: { twentysixteen }
								} )
							}
						}
					},
					{
						id: 'twentysixteen'
					},
					77203074
				);
				expect( supportUrl ).to.be.null;
			} );
		} );
	} );

	describe( '#getThemeHelpUrl', () => {
		it( 'given a theme and no site ID, should return the help URL', () => {
			const helpUrl = getThemeHelpUrl(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.wordpress.com'
							}
						}
					}
				},
				{
					id: 'mood',
					stylesheet: 'premium/mood'
				}
			);
			expect( helpUrl ).to.equal( '/theme/mood/support' );
		} );

		it( 'given a theme and a wpcom site ID, should return the correct help URL', () => {
			const helpUrl = getThemeHelpUrl(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.wordpress.com'
							}
						}
					},
					themes: {
						queries: {
							wpcom: new ThemeQueryManager( {
								items: { mood }
							} )
						}
					}
				},
				{
					id: 'mood'
				},
				2916284
			);
			expect( helpUrl ).to.equal( '/theme/mood/support/example.wordpress.com' );
		} );

		it( 'given a theme and Jetpack site ID, should return null', () => {
			const helpUrl = getThemeHelpUrl(
				{
					sites: {
						items: {
							77203074: {
								ID: 77203074,
								URL: 'https://example.net',
								jetpack: true,
								options: {
									admin_url: 'https://example.net/wp-admin/'
								}
							}
						}
					}
				},
				{
					id: 'twentysixteen',
					stylesheet: 'pub/twentysixteen'
				},
				77203074
			);
			expect( helpUrl ).to.be.null;
		} );
	} );

	describe( '#getThemePurchaseUrl', () => {
		it( 'given a free theme and a wpcom site ID, should return null', () => {
			const purchaseUrl = getThemePurchaseUrl(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.wordpress.com'
							}
						}
					},
					themes: {
						queries: {
							wpcom: new ThemeQueryManager( {
								items: { twentysixteen }
							} )
						}
					}
				},
				{
					id: 'twentysixteen'
				},
				2916284
			);
			expect( purchaseUrl ).to.be.null;
		} );

		it( 'given a premium theme and a wpcom site ID, should return the purchase URL', () => {
			const purchaseUrl = getThemePurchaseUrl(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.wordpress.com'
							}
						}
					},
					themes: {
						queries: {
							wpcom: new ThemeQueryManager( {
								items: { mood }
							} )
						}
					}
				},
				{
					id: 'mood'
				},
				2916284
			);
			expect( purchaseUrl ).to.equal( '/checkout/example.wordpress.com/theme:mood' );
		} );
	} );

	describe( '#getThemeCustomizeUrl', () => {
		it( 'given no theme and no site ID, should return the correct customize URL', () => {
			const customizeUrl = getThemeCustomizeUrl( {} );
			expect( customizeUrl ).to.equal( '/customize/' );
		} );

		it( 'given a theme and no site ID, should return the correct customize URL', () => {
			const customizeUrl = getThemeCustomizeUrl(
				{},
				{
					id: 'twentysixteen',
					stylesheet: 'pub/twentysixteen'
				}
			);
			expect( customizeUrl ).to.equal( '/customize/' );
		} );

		it( 'given a theme and wpcom site ID, should return the correct customize URL', () => {
			const customizeUrl = getThemeCustomizeUrl(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.wordpress.com'
							}
						}
					}
				},
				{
					id: 'twentysixteen',
					stylesheet: 'pub/twentysixteen'
				},
				2916284
			);
			expect( customizeUrl ).to.equal( '/customize/example.wordpress.com?theme=pub/twentysixteen' );
		} );

		// FIXME: In implementation, get rid of `window` dependency.
		it.skip( 'given a theme and Jetpack site ID, should return the correct customize URL', () => {
			const customizeUrl = getThemeCustomizeUrl(
				{
					sites: {
						items: {
							77203074: {
								ID: 77203074,
								URL: 'https://example.net',
								jetpack: true
							}
						}
					}
				},
				{
					id: 'twentysixteen',
					stylesheet: 'pub/twentysixteen'
				},
				77203074
			);
			expect( customizeUrl ).to.equal( '/customize/example.wordpress.com?theme=pub/twentysixteen' );
		} );
	} );

	describe( '#getThemeSignupUrl', () => {
		it( 'given a free theme, should return the correct signup URL', () => {
			const signupUrl = getThemeSignupUrl(
				{
					themes: {
						queries: {
							wpcom: new ThemeQueryManager( {
								items: { twentysixteen }
							} )
						}
					}
				},
				{
					id: 'twentysixteen'
				}
			);

			expect( signupUrl ).to.equal( '/start/with-theme?ref=calypshowcase&theme=twentysixteen' );
		} );

		it( 'given a premium theme, should return the correct signup URL', () => {
			const signupUrl = getThemeSignupUrl(
				{
					themes: {
						queries: {
							wpcom: new ThemeQueryManager( {
								items: { mood }
							} )
						}
					}
				},
				{
					id: 'mood'
				}
			);

			expect( signupUrl ).to.equal( '/start/with-theme?ref=calypshowcase&theme=mood&premium=true' );
		} );
	} );

	describe( '#getThemeForumUrl', () => {
		context( 'on a WP.com site', () => {
			it( 'given a free theme, should return the general themes forum URL', () => {
				const forumUrl = getThemeForumUrl(
					{
						sites: {
							items: {}
						},
						themes: {
							queries: {
								wpcom: new ThemeQueryManager( {
									items: { twentysixteen }
								} )
							}
						}
					},
					'twentysixteen'
				);

				expect( forumUrl ).to.equal( '//en.forums.wordpress.com/forum/themes' );
			} );

			it( 'given a premium theme, should return the specific theme forum URL', () => {
				const forumUrl = getThemeForumUrl(
					{
						sites: {
							items: {}
						},
						themes: {
							queries: {
								wpcom: new ThemeQueryManager( {
									items: { mood }
								} )
							}
						}
					},
					'mood'
				);

				expect( forumUrl ).to.equal( '//premium-themes.forums.wordpress.com/forum/mood' );
			} );
		} );

		context( 'on a Jetpack site', () => {
			it( 'given a theme that\'s not found on WP.org, should return null', () => {
				const forumUrl = getThemeForumUrl(
					{
						sites: {
							items: {
								77203074: {
									ID: 77203074,
									URL: 'https://example.net',
									jetpack: true
								}
							}
						},
						themes: {
							queries: {
								wpcom: new ThemeQueryManager( {
									items: { twentysixteen }
								} )
							}
						}
					},
					'twentysixteen',
					77203074
				);

				expect( forumUrl ).to.be.null;
			} );

			it( 'given a theme that\'s found on WP.org, should return the correspoding WP.org theme forum URL', () => {
				const jetpackTheme = {
					id: 'twentyseventeen',
					name: 'Twenty Seventeen',
					author: 'the WordPress team',
				};
				const wporgTheme = {
					demo_uri: 'https://wp-themes.com/twentyseventeen',
					download: 'http://downloads.wordpress.org/theme/twentyseventeen.1.1.zip',
					taxonomies: {
						theme_feature: {
							'custom-header': 'Custom Header'
						}
					}
				};

				const forumUrl = getThemeForumUrl(
					{
						sites: {
							items: {
								77203074: {
									ID: 77203074,
									URL: 'https://example.net',
									jetpack: true
								}
							}
						},
						themes: {
							queries: {
								77203074: new ThemeQueryManager( {
									items: { twentyseventeen: jetpackTheme }
								} ),
								wporg: new ThemeQueryManager( {
									items: { twentyseventeen: wporgTheme }
								} )
							}
						}
					},
					'twentyseventeen',
					77203074
				);

				expect( forumUrl ).to.equal( '//wordpress.org/support/theme/twentyseventeen' );
			} );
		} );
	} );

	describe( '#getActiveTheme', () => {
		it( 'given no site, should return null', () => {
			const activeTheme = getActiveTheme( {
				themes: {
					activeTheme: {}
				}
			} );

			expect( activeTheme ).to.be.null;
		} );

		it( 'given a site, should return its currently active theme', () => {
			const activeTheme = getActiveTheme(
				{
					themes: {
						activeThemes: {
							2916284: 'twentysixteen'
						}
					}
				},
				2916284
			);

			expect( activeTheme ).to.equal( 'twentysixteen' );
		} );
	} );

	describe( '#isThemeActive', () => {
		it( 'given no theme and no site, should return false', () => {
			const isActive = isThemeActive(
				{
					themes: {
						activeThemes: {
							2916284: 'twentysixteen'
						}
					}
				},
			);

			expect( isActive ).to.be.false;
		} );

		it( 'given a theme but no site, should return false', () => {
			const isActive = isThemeActive(
				{
					themes: {
						activeThemes: {
							2916284: 'twentysixteen'
						}
					}
				}, 'mood'
			);

			expect( isActive ).to.be.false;
		} );

		it( 'given a theme and a site on which it isn\'t active, should return false', () => {
			const isActive = isThemeActive(
				{
					themes: {
						activeThemes: {
							2916284: 'twentysixteen'
						}
					}
				},
				'mood',
				2916284
			);

			expect( isActive ).to.be.false;
		} );

		it( 'given a theme and a site on which it is active, should return true', () => {
			const isActive = isThemeActive(
				{
					themes: {
						activeThemes: {
							2916284: 'mood'
						}
					}
				}, 'mood', 2916284
			);

			expect( isActive ).to.be.true;
		} );
	} );

	describe( '#isActivatingTheme', () => {
		it( 'given no site, should return false', () => {
			const activating = isActivatingTheme( {
				themes: {
					activationRequests: {}
				}
			} );

			expect( activating ).to.be.false;
		} );

		it( 'given a site, should return true if theme is currently activated', () => {
			const activating = isActivatingTheme(
				{
					themes: {
						activationRequests: {
							2916284: true
						}
					}
				},
				2916284
			);

			expect( activating ).to.be.true;
		} );
	} );

	describe( '#hasActivatedTheme', () => {
		it( 'given no site, should return false', () => {
			const activated = hasActivatedTheme( {
				themes: {
					completedActivationRequests: {}
				}
			} );

			expect( activated ).to.be.false;
		} );

		it( 'given a site, should return true if theme has been activated', () => {
			const activated = hasActivatedTheme(
				{
					themes: {
						completedActivationRequests: {
							2916284: true
						}
					}
				},
				2916284
			);

			expect( activated ).to.be.true;
		} );
	} );

	describe( '#isRequestingActiveTheme', () => {
		it( 'given empty state, should return false', () => {
			const isRequesting = isRequestingActiveTheme( {
				themes: {
					activeThemeRequests: {}
				}
			} );

			expect( isRequesting ).to.be.false;
		} );

		it( 'given no active request, should return false', () => {
			const isRequesting = isRequestingActiveTheme( {
				themes: {
					activeThemeRequests: {
						2916284: false
					}
				}
			},
			2916284
		);

			expect( isRequesting ).to.be.false;
		} );

		it( 'given pending action request, should return true', () => {
			const isRequesting = isRequestingActiveTheme( {
				themes: {
					activeThemeRequests: {
						2916284: true
					}
				}
			},
			2916284
		);

			expect( isRequesting ).to.be.true;
		} );
	} );

	describe( '#isInstallingTheme', () => {
		it( 'given no site, should return false', () => {
			const installing = isInstallingTheme( {
				themes: {
					themeInstalls: {}
				}
			} );

			expect( installing ).to.be.false;
		} );

		it( 'given a site, should return true if theme is currently being installed', () => {
			const installing = isInstallingTheme(
				{
					themes: {
						themeInstalls: {
							2916284: true
						}
					}
				},
				2916284
			);

			expect( installing ).to.be.true;
		} );
	} );

	describe( '#isWporgTheme()', () => {
		it( 'should return false if theme is not found on WP.org', () => {
			const isWporg = isWporgTheme( {
				themes: {
					queries: {
					}
				}
			}, 'twentyseventeen' );

			expect( isWporg ).to.be.false;
		} );

		it( 'should return true if theme is found on WP.org', () => {
			const wporgTheme = {
				id: 'twentyseventeen',
				name: 'Twenty Seventeen',
				author: 'wordpressdotorg',
				demo_uri: 'https://wp-themes.com/twentyseventeen',
				download: 'http://downloads.wordpress.org/theme/twentyseventeen.1.1.zip',
				taxonomies: {
					theme_feature: {
						'custom-header': 'Custom Header'
					}
				}
			};
			const isWporg = isWporgTheme( {
				themes: {
					queries: {
						wporg: new ThemeQueryManager( {
							items: { twentyseventeen: wporgTheme }
						} ),
					}
				}
			}, 'twentyseventeen' );

			expect( isWporg ).to.be.true;
		} );
	} );

	describe( '#isPremium()', () => {
		it( 'given no theme object, should return false', () => {
			const premium = isThemePremium(
				{
					themes: {
						queries: {}
					}
				}
			);
			expect( premium ).to.be.false;
		} );

		it( 'given the ID of a theme that doesn\'t exist, should return false', () => {
			const premium = isThemePremium(
				{
					themes: {
						queries: {
							wpcom: new ThemeQueryManager( {
								items: { twentysixteen }
							} )
						}
					}
				},
				'twentyumpteen'
			);
			expect( premium ).to.be.false;
		} );

		it( 'given the ID of a free theme, should return false', () => {
			const premium = isThemePremium(
				{
					themes: {
						queries: {
							wpcom: new ThemeQueryManager( {
								items: { twentysixteen }
							} )
						}
					}
				},
				'twentysixteen'
			);
			expect( premium ).to.be.false;
		} );

		it( 'given the ID of a premium theme, should return false', () => {
			const premium = isThemePremium(
				{
					themes: {
						queries: {
							wpcom: new ThemeQueryManager( {
								items: { mood }
							} )
						}
					}
				},
				'mood'
			);
			expect( premium ).to.be.true;
		} );
	} );

	describe( '#isThemePurchased', () => {
		it( 'given no theme and no site, should return false', () => {
			const isPurchased = isThemePurchased(
				{
					purchases: {
						data: [
							{
								ID: 1234567,
								blog_id: 2916284,
								meta: 'mood',
								product_slug: 'premium_theme'
							}
						]
					}
				}
			);

			expect( isPurchased ).to.be.false;
		} );

		it( 'given a theme but no site, should return false', () => {
			const isPurchased = isThemePurchased(
				{
					purchases: {
						data: [
							{
								ID: 1234567,
								blog_id: 2916284,
								meta: 'mood',
								product_slug: 'premium_theme'
							}
						]
					}
				}, 'mood'
			);

			expect( isPurchased ).to.be.false;
		} );

		it( 'given a theme that has not been purchased on a given site, should return false', () => {
			const isPurchased = isThemePurchased(
				{
					purchases: {
						data: [
							{
								ID: 1234567,
								blog_id: 2916284,
								meta: 'mood',
								product_slug: 'premium_theme'
							}
						]
					}
				}, 'espresso', 2916284
			);

			expect( isPurchased ).to.be.false;
		} );

		it( 'given a theme that has been purchased on a given site, should return true', () => {
			const isPurchased = isThemePurchased(
				{
					purchases: {
						data: [
							{
								ID: 1234567,
								blog_id: 2916284,
								meta: 'mood',
								product_slug: 'premium_theme'
							}
						]
					}
				}, 'mood', 2916284
			);

			expect( isPurchased ).to.be.true;
		} );
	} );
} );

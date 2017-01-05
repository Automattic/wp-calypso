/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getTheme,
	getCanonicalTheme,
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
	isWpcomTheme,
	isThemeActive,
	isActivatingTheme,
	hasActivatedTheme,
	isInstallingTheme,
	isThemePremium,
	isThemePurchased,
	isPremiumSquaredTheme,
	isPremiumThemeAvailable,
	isThemeAvailableOnJetpackSite,
	getWpcomParentThemeId,
} from '../selectors';
import ThemeQueryManager from 'lib/query-manager/theme';

import { PLAN_FREE, PLAN_PREMIUM, PLAN_BUSINESS } from 'lib/plans/constants';

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

const hustle = {
	id: 'hustle-express',
	name: 'Hustle Express',
	author: 'WooThemes',
	screenshot: 'hustle-express.jpg',
	price: '$20',
	stylesheet: 'premium/hustle-express',
	demo_uri: 'https://hustleexpressdemo.wordpress.com/',
	author_uri: 'https://wordpress.com/themes/'
};

const zuki = {
	id: 'zuki',
	name: 'Zuki',
	author: 'Elmastudio',
	screenshot: 'zuki.jpg',
	price: '$20',
	stylesheet: 'premium/zuki',
	demo_uri: 'https:/zukidemo.wordpress.com/',
	author_uri: 'https://wordpress.com/themes/'
};

const sidekick = {
	id: 'sidekick',
	template: 'superhero',
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
	} );

	describe( '#getCanonicalTheme()', () => {
		it( 'with a theme found on WP.com, should return the object fetched from there', () => {
			const theme = getCanonicalTheme( {
				themes: {
					queries: {
						wpcom: new ThemeQueryManager( {
							items: { twentysixteen }
						} ),
					}
				}
			}, 2916284, 'twentysixteen' );

			expect( theme ).to.deep.equal( twentysixteen );
		} );

		it( 'with a theme found on WP.org but not on WP.com, should return the object fetched from there', () => {
			const wporgTheme = {
				id: 'twentyseventeen',
				name: 'Twenty Seventeen',
				author: 'the WordPress team',
				demo_uri: 'https://wp-themes.com/twentyseventeen',
				download: 'http://downloads.wordpress.org/theme/twentyseventeen.1.1.zip',
				taxonomies: {
					theme_feature: {
						'custom-header': 'Custom Header'
					}
				}
			};
			const theme = getCanonicalTheme( {
				themes: {
					queries: {
						wporg: new ThemeQueryManager( {
							items: { twentyseventeen: wporgTheme }
						} ),
					}
				}
			}, 2916284, 'twentyseventeen' );

			expect( theme ).to.deep.equal( wporgTheme );
		} );

		it( 'with a theme not found on WP.com nor on WP.org, should return the theme object from the given siteId', () => {
			const jetpackTheme = {
				id: 'twentyseventeen',
				name: 'Twenty Seventeen',
				author: 'the WordPress team',
			};

			const theme = getCanonicalTheme( {
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
				'twentysixteen'
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
				'twentysixteen',
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
						'twentysixteen',
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
							'twentysixteen',
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
							'twentysixteen',
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
					'mood'
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
					'mood',
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
					'twentysixteen'
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
					'twentysixteen',
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
					'twentysixteen',
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
				'mood'
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
				'mood',
				2916284
			);
			expect( helpUrl ).to.equal( '/theme/mood/support/example.wordpress.com' );
		} );

		it( 'given a theme and Jetpack site ID, should return the help url', () => {
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
				'twentysixteen',
				77203074
			);
			expect( helpUrl ).to.be.equal( '/theme/twentysixteen/support/example.net' );
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
				'twentysixteen',
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
				'mood',
				2916284
			);
			expect( purchaseUrl ).to.equal( '/checkout/example.wordpress.com/theme:mood' );
		} );
	} );

	describe( '#getThemeCustomizeUrl', () => {
		it( 'given no theme and no site ID, should return the correct customize URL', () => {
			const customizeUrl = getThemeCustomizeUrl( {
				sites: {
					items: {}
				}
			} );
			expect( customizeUrl ).to.equal( '/customize' );
		} );

		it( 'given a theme and no site ID, should return the correct customize URL', () => {
			const customizeUrl = getThemeCustomizeUrl(
				{
					sites: {
						items: {}
					}
				},
				'twentysixteen'
			);
			expect( customizeUrl ).to.equal( '/customize' );
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
				2916284
			);
			expect( customizeUrl ).to.equal( '/customize/example.wordpress.com?theme=pub/twentysixteen' );
		} );

		context( 'on a Jetpack site', () => {
			context( 'with a non-WP.com theme', () => {
				const state = {
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
							77203074: new ThemeQueryManager( {
								items: { twentysixteen }
							} )
						}
					}
				};

				context( 'in the browser', () => {
					before( () => {
						global.window = {
							location: {
								href: 'https://wordpress.com'
							}
						};
					} );

					after( () => {
						delete global.window;
					} );

					it( 'should return customizer URL with return arg and un-suffixed theme ID', () => {
						const customizeUrl = getThemeCustomizeUrl( state, 'twentysixteen', 77203074 );
						expect( customizeUrl ).to.equal(
							'https://example.net/wp-admin/customize.php?return=https%3A%2F%2Fwordpress.com&theme=twentysixteen'
						);
					} );
				} );

				context( 'on the server', () => {
					it( 'should return customizer URL with un-suffixed theme ID', () => {
						const customizeUrl = getThemeCustomizeUrl( state, 'twentysixteen', 77203074 );
						expect( customizeUrl ).to.equal( 'https://example.net/wp-admin/customize.php?theme=twentysixteen' );
					} );
				} );
			} );

			context( 'with a WP.com theme', () => {
				const state = {
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
				};

				context( 'in the browser', () => {
					before( () => {
						global.window = {
							location: {
								href: 'https://wordpress.com'
							}
						};
					} );

					after( () => {
						delete global.window;
					} );

					it( 'should return customizer URL with return arg and suffixed theme ID', () => {
						const customizeUrl = getThemeCustomizeUrl( state, 'twentysixteen', 77203074 );
						expect( customizeUrl ).to.equal(
							'https://example.net/wp-admin/customize.php?return=https%3A%2F%2Fwordpress.com&theme=twentysixteen-wpcom'
						);
					} );
				} );

				context( 'on the server', () => {
					it( 'should return customizer URL with suffixed theme ID', () => {
						const customizeUrl = getThemeCustomizeUrl( state, 'twentysixteen', 77203074 );
						expect( customizeUrl ).to.equal( 'https://example.net/wp-admin/customize.php?theme=twentysixteen-wpcom' );
					} );
				} );
			} );
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
				'twentysixteen'
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
				'mood'
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
			it( 'given a theme that\'s found on neither WP.com nor WP.org, should return null', () => {
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
							queries: {}
						}
					},
					'twentysixteen',
					77203074
				);

				expect( forumUrl ).to.be.null;
			} );

			it( 'given a theme that\'s found on WP.com, should return the generic WP.com themes support forum URL', () => {
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

				expect( forumUrl ).to.equal( '//en.forums.wordpress.com/forum/themes' );
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

		it( 'given a site, should return its currently active theme without -wpcom suffix', () => {
			const activeTheme = getActiveTheme(
				{
					themes: {
						activeThemes: {
							2916284: 'twentysixteen-wpcom'
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
						},
						queries: {
							wpcom: new ThemeQueryManager( {} ),
						},
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
						},
						queries: {
							wpcom: new ThemeQueryManager( {} ),
						},
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
						},
						queries: {
							wpcom: new ThemeQueryManager( {} ),
						},
					},
					sites: {
						items: {
							2916284: { ID: 2916284, jetpack: false }
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
						},
						queries: {
							wpcom: new ThemeQueryManager( {} ),
						},
					},
					sites: {
						items: {
							2916284: { ID: 2916284, jetpack: false }
						}
					}
				}, 'mood', 2916284
			);

			expect( isActive ).to.be.true;
		} );

		it( 'given a wpcom theme and a jetpack site on which it is active, should return true', () => {
			const isActive = isThemeActive(
				{
					themes: {
						activeThemes: {
							77203074: 'karuna-wpcom'
						},
						queries: {
							wpcom: new ThemeQueryManager( {
								items: { karuna: { id: 'karuna' } }
							} ),
						}
					},
					sites: {
						items: {
							77203074: { ID: 77203074, URL: 'https://example.net', jetpack: true }
						}
					}
				}, 'karuna', 77203074
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
							2916284: {
								karuna: true
							}
						},
						queries: {
							wpcom: new ThemeQueryManager( {} ),
						},
					},
					sites: {
						items: {
							2916284: { ID: 2916284, jetpack: false }
						}
					}
				},
				'karuna',
				2916284
			);

			expect( installing ).to.be.true;
		} );

		it( 'given a jetpack site and wpcom theme, should return true if theme is currently being installed', () => {
			const installing = isInstallingTheme(
				{
					themes: {
						themeInstalls: {
							77203074: {
								'karuna-wpcom': true
							}
						},
						queries: {
							wpcom: new ThemeQueryManager( {
								items: { karuna: { id: 'karuna' } }
							} ),
						}
					},
					sites: {
						items: {
							77203074: { ID: 77203074, URL: 'https://example.net', jetpack: true }
						}
					}
				},
				'karuna',
				77203074
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

	describe( '#isWpcomTheme()', () => {
		it( 'should return false if theme is not found on WP.com', () => {
			const isWpcom = isWporgTheme( {
				themes: {
					queries: {
					}
				}
			}, 'twentysixteen' );

			expect( isWpcom ).to.be.false;
		} );

		it( 'should return true if theme is found on WP.com', () => {
			const isWpcom = isWpcomTheme( {
				themes: {
					queries: {
						wpcom: new ThemeQueryManager( {
							items: { twentysixteen }
						} ),
					}
				}
			}, 'twentysixteen' );

			expect( isWpcom ).to.be.true;
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

		it( 'given the ID of a premium theme, should return true', () => {
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

	describe( '#isPremiumSquaredTheme', () => {
		it( 'given no theme object, should return false', () => {
			const premiumSquared = isPremiumSquaredTheme(
				{
					themes: {
						queries: {}
					}
				}
			);
			expect( premiumSquared ).to.be.false;
		} );

		it( 'given the ID of a premium theme that doesn\'t belong to the premium squared bundle, should return false', () => {
			const premiumSquared = isPremiumSquaredTheme(
				{
					themes: {
						queries: {
							wpcom: new ThemeQueryManager( {
								items: { zuki }
							} )
						}
					}
				},
				'zuki'
			);
			expect( premiumSquared ).to.be.false;
		} );

		it( 'given the ID of a premium theme by Automattic, should return true', () => {
			const premiumSquared = isPremiumSquaredTheme(
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
			expect( premiumSquared ).to.be.true;
		} );

		it( 'given the ID of a premium theme by WooThemes, should return true', () => {
			const premiumSquared = isPremiumSquaredTheme(
				{
					themes: {
						queries: {
							wpcom: new ThemeQueryManager( {
								items: { hustle }
							} )
						}
					}
				},
				'hustle'
			);
			expect( premiumSquared ).to.be.true;
		} );

		it( 'given the ID of a free theme, should return false', () => {
			const premiumSquared = isPremiumSquaredTheme(
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
			expect( premiumSquared ).to.be.false;
		} );
	} );

	describe( '#isPremiumThemeAvailable', () => {
		it( 'given no theme and no site, should return false', () => {
			const isAvailable = isPremiumThemeAvailable(
				{
					themes: {
						queries: {}
					},
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

			expect( isAvailable ).to.be.false;
		} );

		it( 'given a theme but no site, should return false', () => {
			const isAvailable = isPremiumThemeAvailable(
				{
					themes: {
						queries: {}
					},
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
				}, 'espresso'
			);

			expect( isAvailable ).to.be.false;
		} );

		it( 'given a theme that has not been purchased on a given site, should return false', () => {
			const isAvailable = isPremiumThemeAvailable(
				{
					sites: {
						plans: {
							2916284: {
								data: [ {
									currentPlan: true,
									productSlug: PLAN_FREE
								} ]
							}
						}
					},
					themes: {
						queries: {
							wpcom: new ThemeQueryManager( {
								items: { mood }
							} )
						}
					},
					purchases: {
						data: [
							{
								ID: 1234567,
								blog_id: 2916284,
								meta: 'espresso',
								product_slug: 'premium_theme'
							}
						]
					}
				}, 'mood', 2916284
			);

			expect( isAvailable ).to.be.false;
		} );

		it( 'given a premium squared theme and a site without the premium upgrade, should return false', () => {
			const isAvailable = isPremiumThemeAvailable(
				{
					sites: {
						plans: {
							2916284: {
								data: [ {
									currentPlan: true,
									productSlug: PLAN_FREE
								} ]
							}
						}
					},
					themes: {
						queries: {
							wpcom: new ThemeQueryManager( {
								items: { mood }
							} )
						}
					},
					purchases: {
						data: []
					}
				}, 'mood', 2916284
			);

			expect( isAvailable ).to.be.false;
		} );

		it( 'given a premium squared theme and a site with the premium upgrade, should return true', () => {
			const isAvailable = isPremiumThemeAvailable(
				{
					sites: {
						plans: {
							2916284: {
								data: [ {
									currentPlan: true,
									productSlug: PLAN_PREMIUM
								} ]
							}
						}
					},
					themes: {
						queries: {
							wpcom: new ThemeQueryManager( {
								items: { mood }
							} )
						}
					},
					purchases: {
						data: []
					}
				}, 'mood', 2916284
			);

			expect( isAvailable ).to.be.true;
		} );

		it( 'given a site with the unlimited premium themes bundle, should return true', () => {
			const isAvailable = isPremiumThemeAvailable(
				{
					sites: {
						plans: {
							2916284: {
								data: [ {
									currentPlan: true,
									productSlug: PLAN_BUSINESS
								} ]
							}
						}
					},
					themes: {
						queries: {
							wpcom: new ThemeQueryManager( {
								items: { mood }
							} )
						}
					},
					purchases: {
						data: []
					}
				}, 'mood', 2916284
			);

			expect( isAvailable ).to.be.true;
		} );
	} );

	describe( '#isThemeAvailableOnJetpackSite', () => {
		it( 'should return true if theme is already installed on Jetpack site', () => {
			const isAvailable = isThemeAvailableOnJetpackSite(
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
								items: { twentyfifteen }
							} )
						}
					}
				},
				'twentyfifteen',
				77203074
			);
			expect( isAvailable ).to.be.true;
		} );

		it( 'should return false if theme is a WP.com theme but Jetpack site doesn\'t support WP.com theme installation', () => {
			const isAvailable = isThemeAvailableOnJetpackSite(
				{
					sites: {
						items: {
							77203074: {
								ID: 77203074,
								URL: 'https://example.net',
								jetpack: true,
								options: {
									jetpack_version: '4.0'
								}
							}
						}
					},
					themes: {
						queries: {
							wpcom: new ThemeQueryManager( {
								items: { twentyfifteen }
							} )
						}
					}
				},
				'twentyfifteen',
				77203074
			);
			expect( isAvailable ).to.be.false;
		} );

		it( 'should return true if theme is a WP.com theme and Jetpack site supports WP.com theme installation', () => {
			const isAvailable = isThemeAvailableOnJetpackSite(
				{
					sites: {
						items: {
							77203074: {
								ID: 77203074,
								URL: 'https://example.net',
								jetpack: true,
								options: {
									jetpack_version: '4.8'
								}
							}
						}
					},
					themes: {
						queries: {
							wpcom: new ThemeQueryManager( {
								items: { twentyfifteen }
							} )
						}
					}
				},
				'twentyfifteen',
				77203074
			);
			expect( isAvailable ).to.be.true;
		} );
	} );

	describe( 'getWpcomParentThemeId', () => {
		it( 'should return null for non-existent theme', () => {
			const parentId = getWpcomParentThemeId(
				{
					themes: {
						queries: {}
					}
				}, 'blah'
			);
			expect( parentId ).to.be.null;
		} );

		it( 'should return null for theme with no parent', () => {
			const parentId = getWpcomParentThemeId(
				{
					themes: {
						queries: {
							wpcom: new ThemeQueryManager( {
								items: { mood }
							} )
						}
					}
				}, 'mood'
			);
			expect( parentId ).to.be.null;
		} );

		it( 'should return parent id', () => {
			const parentId = getWpcomParentThemeId(
				{
					themes: {
						queries: {
							wpcom: new ThemeQueryManager( {
								items: { sidekick }
							} )
						}
					}
				}, 'sidekick'
			);
			expect( parentId ).to.equal( 'superhero' );
		} );
	} );
} );

/**
 * External dependencies
 */
import { expect } from 'chai';
import { values } from 'lodash';

/**
 * Internal dependencies
 */
import {
	getThemes,
	getTheme,
	getThemesForQuery,
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
	getActiveTheme,
	isThemeActive,
	isThemePurchased
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
		getThemes.memoizedSelector.cache.clear();
		getTheme.memoizedSelector.cache.clear();
		getThemesForQuery.memoizedSelector.cache.clear();
		getThemesForQueryIgnoringPage.memoizedSelector.cache.clear();
		isRequestingThemesForQueryIgnoringPage.memoizedSelector.cache.clear();
	} );

	describe( '#getThemes()', () => {
		it( 'should return an array of theme objects for the site', () => {
			const themeObjects = {
				wpcom: {
					mood
				},
				77203074: {
					twentyfifteen,
					twentysixteen
				}
			};
			const state = {
				themes: {
					queries: {
						wpcom: new ThemeQueryManager( {
							items: themeObjects.wpcom
						} ),
						77203074: new ThemeQueryManager( {
							items: themeObjects[ 77203074 ]
						} )
					},

				}
			};

			expect( getThemes( state, 77203074 ) ).to.have.members( values( themeObjects[ 77203074 ] ) );
		} );
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

	describe( 'getThemesFoundForQuery()', () => {
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
				themes: {
					queries: {}
				}
			}, 2916284, { search: 'Sixteen' } );

			expect( lastPage ).to.be.null;
		} );

		it( 'should return the last page value for a site query', () => {
			const lastPage = getThemesLastPageForQuery( {
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
	} );

	( '#getThemesForQueryIgnoringPage()', () => {
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

	describe( 'isRequestingThemesForQueryIgnoringPage()', () => {
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
		it( 'given a theme and no site ID, should return the details URL', () => {
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

		it( 'given a theme and wpcom site ID, should return the details URL', () => {
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

		it( 'given a theme and Jetpack site ID, should return the details URL', () => {
			const detailsUrl = getThemeDetailsUrl(
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
			expect( detailsUrl ).to.equal( 'https://example.net/wp-admin/themes.php?theme=twentysixteen' );
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
						}
					},
					{
						id: 'mood',
						stylesheet: 'premium/mood'
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
						}
					},
					{
						id: 'mood',
						stylesheet: 'premium/mood'
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
						}
					},
					{
						id: 'twentysixteen',
						stylesheet: 'pub/twentysixteen'
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
						}
					},
					{
						id: 'twentysixteen',
						stylesheet: 'pub/twentysixteen'
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
						}
					},
					{
						id: 'twentysixteen',
						stylesheet: 'pub/twentysixteen'
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
					}
				},
				{
					id: 'mood',
					stylesheet: 'premium/mood'
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
					}
				},
				{
					id: 'twentysixteen',
					stylesheet: 'pub/twentysixteen'
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
					}
				},
				{
					id: 'mood',
					stylesheet: 'premium/mood'
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
			const signupUrl = getThemeSignupUrl( {}, {
				id: 'twentysixteen',
				stylesheet: 'pub/twentysixteen'
			} );

			expect( signupUrl ).to.equal( '/start/with-theme?ref=calypshowcase&theme=twentysixteen' );
		} );

		it( 'given a premium theme, should return the correct signup URL', () => {
			const signupUrl = getThemeSignupUrl( {}, {
				id: 'mood',
				stylesheet: 'premium/mood'
			} );

			expect( signupUrl ).to.equal( '/start/with-theme?ref=calypshowcase&theme=mood&premium=true' );
		} );
	} );

	describe( '#getActiveTheme', () => {
		it( 'given no site, should return null', () => {
			const activeTheme = getActiveTheme( {} );

			expect( activeTheme ).to.be.null;
		} );

		it( 'given a wpcom site, should return its currently active theme', () => {
			const activeTheme = getActiveTheme(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								options: {
									theme_slug: 'premium/mood'
								}
							}
						}
					}
				}, 2916284
			);

			expect( activeTheme ).to.equal( 'mood' );
		} );

		it( 'given a Jetpack site, should return its currently active theme', () => {
			const activeTheme = getActiveTheme(
				{
					sites: {
						items: {
							77203074: {
								ID: 77203074,
								jetpack: true,
								options: {
									theme_slug: 'twentysixteen'
								}
							}
						}
					}
				}, 77203074
			);

			expect( activeTheme ).to.equal( 'twentysixteen' );
		} );
	} );

	describe( '#isThemeActive', () => {
		it( 'given no theme and no site, should return false', () => {
			const isActive = isThemeActive(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								options: {
									theme_slug: 'premium/mood'
								}
							}
						}
					}
				}
			);

			expect( isActive ).to.be.false;
		} );

		it( 'given a theme but no site, should return false', () => {
			const isActive = isThemeActive(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								options: {
									theme_slug: 'premium/mood'
								}
							}
						}
					}
				}, 'mood'
			);

			expect( isActive ).to.be.false;
		} );

		it( 'given a theme and a site on which it isn\'t active, should return false', () => {
			const isActive = isThemeActive(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								options: {
									theme_slug: 'premium/mood'
								}
							}
						}
					}
				}, 'twentysixteen', 2916284
			);

			expect( isActive ).to.be.false;
		} );

		it( 'given a theme and a wpcom site on which it is active, should return true', () => {
			const isActive = isThemeActive(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								options: {
									theme_slug: 'premium/mood'
								}
							}
						}
					}
				}, 'mood', 2916284
			);

			expect( isActive ).to.be.true;
		} );

		it( 'given a theme and a Jetpack site on which it is active, should return true', () => {
			const isActive = isThemeActive(
				{
					sites: {
						items: {
							77203074: {
								ID: 77203074,
								jetpack: true,
								options: {
									theme_slug: 'twentysixteen'
								}
							}
						}
					}
				}, 'twentysixteen', 77203074
			);

			expect( isActive ).to.be.true;
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

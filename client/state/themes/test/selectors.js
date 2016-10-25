/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
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

describe( 'themes selectors', () => {
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

	describe( '#getPurchaseUrl', () => {
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

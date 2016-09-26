/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getTitle,
	getUnreadCount,
	getCappedUnreadCount,
	getFormattedTitle,
	getMeta,
	getLink
} from '../selectors';

describe( 'selectors', () => {
	describe( '#getTitle()', () => {
		it( 'should return the currently set title', () => {
			const title = getTitle( {
				documentHead: {
					title: 'My Section Title'
				}
			} );

			expect( title ).to.equal( 'My Section Title' );
		} );
	} );

	describe( '#getUnreadCount()', () => {
		it( 'should return the unread posts counter', () => {
			const unreadCount = getUnreadCount( {
				documentHead: {
					unreadCount: 3
				}
			} );

			expect( unreadCount ).to.equal( 3 );
		} );
	} );

	describe( '#getCappedUnreadCount()', () => {
		it( 'should return the capped unread posts counter', () => {
			const unreadCount = getCappedUnreadCount( {
				documentHead: {
					unreadCount: 45
				}
			} );

			expect( unreadCount ).to.equal( '40+' );
		} );
	} );

	describe( '#getFormattedTitle()', () => {
		describe( 'for site-agnostic section', () => {
			it( 'should return only "WordPress.com" if no title is set', () => {
				const formattedTitle = getFormattedTitle( {
					documentHead: {},
					sites: {
						items: {
							2916284: { ID: 2916284, name: 'WordPress.com Example Blog', URL: 'http://yourgroovydomain.com' }
						}
					},
					ui: {
						selectedSiteId: 2916284,
						section: {
							name: 'reader',
							paths: [ '/', '/read' ],
							module: 'reader',
							group: 'reader',
							secondary: true
						}
					}
				} );

				expect( formattedTitle ).to.equal( 'WordPress.com' );
			} );

			it( 'should return formatted title made up of section but not site name', () => {
				const formattedTitle = getFormattedTitle( {
					documentHead: {
						title: 'Reader',
					},
					sites: {
						items: {
							2916284: { ID: 2916284, name: 'WordPress.com Example Blog', URL: 'http://yourgroovydomain.com' }
						}
					},
					ui: {
						selectedSiteId: 2916284,
						section: {
							name: 'reader',
							paths: [ '/', '/read' ],
							module: 'reader',
							group: 'reader',
							secondary: true
						}
					}
				} );

				expect( formattedTitle ).to.equal( 'Reader — WordPress.com' );
			} );

			it( 'should return formatted title made up of section and unread count but not site name', () => {
				const formattedTitle = getFormattedTitle( {
					documentHead: {
						title: 'Reader',
						unreadCount: '12'
					},
					sites: {
						items: {
							2916284: { ID: 2916284, name: 'WordPress.com Example Blog', URL: 'http://yourgroovydomain.com' }
						}
					},
					ui: {
						selectedSiteId: 2916284,
						section: {
							name: 'reader',
							paths: [ '/', '/read' ],
							module: 'reader',
							group: 'reader',
							secondary: true
						}
					}
				} );

				expect( formattedTitle ).to.equal( '(12) Reader — WordPress.com' );
			} );
		} );

		describe( 'for site-specific section', () => {
			it( 'should return only "WordPress.com", if no title is set and no site is selected', () => {
				const formattedTitle = getFormattedTitle( {
					documentHead: {},
					sites: {
						items: {
							2916284: { ID: 2916284, name: 'WordPress.com Example Blog', URL: 'http://yourgroovydomain.com' }
						}
					},
					ui: {
						selectedSiteId: null,
						section: {
							name: 'themes',
							paths: [ '/design' ],
							module: 'my-sites/themes',
							group: 'sites',
							secondary: true
						}
					}
				} );

				expect( formattedTitle ).to.equal( 'WordPress.com' );
			} );

			it( 'should return formatted title made up of section only, for no selected site', () => {
				const formattedTitle = getFormattedTitle( {
					documentHead: {
						title: 'Themes',
					},
					sites: {
						items: {
							2916284: { ID: 2916284, name: 'WordPress.com Example Blog', URL: 'http://yourgroovydomain.com' }
						}
					},
					ui: {
						selectedSiteId: null,
						section: {
							name: 'themes',
							paths: [ '/design' ],
							module: 'my-sites/themes',
							group: 'sites',
							secondary: true
						}
					}
				} );

				expect( formattedTitle ).to.equal( 'Themes — WordPress.com' );
			} );

			it( 'should return formatted title made up of site only, for unset title', () => {
				const formattedTitle = getFormattedTitle( {
					documentHead: {
					},
					sites: {
						items: {
							2916284: { ID: 2916284, name: 'WordPress.com Example Blog', URL: 'http://yourgroovydomain.com' }
						}
					},
					ui: {
						selectedSiteId: 2916284,
						section: {
							name: 'themes',
							paths: [ '/design' ],
							module: 'my-sites/themes',
							group: 'sites',
							secondary: true
						}
					}
				} );

				expect( formattedTitle ).to.equal( 'WordPress.com Example Blog — WordPress.com' );
			} );

			it( 'should return formatted title made up of section and site name', () => {
				const formattedTitle = getFormattedTitle( {
					documentHead: {
						title: 'Themes',
					},
					sites: {
						items: {
							2916284: { ID: 2916284, name: 'WordPress.com Example Blog', URL: 'http://yourgroovydomain.com' }
						}
					},
					ui: {
						selectedSiteId: 2916284,
						section: {
							name: 'themes',
							paths: [ '/design' ],
							module: 'my-sites/themes',
							group: 'sites',
							secondary: true
						}
					}
				} );

				expect( formattedTitle ).to.equal( 'Themes ‹ WordPress.com Example Blog — WordPress.com' );
			} );
		} );
	} );

	describe( '#getMeta()', () => {
		it( 'should return the currently set metas', () => {
			const meta = getMeta( {
				documentHead: {
					meta: [
						{ property: 'og:site_name', content: 'WordPress.com' },
						{ property: 'og:type', content: 'website' }
					]
				}
			} );

			expect( meta ).to.eql( [
				{ property: 'og:site_name', content: 'WordPress.com' },
				{ property: 'og:type', content: 'website' }
			] );
		} );
	} );

	describe( '#getLink()', () => {
		it( 'should return the currently set links', () => {
			const link = getLink( {
				documentHead: {
					link: [
						{ rel: 'canonical', href: 'https://wordpress.com' }
					]
				}
			} );

			expect( link ).to.eql( [
				{ rel: 'canonical', href: 'https://wordpress.com' }
			] );
		} );
	} );
} );

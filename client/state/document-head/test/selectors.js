/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getDocumentHeadTitle,
	getDocumentHeadUnreadCount,
	getDocumentHeadCappedUnreadCount,
	getDocumentHeadFormattedTitle,
	getDocumentHeadMeta,
	getDocumentHeadLink,
} from '../selectors';

describe( 'selectors', () => {
	beforeEach( () => {
		getDocumentHeadFormattedTitle.memoizedSelector.cache.clear();
	} );

	describe( '#getDocumentHeadTitle()', () => {
		test( 'should return the currently set title', () => {
			const title = getDocumentHeadTitle( {
				documentHead: {
					title: 'My Section Title',
				},
			} );

			expect( title ).to.equal( 'My Section Title' );
		} );
	} );

	describe( '#getDocumentHeadUnreadCount()', () => {
		test( 'should return the unread posts counter', () => {
			const unreadCount = getDocumentHeadUnreadCount( {
				documentHead: {
					unreadCount: 3,
				},
			} );

			expect( unreadCount ).to.equal( 3 );
		} );
	} );

	describe( '#getDocumentHeadCappedUnreadCount()', () => {
		test( 'should return the capped unread posts counter', () => {
			const unreadCount = getDocumentHeadCappedUnreadCount( {
				documentHead: {
					unreadCount: 45,
				},
			} );

			expect( unreadCount ).to.equal( '40+' );
		} );
	} );

	describe( '#getDocumentHeadFormattedTitle()', () => {
		describe( 'for site-agnostic section', () => {
			test( 'should return only "WordPress.com" if no title is set', () => {
				const formattedTitle = getDocumentHeadFormattedTitle( {
					documentHead: {},
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								name: 'WordPress.com Example Blog',
								URL: 'http://yourgroovydomain.com',
							},
						},
					},
					ui: {
						selectedSiteId: 2916284,
						section: {
							name: 'reader',
							paths: [ '/', '/read' ],
							module: 'reader',
							group: 'reader',
						},
					},
				} );

				expect( formattedTitle ).to.equal( 'WordPress.com' );
			} );

			test( 'should return formatted title made up of section but not site name', () => {
				const formattedTitle = getDocumentHeadFormattedTitle( {
					documentHead: {
						title: 'Reader',
					},
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								name: 'WordPress.com Example Blog',
								URL: 'http://yourgroovydomain.com',
							},
						},
					},
					ui: {
						selectedSiteId: 2916284,
						section: {
							name: 'reader',
							paths: [ '/', '/read' ],
							module: 'reader',
							group: 'reader',
						},
					},
				} );

				expect( formattedTitle ).to.equal( 'Reader — WordPress.com' );
			} );

			test( 'should return formatted title made up of section and unread count but not site name', () => {
				const formattedTitle = getDocumentHeadFormattedTitle( {
					documentHead: {
						title: 'Reader',
						unreadCount: '12',
					},
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								name: 'WordPress.com Example Blog',
								URL: 'http://yourgroovydomain.com',
							},
						},
					},
					ui: {
						selectedSiteId: 2916284,
						section: {
							name: 'reader',
							paths: [ '/', '/read' ],
							module: 'reader',
							group: 'reader',
						},
					},
				} );

				expect( formattedTitle ).to.equal( '(12) Reader — WordPress.com' );
			} );
		} );

		describe( 'for site-specific section', () => {
			test( 'should return only "WordPress.com", if no title is set and no site is selected', () => {
				const formattedTitle = getDocumentHeadFormattedTitle( {
					documentHead: {},
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								name: 'WordPress.com Example Blog',
								URL: 'http://yourgroovydomain.com',
							},
						},
					},
					ui: {
						selectedSiteId: null,
						section: {
							name: 'themes',
							paths: [ '/themes' ],
							module: 'my-sites/themes',
							group: 'sites',
						},
					},
				} );

				expect( formattedTitle ).to.equal( 'WordPress.com' );
			} );

			test( 'should return formatted title made up of section only, for no selected site', () => {
				const formattedTitle = getDocumentHeadFormattedTitle( {
					documentHead: {
						title: 'Themes',
					},
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								name: 'WordPress.com Example Blog',
								URL: 'http://yourgroovydomain.com',
							},
						},
					},
					ui: {
						selectedSiteId: null,
						section: {
							name: 'themes',
							paths: [ '/themes' ],
							module: 'my-sites/themes',
							group: 'sites',
						},
					},
				} );

				expect( formattedTitle ).to.equal( 'Themes — WordPress.com' );
			} );

			test( 'should return formatted title made up of site only, for unset title', () => {
				const formattedTitle = getDocumentHeadFormattedTitle( {
					documentHead: {},
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								name: 'WordPress.com Example Blog',
								URL: 'http://yourgroovydomain.com',
							},
						},
					},
					ui: {
						selectedSiteId: 2916284,
						section: {
							name: 'themes',
							paths: [ '/themes' ],
							module: 'my-sites/themes',
							group: 'sites',
						},
					},
				} );

				expect( formattedTitle ).to.equal( 'WordPress.com Example Blog — WordPress.com' );
			} );

			test( 'should return formatted title made up of section and site name', () => {
				const formattedTitle = getDocumentHeadFormattedTitle( {
					documentHead: {
						title: 'Themes',
					},
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								name: 'WordPress.com Example Blog',
								URL: 'http://yourgroovydomain.com',
							},
						},
					},
					ui: {
						selectedSiteId: 2916284,
						section: {
							name: 'themes',
							paths: [ '/themes' ],
							module: 'my-sites/themes',
							group: 'sites',
						},
					},
				} );

				expect( formattedTitle ).to.equal( 'Themes ‹ WordPress.com Example Blog — WordPress.com' );
			} );
		} );
	} );

	describe( '#getDocumentHeadMeta()', () => {
		test( 'should return the currently set metas', () => {
			const meta = getDocumentHeadMeta( {
				documentHead: {
					meta: [
						{ property: 'og:site_name', content: 'WordPress.com' },
						{ property: 'og:type', content: 'website' },
					],
				},
			} );

			expect( meta ).to.eql( [
				{ property: 'og:site_name', content: 'WordPress.com' },
				{ property: 'og:type', content: 'website' },
			] );
		} );
	} );

	describe( '#getDocumentHeadLink()', () => {
		test( 'should return the currently set links', () => {
			const link = getDocumentHeadLink( {
				documentHead: {
					link: [ { rel: 'canonical', href: 'https://wordpress.com' } ],
				},
			} );

			expect( link ).to.eql( [ { rel: 'canonical', href: 'https://wordpress.com' } ] );
		} );
	} );
} );

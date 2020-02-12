/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getApplication,
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
	getSection,
	getSectionName,
	getSectionGroup,
	isSiteSection,
	isSectionIsomorphic,
	hasSidebar,
} from '../selectors';
import { userState } from 'state/selectors/test/fixtures/user-state';

describe( 'selectors', () => {
	describe( '#getApplication()', () => {
		test( 'should return null if application is set', () => {
			const selected = getApplication( {
				ui: {
					application: null,
				},
			} );

			expect( selected ).to.be.null;
		} );

		test( 'should return the object for the selected site', () => {
			const selected = getSelectedSite( {
				ui: {
					application: 'calypso',
				},
			} );

			expect( selected ).to.eql( 'calypso' );
		} );
	} );

	describe( '#getSelectedSite()', () => {
		test( 'should return null if no site is selected', () => {
			const selected = getSelectedSite( {
				ui: {
					selectedSiteId: null,
				},
			} );

			expect( selected ).to.be.null;
		} );

		test( 'should return the object for the selected site', () => {
			const selected = getSelectedSite( {
				...userState,
				sites: {
					items: {
						2916284: {
							ID: 2916284,
							name: 'WordPress.com Example Blog',
							URL: 'https://example.com',
						},
					},
				},
				siteSettings: {
					items: {},
				},
				ui: {
					selectedSiteId: 2916284,
				},
			} );

			expect( selected ).to.eql( {
				ID: 2916284,
				name: 'WordPress.com Example Blog',
				URL: 'https://example.com',
				domain: 'example.com',
				hasConflict: false,
				is_customizable: false,
				is_previewable: false,
				options: {},
				slug: 'example.com',
				title: 'WordPress.com Example Blog',
			} );
		} );
	} );

	describe( '#getSelectedSiteId()', () => {
		test( 'should return null if no site is selected', () => {
			const selected = getSelectedSiteId( {
				...userState,
				ui: {
					selectedSiteId: null,
				},
			} );

			expect( selected ).to.be.null;
		} );

		test( 'should return ID for the selected site', () => {
			const selected = getSelectedSiteId( {
				ui: {
					selectedSiteId: 2916284,
				},
			} );

			expect( selected ).to.eql( 2916284 );
		} );
	} );

	describe( '#getSelectedSiteSlug()', () => {
		test( 'should return null if no site is selected', () => {
			const slug = getSelectedSiteSlug( {
				ui: {
					selectedSiteSlug: null,
				},
			} );

			expect( slug ).to.be.null;
		} );

		test( 'should return slug for the selected site', () => {
			const slug = getSelectedSiteSlug( {
				sites: {
					items: {
						2916284: {
							ID: 2916284,
							name: 'WordPress.com Example Blog',
							URL: 'https://example.com',
						},
					},
				},
				ui: {
					selectedSiteId: 2916284,
				},
			} );

			expect( slug ).to.eql( 'example.com' );
		} );
	} );

	describe( '#getSection()', () => {
		test( 'should return false if no section is assigned', () => {
			const section = getSection( {
				ui: {
					section: false,
				},
			} );

			expect( section ).to.eql( false );
		} );

		test( 'should return the current section if there is one assigned', () => {
			const sectionObj = {
				name: 'post-editor',
				paths: [ '/post', '/page' ],
				module: 'post-editor',
				group: 'editor',
				secondary: true,
			};
			const section = getSection( {
				ui: {
					section: sectionObj,
				},
			} );

			expect( section ).to.equal( sectionObj );
		} );
	} );

	describe( '#getSectionName()', () => {
		test( 'should return null if no section is assigned', () => {
			const sectionName = getSectionName( {
				ui: {
					section: false,
				},
			} );

			expect( sectionName ).to.be.null;
		} );

		test( 'should return the name of the current section', () => {
			const sectionName = getSectionName( {
				ui: {
					section: {
						name: 'post-editor',
						paths: [ '/post', '/page' ],
						module: 'post-editor',
						group: 'editor',
						secondary: true,
					},
				},
			} );

			expect( sectionName ).to.equal( 'post-editor' );
		} );
	} );

	describe( 'getSectionGroup()', () => {
		test( 'should return null if no section is assigned', () => {
			const sectionName = getSectionGroup( {
				ui: {
					section: false,
				},
			} );

			expect( sectionName ).to.be.null;
		} );

		test( 'should return the name of the current section', () => {
			const sectionName = getSectionGroup( {
				ui: {
					section: {
						name: 'post-editor',
						paths: [ '/post', '/page' ],
						module: 'post-editor',
						group: 'editor',
						secondary: true,
					},
				},
			} );

			expect( sectionName ).to.equal( 'editor' );
		} );
	} );

	describe( 'isSiteSection()', () => {
		test( 'should return false if no section is assigned', () => {
			const siteSection = isSiteSection( {
				ui: {
					section: false,
				},
			} );

			expect( siteSection ).to.be.false;
		} );

		test( 'should return false if the current section is not site-specific', () => {
			const siteSection = isSiteSection( {
				ui: {
					section: {
						name: 'reader',
						paths: [ '/me' ],
						module: 'me',
						group: 'me',
						secondary: true,
					},
				},
			} );

			expect( siteSection ).to.be.false;
		} );

		test( 'should return true if the current section is site-specific', () => {
			const siteSection = isSiteSection( {
				ui: {
					section: {
						name: 'post-editor',
						paths: [ '/post', '/page' ],
						module: 'post-editor',
						group: 'editor',
						secondary: true,
					},
				},
			} );

			expect( siteSection ).to.be.true;
		} );
	} );

	describe( '#isSectionIsomorphic()', () => {
		test( 'should return false if there is no section currently selected', () => {
			const selected = isSectionIsomorphic( {
				ui: {
					section: false,
				},
			} );

			expect( selected ).to.be.false;
		} );

		test( 'should return true if current section is isomorphic', () => {
			const section = {
				enableLoggedOut: true,
				group: 'sites',
				isomorphic: true,
				module: 'my-sites/themes',
				name: 'themes',
				paths: [ '/themes' ],
				secondary: false,
			};

			const selected = isSectionIsomorphic( {
				ui: { section },
			} );

			expect( selected ).to.be.true;
		} );
	} );

	describe( '#hasSidebar()', () => {
		test( 'should return false if set', () => {
			expect( hasSidebar( { ui: { hasSidebar: false } } ) ).to.be.false;
		} );

		test( 'should be true if true and secondary does not override it', () => {
			expect(
				hasSidebar( {
					ui: {
						hasSidebar: true,
						section: {},
					},
				} )
			).to.be.true;
		} );

		test( 'should fall back to the secondary prop on the current section when hasSidebar is true', () => {
			expect(
				hasSidebar( {
					ui: {
						hasSidebar: true,
						section: {
							secondary: false,
						},
					},
				} )
			).to.be.false;
		} );
	} );
} );

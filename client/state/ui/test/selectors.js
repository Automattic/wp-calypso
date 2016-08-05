/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getSelectedSite,
	getSelectedSiteId,
	getSectionName,
	isSectionIsomorphic,
	hasSidebar
} from '../selectors';

describe( 'selectors', () => {
	describe( '#getSelectedSite()', () => {
		it( 'should return null if no site is selected', () => {
			const selected = getSelectedSite( {
				ui: {
					selectedSiteId: null
				}
			} );

			expect( selected ).to.be.null;
		} );

		it( 'should return the object for the selected site', () => {
			const selected = getSelectedSite( {
				sites: {
					items: {
						2916284: { ID: 2916284, name: 'WordPress.com Example Blog', URL: 'https://example.com' }
					}
				},
				ui: {
					selectedSiteId: 2916284
				}
			} );

			expect( selected ).to.eql( {
				ID: 2916284,
				name: 'WordPress.com Example Blog',
				URL: 'https://example.com',
				domain: 'example.com',
				hasConflict: false,
				is_customizable: false,
				is_previewable: false,
				options: {
					default_post_format: 'standard',
				},
				slug: 'example.com',
				title: 'WordPress.com Example Blog',
			} );
		} );
	} );

	describe( '#getSelectedSiteId()', () => {
		it( 'should return null if no site is selected', () => {
			const selected = getSelectedSiteId( {
				ui: {
					selectedSiteId: null
				}
			} );

			expect( selected ).to.be.null;
		} );

		it( 'should return ID for the selected site', () => {
			const selected = getSelectedSiteId( {
				ui: {
					selectedSiteId: 2916284
				}
			} );

			expect( selected ).to.eql( 2916284 );
		} );
	} );

	describe( '#getSectionName()', () => {
		it( 'should return null if no section is assigned', () => {
			const sectionName = getSectionName( {
				ui: {
					section: false
				}
			} );

			expect( sectionName ).to.be.null;
		} );

		it( 'should return the name of the current section', () => {
			const sectionName = getSectionName( {
				ui: {
					section: {
						name: 'post-editor',
						paths: [ '/post', '/page' ],
						module: 'post-editor',
						group: 'editor',
						secondary: true
					}
				}
			} );

			expect( sectionName ).to.equal( 'post-editor' );
		} );
	} );

	describe( '#isSectionIsomorphic()', () => {
		it( 'should return false if there is no section currently selected', () => {
			const selected = isSectionIsomorphic( {
				ui: {
					section: false
				}
			} );

			expect( selected ).to.be.false;
		} );

		it( 'should return true if current section is isomorphic', () => {
			const section = {
				enableLoggedOut: true,
				group: 'sites',
				isomorphic: true,
				module: 'my-sites/themes',
				name: 'themes',
				paths: [ '/design' ],
				secondary: false
			};

			const selected = isSectionIsomorphic( {
				ui: { section }
			} );

			expect( selected ).to.be.true;
		} );
	} );

	describe( '#hasSidebar()', () => {
		it( 'should return false if set', () => {
			expect( hasSidebar( { ui: { hasSidebar: false } } ) ).to.be.false;
		} );

		it( 'should be true if true and secondary does not override it', () => {
			expect( hasSidebar( {
				ui: {
					hasSidebar: true,
					section: {}
				}
			} ) ).to.be.true;
		} );

		it( 'should fall back to the secondary prop on the current section when hasSidebar is true', () => {
			expect( hasSidebar( {
				ui: {
					hasSidebar: true,
					section: {
						secondary: false
					}
				}
			} ) ).to.be.false;
		} );
	} );
} );

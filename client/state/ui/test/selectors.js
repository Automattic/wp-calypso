import { userState } from 'calypso/state/selectors/test/fixtures/user-state';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
	getSection,
	getSectionName,
	getSectionGroup,
	isSiteSection,
	getPrevSelectedSiteId,
} from '../selectors';

describe( 'selectors', () => {
	describe( '#getSelectedSite()', () => {
		test( 'should return null if no site is selected', () => {
			const selected = getSelectedSite( {
				ui: {
					selectedSiteId: null,
				},
			} );

			expect( selected ).toBeNull();
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

			expect( selected ).toEqual( {
				ID: 2916284,
				name: 'WordPress.com Example Blog',
				URL: 'https://example.com',
				domain: 'example.com',
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

			expect( selected ).toBeNull();
		} );

		test( 'should return ID for the selected site', () => {
			const selected = getSelectedSiteId( {
				ui: {
					selectedSiteId: 2916284,
				},
			} );

			expect( selected ).toEqual( 2916284 );
		} );
	} );

	describe( '#getPrevSelectedSiteId()', () => {
		test( 'should return null if no site was previously selected', () => {
			const selected = getPrevSelectedSiteId( {
				...userState,
				ui: {
					prevSelectedSiteId: null,
				},
			} );

			expect( selected ).toBeNull();
		} );

		test( 'should return ID for the previously selected site', () => {
			const selected = getPrevSelectedSiteId( {
				ui: {
					prevSelectedSiteId: 2916284,
				},
			} );

			expect( selected ).toEqual( 2916284 );
		} );
	} );

	describe( '#getSelectedSiteSlug()', () => {
		test( 'should return null if no site is selected', () => {
			const slug = getSelectedSiteSlug( {
				ui: {
					selectedSiteSlug: null,
				},
			} );

			expect( slug ).toBeNull();
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

			expect( slug ).toEqual( 'example.com' );
		} );
	} );

	describe( '#getSection()', () => {
		test( 'should return false if no section is assigned', () => {
			const section = getSection( {
				ui: {
					section: false,
				},
			} );

			expect( section ).toEqual( false );
		} );

		test( 'should return the current section if there is one assigned', () => {
			const sectionObj = {
				name: 'post-editor',
				paths: [ '/post', '/page' ],
				module: 'post-editor',
				group: 'editor',
			};
			const section = getSection( {
				ui: {
					section: sectionObj,
				},
			} );

			expect( section ).toEqual( sectionObj );
		} );
	} );

	describe( '#getSectionName()', () => {
		test( 'should return null if no section is assigned', () => {
			const sectionName = getSectionName( {
				ui: {
					section: false,
				},
			} );

			expect( sectionName ).toBeNull();
		} );

		test( 'should return the name of the current section', () => {
			const sectionName = getSectionName( {
				ui: {
					section: {
						name: 'post-editor',
						paths: [ '/post', '/page' ],
						module: 'post-editor',
						group: 'editor',
					},
				},
			} );

			expect( sectionName ).toEqual( 'post-editor' );
		} );
	} );

	describe( 'getSectionGroup()', () => {
		test( 'should return null if no section is assigned', () => {
			const sectionName = getSectionGroup( {
				ui: {
					section: false,
				},
			} );

			expect( sectionName ).toBeNull();
		} );

		test( 'should return the name of the current section', () => {
			const sectionName = getSectionGroup( {
				ui: {
					section: {
						name: 'post-editor',
						paths: [ '/post', '/page' ],
						module: 'post-editor',
						group: 'editor',
					},
				},
			} );

			expect( sectionName ).toEqual( 'editor' );
		} );
	} );

	describe( 'isSiteSection()', () => {
		test( 'should return false if no section is assigned', () => {
			const siteSection = isSiteSection( {
				ui: {
					section: false,
				},
			} );

			expect( siteSection ).toBe( false );
		} );

		test( 'should return false if the current section is not site-specific', () => {
			const siteSection = isSiteSection( {
				ui: {
					section: {
						name: 'reader',
						paths: [ '/me' ],
						module: 'me',
						group: 'me',
					},
				},
			} );

			expect( siteSection ).toBe( false );
		} );

		test( 'should return true if the current section is site-specific', () => {
			const siteSection = isSiteSection( {
				ui: {
					section: {
						name: 'post-editor',
						paths: [ '/post', '/page' ],
						module: 'post-editor',
						group: 'editor',
					},
				},
			} );

			expect( siteSection ).toBe( true );
		} );
	} );
} );

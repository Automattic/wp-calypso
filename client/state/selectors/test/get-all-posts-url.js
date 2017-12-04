/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getAllPostsUrl } from '../';
import { userState } from 'state/selectors/test/fixtures/user-state';

describe( 'getAllPostsUrl()', () => {
	describe( 'when post type is "page"', () => {
		test( 'should have a base path of "/pages"', () => {
			const state = {
				...userState,
				ui: {},
			};
			const actual = getAllPostsUrl( state, 'page' );
			const expected = '/pages';

			expect( actual ).to.eql( expected );
		} );
	} );

	describe( 'when post type is "post"', () => {
		test( 'should have a base path of "/posts"', () => {
			const state = {
				...userState,
				ui: {},
			};
			const actual = getAllPostsUrl( state, 'post' );
			const expected = '/posts';

			expect( actual ).to.eql( expected );
		} );

		describe( 'when site is jetpack', () => {
			test( 'should not add "/my" to the url', () => {
				const state = {
					...userState,
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.com',
								jetpack: true,
							},
						},
					},
					siteSettings: {
						items: {},
					},
					ui: {
						selectedSiteId: 2916284,
					},
				};
				const actual = getAllPostsUrl( state, 'post' );
				const expected = '/posts/example.com';

				expect( actual ).to.eql( expected );
			} );
		} );

		describe( 'when site is a single user site', () => {
			test( 'should not add "/my" to the url', () => {
				const state = {
					...userState,
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.com',
								single_user_site: true,
							},
						},
					},
					siteSettings: {
						items: {},
					},
					ui: {
						selectedSiteId: 2916284,
					},
				};
				const actual = getAllPostsUrl( state, 'post' );
				const expected = '/posts/example.com';

				expect( actual ).to.eql( expected );
			} );
		} );

		describe( 'when site is neither jetpack or a single user site', () => {
			test( 'should add "/my" to the url', () => {
				const state = {
					...userState,
					sites: {
						items: {
							2916284: {
								ID: 2916284,
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
				};
				const actual = getAllPostsUrl( state, 'post' );
				const expected = '/posts/my/example.com';

				expect( actual ).to.eql( expected );
			} );
		} );
	} );
	describe( 'when post type is neither "post" or "page"', () => {
		test( 'should have a base path of "/types/" + the custom type', () => {
			const state = {
				...userState,
				ui: {},
			};
			const actual = getAllPostsUrl( state, 'another-post-type' );
			const expected = '/types/another-post-type';

			expect( actual ).to.eql( expected );
		} );
	} );

	describe( 'when site prop is present', () => {
		test( 'should add the site fragment', () => {
			const state = {
				...userState,
				sites: {
					items: {
						2916284: {
							ID: 2916284,
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
			};

			const actual = getAllPostsUrl( state, 'page' );
			const expected = '/pages/example.com';

			expect( actual ).to.eql( expected );
		} );
	} );
} );

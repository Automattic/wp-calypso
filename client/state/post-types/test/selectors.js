import { getPostTypes, getPostType } from '../selectors';

describe( 'selectors', () => {
	describe( '#getPostTypes()', () => {
		test( 'should return null if the site is not tracked', () => {
			const postTypes = getPostTypes(
				{
					postTypes: {
						items: {},
					},
				},
				2916284
			);

			expect( postTypes ).toBeNull();
		} );

		test( 'should return the post types for a site', () => {
			const postTypes = getPostTypes(
				{
					postTypes: {
						items: {
							2916284: {
								post: { name: 'post', label: 'Posts' },
							},
						},
					},
				},
				2916284
			);

			expect( postTypes ).toEqual( {
				post: { name: 'post', label: 'Posts' },
			} );
		} );
	} );

	describe( '#getPostType()', () => {
		test( 'should return null if there are no known post types for the site', () => {
			const postType = getPostType(
				{
					postTypes: {
						items: {},
					},
				},
				2916284,
				'post'
			);

			expect( postType ).toBeNull();
		} );

		test( 'should return null if the post type slug is unknown for the site', () => {
			const postType = getPostType(
				{
					postTypes: {
						items: {
							2916284: {},
						},
					},
				},
				2916284,
				'post'
			);

			expect( postType ).toBeNull();
		} );

		test( 'should return the post type', () => {
			const postType = getPostType(
				{
					postTypes: {
						items: {
							2916284: {
								post: { name: 'post', label: 'Posts' },
							},
						},
					},
				},
				2916284,
				'post'
			);

			expect( postType ).toEqual( { name: 'post', label: 'Posts' } );
		} );
	} );
} );

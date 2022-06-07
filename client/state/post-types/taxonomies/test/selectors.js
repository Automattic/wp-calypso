import {
	isRequestingPostTypeTaxonomies,
	getPostTypeTaxonomies,
	getPostTypeTaxonomy,
} from '../selectors';

describe( 'selectors', () => {
	describe( 'isRequestingPostTypeTaxonomies()', () => {
		test( 'should return false if no request has been made for site', () => {
			const isRequesting = isRequestingPostTypeTaxonomies(
				{
					postTypes: {
						taxonomies: {
							requesting: {},
						},
					},
				},
				2916284,
				'post'
			);

			expect( isRequesting ).toBe( false );
		} );

		test( 'should return false if no request has been made for site post type', () => {
			const isRequesting = isRequestingPostTypeTaxonomies(
				{
					postTypes: {
						taxonomies: {
							requesting: {
								2916284: {
									page: true,
								},
							},
						},
					},
				},
				2916284,
				'post'
			);

			expect( isRequesting ).toBe( false );
		} );

		test( 'should return false if request has finished for site post type', () => {
			const isRequesting = isRequestingPostTypeTaxonomies(
				{
					postTypes: {
						taxonomies: {
							requesting: {
								2916284: {
									page: true,
									post: false,
								},
							},
						},
					},
				},
				2916284,
				'post'
			);

			expect( isRequesting ).toBe( false );
		} );

		test( 'should return true if requesting for site post type', () => {
			const isRequesting = isRequestingPostTypeTaxonomies(
				{
					postTypes: {
						taxonomies: {
							requesting: {
								2916284: {
									page: true,
									post: true,
								},
							},
						},
					},
				},
				2916284,
				'post'
			);

			expect( isRequesting ).toBe( true );
		} );
	} );

	describe( 'getPostTypeTaxonomies()', () => {
		test( 'should return null if taxonomies are not known', () => {
			const taxonomies = getPostTypeTaxonomies(
				{
					postTypes: {
						taxonomies: {
							items: {},
						},
					},
				},
				2916284,
				'post'
			);

			expect( taxonomies ).toBeNull();
		} );

		test( 'should return an array of known taxonomies', () => {
			const taxonomies = getPostTypeTaxonomies(
				{
					postTypes: {
						taxonomies: {
							items: {
								2916284: {
									post: [
										{
											name: 'category',
											label: 'Categories',
										},
										{
											name: 'post_tag',
											label: 'Tags',
										},
									],
								},
							},
						},
					},
				},
				2916284,
				'post'
			);

			expect( taxonomies ).toEqual( [
				{ name: 'category', label: 'Categories' },
				{ name: 'post_tag', label: 'Tags' },
			] );
		} );
	} );

	describe( 'getPostTypeTaxonomy', () => {
		test( 'should return null if taxonomies are not known', () => {
			const taxonomy = getPostTypeTaxonomy(
				{
					postTypes: {
						taxonomies: {
							items: {},
						},
					},
				},
				2916284,
				'post',
				'post_tag'
			);

			expect( taxonomy ).toBeNull();
		} );

		test( 'should return null if post type is not known', () => {
			const taxonomy = getPostTypeTaxonomy(
				{
					postTypes: {
						taxonomies: {
							items: {
								2916284: {
									post: {
										category: {
											name: 'category',
											label: 'Categories',
										},
										post_tag: {
											name: 'post_tag',
											label: 'Tags',
										},
									},
								},
							},
						},
					},
				},
				2916284,
				'page',
				'post_tag'
			);

			expect( taxonomy ).toBeNull();
		} );

		test( 'should return null if taxonomy is not known', () => {
			const taxonomy = getPostTypeTaxonomy(
				{
					postTypes: {
						taxonomies: {
							items: {
								2916284: {
									post: {
										category: {
											name: 'category',
											label: 'Categories',
										},
										post_tag: {
											name: 'post_tag',
											label: 'Tags',
										},
									},
								},
							},
						},
					},
				},
				2916284,
				'post',
				'not_a_taxonomy'
			);

			expect( taxonomy ).toBeNull();
		} );

		test( 'should return a known taxonomy', () => {
			const taxonomy = getPostTypeTaxonomy(
				{
					postTypes: {
						taxonomies: {
							items: {
								2916284: {
									post: {
										category: {
											name: 'category',
											label: 'Categories',
										},
										post_tag: {
											name: 'post_tag',
											label: 'Tags',
										},
									},
								},
							},
						},
					},
				},
				2916284,
				'post',
				'post_tag'
			);

			expect( taxonomy ).toEqual( {
				name: 'post_tag',
				label: 'Tags',
			} );
		} );
	} );
} );

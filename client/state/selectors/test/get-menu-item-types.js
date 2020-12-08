/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getMenuItemTypes from 'calypso/state/selectors/get-menu-item-types';

describe( 'getMenuItemTypes()', () => {
	const defaultItems = [
		{
			name: 'page',
			family: 'post_type',
			icon: 'document',
			renderer: 'renderPostOptions',
			show: true,
			createLink: '/page/2916284/new',
			gaEventLabel: 'Page',
		},
		{
			name: 'custom',
			family: 'custom',
			icon: 'link',
			renderer: 'renderLinkOptions',
			show: true,
			gaEventLabel: 'Link',
		},
		{
			name: 'category',
			family: 'taxonomy',
			icon: 'category',
			renderer: 'renderTaxonomyOptions',
			show: true,
			createLink: 'http://ribs.com/wp-admin/edit-tags.php?taxonomy=category',
			gaEventLabel: 'Category',
		},
		{
			name: 'post_tag',
			family: 'taxonomy',
			icon: 'tag',
			renderer: 'renderTaxonomyOptions',
			show: true,
			createLink: 'http://ribs.com/wp-admin/edit-tags.php?taxonomy=post_tag',
			gaEventLabel: 'Tag',
		},
		{
			name: 'post_format',
			family: 'taxonomy',
			icon: 'summary',
			renderer: 'renderTaxonomyContents',
			show: false,
			gaEventLabel: 'Post Format',
		},
		{
			name: 'post',
			family: 'post_type',
			icon: 'standard',
			renderer: 'renderPostOptions',
			show: true,
			createLink: '/post/2916284/new',
			gaEventLabel: 'Post',
		},
	];

	test( 'should return an empty array if the site is untracked', () => {
		const state = {
			sites: {
				items: {},
			},
		};
		const items = getMenuItemTypes( state, 2916284 );

		expect( items ).to.eql( [] );
	} );

	test( 'should return the default items if the site has not post types', () => {
		const state = {
			sites: {
				items: {
					2916284: {
						ID: 2916284,
						slug: 'chicken',
						options: {
							admin_url: 'http://ribs.com/wp-admin/',
						},
					},
				},
			},
			postTypes: {
				items: {},
			},
		};
		const items = getMenuItemTypes( state, 2916284 );

		expect( items ).to.eql( defaultItems );
	} );

	test( 'should merge the default items with post types', () => {
		const state = {
			sites: {
				items: {
					2916284: {
						ID: 2916284,
						slug: 'chicken',
						options: {
							admin_url: 'http://ribs.com/wp-admin/',
						},
					},
				},
			},
			postTypes: {
				items: {
					2916284: {
						testimonial: {
							name: 'testimonial',
							label: 'Testimonial',
							api_queryable: true,
							map_meta_cap: true,
							labels: {
								not_found: 'Testimonial not found',
							},
						},
					},
				},
			},
		};
		const items = getMenuItemTypes( state, 2916284 );

		expect( items ).to.eql( [
			...defaultItems,
			{
				createLink: '/edit/testimonial/chicken',
				family: 'post_type',
				gaEventLabel: 'Testimonial',
				icon: 'standard',
				label: 'Testimonial',
				name: 'testimonial',
				notFoundLabel: 'Testimonial not found.',
				renderer: 'renderPostOptions',
				show: true,
			},
		] );
	} );
} );

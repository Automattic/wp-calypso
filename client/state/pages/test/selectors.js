/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isFrontPage, isPostsPage } from '../selectors';

describe( 'selectors', () => {
	describe( 'isFrontPage()', () => {
		test( 'should return true if the page is set as the front page', () => {
			const result = isFrontPage(
				{
					siteSettings: {
						items: {
							77203074: {
								show_on_front: 'page',
								page_on_front: 1,
							},
						},
					},
				},
				77203074,
				1
			);

			expect( result ).to.eql( true );
		} );

		test( 'should return false if the page is not set as the front page', () => {
			const result = isFrontPage(
				{
					siteSettings: {
						items: {
							77203074: {
								show_on_front: 'page',
								page_on_front: 2,
							},
						},
					},
				},
				77203074,
				1
			);

			expect( result ).to.eql( false );
		} );

		test( 'should return false if a static page is not set as the front page', () => {
			const result = isFrontPage(
				{
					siteSettings: {
						items: {
							77203074: {
								show_on_front: 'posts',
								page_on_front: 0,
							},
						},
					},
				},
				77203074,
				1
			);

			expect( result ).to.eql( false );
		} );

		test( 'should return false if the site is not known', () => {
			const result = isFrontPage(
				{
					siteSettings: {
						items: {},
					},
				},
				77203074,
				1
			);

			expect( result ).to.equal( false );
		} );
	} );

	describe( 'isPostsPage()', () => {
		test( 'should return true if the page is set as the posts page', () => {
			const result = isPostsPage(
				{
					siteSettings: {
						items: {
							77203074: {
								page_for_posts: 1,
							},
						},
					},
				},
				77203074,
				1
			);

			expect( result ).to.eql( true );
		} );

		test( 'should return false if the page is not set as the posts page', () => {
			const result = isPostsPage(
				{
					siteSettings: {
						items: {
							77203074: {
								page_for_posts: 2,
							},
						},
					},
				},
				77203074,
				1
			);

			expect( result ).to.eql( false );
		} );

		test( 'should return false if the site is not known', () => {
			const result = isPostsPage(
				{
					siteSettings: {
						items: {},
					},
				},
				77203074,
				1
			);

			expect( result ).to.equal( false );
		} );
	} );
} );

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getNormalizedPostsQuery,
	getSerializedPostsQuery,
	getSerializedPostsQueryWithoutPage,
	applyQueryToPostsList
} from '../utils';

describe( 'utils', () => {
	describe( '#getNormalizedPostsQuery()', () => {
		it( 'should exclude default values', () => {
			const query = getNormalizedPostsQuery( {
				page: 4,
				number: 20
			} );

			expect( query ).to.eql( {
				page: 4
			} );
		} );
	} );

	describe( '#getSerializedPostsQuery()', () => {
		it( 'should return a JSON string of a normalized query', () => {
			const serializedQuery = getSerializedPostsQuery( {
				type: 'page',
				page: 1
			} );

			expect( serializedQuery ).to.equal( '{"type":"page"}' );
		} );

		it( 'should lowercase the result', () => {
			const serializedQuery = getSerializedPostsQuery( {
				search: 'HeLlO'
			} );

			expect( serializedQuery ).to.equal( '{"search":"hello"}' );
		} );

		it( 'should prefix site ID if specified', () => {
			const serializedQuery = getSerializedPostsQuery( {
				search: 'HeLlO'
			}, 2916284 );

			expect( serializedQuery ).to.equal( '2916284:{"search":"hello"}' );
		} );
	} );

	describe( '#getSerializedPostsQueryWithoutPage()', () => {
		it( 'should return a JSON string of a normalized query omitting page', () => {
			const serializedQuery = getSerializedPostsQueryWithoutPage( {
				type: 'page',
				page: 2
			} );

			expect( serializedQuery ).to.equal( '{"type":"page"}' );
		} );

		it( 'should lowercase the result', () => {
			const serializedQuery = getSerializedPostsQueryWithoutPage( {
				search: 'HeLlO',
				page: 2
			} );

			expect( serializedQuery ).to.equal( '{"search":"hello"}' );
		} );

		it( 'should prefix site ID if specified', () => {
			const serializedQuery = getSerializedPostsQueryWithoutPage( {
				search: 'HeLlO',
				page: 2
			}, 2916284 );

			expect( serializedQuery ).to.equal( '2916284:{"search":"hello"}' );
		} );
	} );

	describe( '#applyQueryToPostsList()', () => {
		const post1 = {
			ID: 841,
			site_ID: 2916284,
			global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
			title: 'Hello World',
			date: '2016-03-25T15:47:33-04:00',
			modified: '2016-04-29T11:53:53-04:00',
			tags: {
				Tagged: {
					ID: 17695,
					name: 'Tagged!',
					slug: 'tagged'
				}
			},
			categories: {
				'Categorized!': {
					ID: 5519,
					name: 'Categorized!',
					slug: 'categorized'
				}
			},
			type: 'post',
			parent: 100,
			sticky: true,
			discussion: {
				comment_count: 0
			}
		};
		const post2 = {
			ID: 413,
			site_ID: 2916284,
			global_ID: '6c831c187ffef321eb43a67761a525a3',
			title: 'Ribs & Chicken',
			date: '2016-04-25T15:47:33-04:00',
			modified: '2016-05-29T11:53:53-04:00',
			tags: {
				Tagged2: {
					ID: 17695,
					name: 'Tagged2!',
					slug: 'tagged2'
				}
			},
			categories: {
				Categorized2: {
					ID: 5519,
					name: 'Categorized2!',
					slug: 'categorized2'
				}
			},
			type: 'page',
			author: {
				ID: 73705554,
				login: 'testonesite2014'
			},
			status: 'publish',
			discussion: {
				comment_count: 1
			}
		};
		const originalPosts = [ post1, post2 ];

		it( 'should return the specified number of posts', () => {
			const posts = applyQueryToPostsList( originalPosts, {
				number: 1,
				page: 1
			} );
			expect( posts ).to.eql( [post2] );
		} );

		it( 'should take the page parameter into account', () => {
			const posts = applyQueryToPostsList( originalPosts, {
				number: 1,
				page: 2
			} );
			expect( posts ).to.eql( [post1] );
		} );

		it( 'should take the offset parameter into account', () => {
			const posts = applyQueryToPostsList( originalPosts, {
				number: 1,
				offset: 1
			} );
			expect( posts ).to.eql( [post1] );
		} );

		it( 'should take the ord parameter into account before pagination', () => {
			const posts = applyQueryToPostsList( originalPosts, {
				number: 1,
				offset: 1,
				order: 'DESC',
				order_by: 'date'
			} );
			expect( posts ).to.eql( [post1] );
		} );

		it( 'should order by title', () => {
			const posts = applyQueryToPostsList( originalPosts, {
				number: 1,
				order: 'DESC',
				order_by: 'title'
			} );
			expect( posts ).to.eql( [post2] );
		} );

		it( 'should order by comment_count', () => {
			const posts = applyQueryToPostsList( originalPosts, {
				number: 1,
				order: 'DESC',
				order_by: 'comment_count'
			} );
			expect( posts ).to.eql( [post2] );
		} );

		it( 'should order by modified', () => {
			const posts = applyQueryToPostsList( originalPosts, {
				number: 1,
				order: 'DESC',
				order_by: 'modified'
			} );
			expect( posts ).to.eql( [post2] );
		} );

		it( 'should order by ID', () => {
			const posts = applyQueryToPostsList( originalPosts, {
				number: 1,
				order: 'DESC',
				order_by: 'ID'
			} );
			expect( posts ).to.eql( [post1] );
		} );

		it( 'should filter after date', () => {
			const posts = applyQueryToPostsList( originalPosts, {
				after: '2016-03-26T15:47:33-04:00'
			} );
			expect( posts ).to.eql( [post2] );
		} );

		it( 'should filter before date', () => {
			const posts = applyQueryToPostsList( originalPosts, {
				before: '2016-03-26T15:47:33-04:00'
			} );
			expect( posts ).to.eql( [post1] );
		} );

		it( 'should filter after modification date', () => {
			const posts = applyQueryToPostsList( originalPosts, {
				modified_after: '2016-04-30T11:53:53-04:00'
			} );
			expect( posts ).to.eql( [post2] );
		} );

		it( 'should filter before modification date', () => {
			const posts = applyQueryToPostsList( originalPosts, {
				modified_before: '2016-04-30T11:53:53-04:00'
			} );
			expect( posts ).to.eql( [post1] );
		} );

		it( 'should filter by tag', () => {
			const posts = applyQueryToPostsList( originalPosts, {
				tag: 'tagged2'
			} );
			expect( posts ).to.eql( [post2] );
		} );

		it( 'should filter by category', () => {
			const posts = applyQueryToPostsList( originalPosts, {
				category: 'categorized'
			} );
			expect( posts ).to.eql( [post1] );
		} );

		it( 'should filter by type', () => {
			const posts = applyQueryToPostsList( originalPosts, {
				type: 'page'
			} );
			expect( posts ).to.eql( [post2] );
		} );

		it( 'should filter by parent', () => {
			const posts = applyQueryToPostsList( originalPosts, {
				parent_id: 100
			} );
			expect( posts ).to.eql( [post1] );
		} );

		it( 'should exclude post ids', () => {
			const posts = applyQueryToPostsList( originalPosts, {
				exclude: 841
			} );
			expect( posts ).to.eql( [post2] );
		} );

		it( 'should filter by sticky flag', () => {
			const posts = applyQueryToPostsList( originalPosts, {
				sticky: 'require'
			} );
			expect( posts ).to.eql( [post1] );
		} );

		it( 'should filter by author', () => {
			const posts = applyQueryToPostsList( originalPosts, {
				author: 73705554
			} );
			expect( posts ).to.eql( [post2] );
		} );

		it( 'should filter by status', () => {
			const posts = applyQueryToPostsList( originalPosts, {
				status: 'publish'
			} );
			expect( posts ).to.eql( [post2] );
		} );
	} );
} );

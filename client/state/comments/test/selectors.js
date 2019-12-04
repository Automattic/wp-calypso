/**
 * Internal dependencies
 */
import {
	getPostOldestCommentDate,
	getPostNewestCommentDate,
	getCommentLike,
	getPostCommentsTree,
	getPostCommentsCountAtDate,
} from '../selectors';

const state = {
	comments: {
		items: {
			'1-1': [
				{
					ID: 3,
					parent: { ID: 1 },
					date: '2017-01-31T10:07:18-08:00',
					i_like: false,
					contiguous: true,
					like_count: 0,
					status: 'approved',
					author: { ID: 1 },
				},
				{
					ID: 1,
					parent: false,
					date: '2016-01-29T10:07:18-08:00',
					i_like: true,
					like_count: 5,
					status: 'unapproved',
					author: { ID: 1 },
				},
				{
					ID: 2,
					parent: false,
					date: '2016-01-29T10:07:18-08:00',
					i_like: false,
					like_count: 456,
					status: 'unapproved',
					author: { ID: 2 },
				},
				{
					ID: 4,
					parent: { ID: 2 },
					date: '2015-01-29T10:07:18-08:00',
					i_like: false,
					contiguous: true,
					like_count: 0,
					status: 'approved',
					author: { ID: 1 },
				},
			],
		},
	},
};

const stateWithDeeperChildren = {
	comments: {
		items: {
			'1-1': [
				{
					ID: 4,
					parent: { ID: 1 },
					date: '2017-01-31T00:00:04Z',
					i_like: false,
					like_count: 0,
				},
				{
					ID: 3,
					parent: { ID: 1 },
					date: '2017-01-31T00:00:03Z',
					i_like: false,
					like_count: 0,
				},
				{
					ID: 2,
					parent: { ID: 1 },
					date: '2017-01-31T00:00:02Z',
					i_like: false,
					like_count: 0,
				},
				{
					ID: 1,
					parent: false,
					date: '2017-01-31T00:00:01Z',
					i_like: false,
					like_count: 0,
				},
				{
					ID: 50,
					parent: false,
					date: '2017-01-30T00:00:00Z',
					i_like: false,
					like_count: 0,
				},
			],
		},
	},
};

describe( 'selectors', () => {
	describe( '#getPostNewestCommentDate()', () => {
		test( 'should get most recent date', () => {
			const res = getPostNewestCommentDate( state, 1, 1 );

			expect( res ).toEqual( new Date( '2017-01-31T10:07:18-08:00' ) );
		} );

		test( 'should return undefined if no comment items', () => {
			const res = getPostNewestCommentDate(
				{
					comments: { items: { '1-1': [] } },
				},
				1,
				1
			);

			expect( res ).toEqual( undefined );
		} );
	} ); // end of getPostNewestCommentDate

	describe( '#getPostOldestCommentDate()', () => {
		test( 'should get earliest date', () => {
			const res = getPostOldestCommentDate( state, 1, 1 );

			expect( res ).toEqual( new Date( '2015-01-29T10:07:18-08:00' ) );
		} );

		test( 'should return undefined if no comment items', () => {
			const res = getPostOldestCommentDate(
				{
					comments: { items: { '1-1': [] } },
				},
				1,
				1
			);

			expect( res ).toEqual( undefined );
		} );
	} ); // end of getPostOldestCommentDate

	describe( '#getCommentLike()', () => {
		test( 'should provide only like statistics', () => {
			const res = getCommentLike( state, 1, 1, 2 );

			expect( res.i_like ).toEqual( false );
			expect( res.like_count ).toEqual( 456 );
		} );
	} );

	describe( '#getPostCommentsTree', () => {
		test( 'should return the tree structure', () => {
			const tree = getPostCommentsTree( state, 1, 1, 'all' );
			expect( tree ).toMatchSnapshot();
		} );

		test( 'filters other pending posts', () => {
			const tree = getPostCommentsTree( state, 1, 1, 'all', 1 );
			expect( tree ).toMatchSnapshot();
		} );

		test( 'should reverse children', () => {
			expect( getPostCommentsTree( stateWithDeeperChildren, 1, 1, 'all' ) ).toMatchSnapshot();
		} );
	} );

	describe( '#getPostCommentsCountAtDate()', () => {
		test( 'should return 0 if date is invalid', () => {
			const res = getPostCommentsCountAtDate( state, 1, 1, null );

			expect( res ).toBe( 0 );
		} );

		test( 'should return 0 if post comment does not exist', () => {
			const res = getPostCommentsCountAtDate(
				state,
				1,
				123,
				new Date( '2015-01-29T10:07:18-08:00' )
			);

			expect( res ).toBe( 0 );
		} );

		test( 'should return the count if the post and date are valid', () => {
			const res = getPostCommentsCountAtDate(
				state,
				1,
				1,
				new Date( '2016-01-29T10:07:18-08:00' )
			);

			expect( res ).toBe( 2 );
		} );
	} );
} );

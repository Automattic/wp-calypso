/**
 * External dependencies
 */
import { expect } from 'chai';
import Immutable from 'immutable';

/***
 * Internal dependencies
 */
import {
	getCommentParentKey
} from '../utils';
import {
	getPostOldestCommentDate,
	getPostMostRecentCommentDate,
	getCommentLike
} from '../selectors';

describe( 'selectors', () => {
	describe( '#getPostMostRecentCommentDate()', () => {
		it( 'should get most recent date', () => {
			const commentItems = [
				{ ID: 1, date: '2016-01-31T10:07:18-08:00' },
				{ ID: 2, date: '2016-01-29T10:07:18-08:00' }
			];

			const res = getPostMostRecentCommentDate( {
				comments: {
					items: Immutable.fromJS( {
						[ getCommentParentKey( 1, 1 ) ]: commentItems
					} )
				}
			}, 1, 1 );

			expect( res ).to.be.eql( new Date( commentItems[ 0 ].date ) );
		} );

		it( 'should return undefined if no comment items', () => {
			const res = getPostMostRecentCommentDate( {
				comments: {
					items: Immutable.fromJS( {
						[ getCommentParentKey( 1, 1 ) ]: []
					} )
				}
			}, 1, 1 );

			expect( res ).to.be.eql( undefined );
		} );
	} ); // end of getPostMostRecentCommentDate

	describe( '#getPostOldestCommentDate()', () => {
		it( 'should get earliest date', () => {
			const commentItems = [
				{ ID: 1, date: '2016-01-31T10:07:18-08:00' },
				{ ID: 2, date: '2016-01-29T10:07:18-08:00' }
			];

			const res = getPostOldestCommentDate( {
				comments: {
					items: Immutable.fromJS( {
						[ getCommentParentKey( 1, 1 ) ]: commentItems
					} )
				}
			}, 1, 1 );

			expect( res ).to.be.eql( new Date( commentItems[ 1 ].date ) );
		} );

		it( 'should return undefined if no comment items', () => {
			const res = getPostOldestCommentDate( {
				comments: {
					items: Immutable.fromJS( {
						[ getCommentParentKey( 1, 1 ) ]: []
					} )
				}
			}, 1, 1 );

			expect( res ).to.be.eql( undefined );
		} );
	} ); // end of getPostOldestCommentDate

	describe( '#getCommentLike()', () => {
		it( 'should provide only like statistics', () => {
			const res = getCommentLike( {
				comments: {
					items: Immutable.fromJS( {
						[ getCommentParentKey( 1, 1 ) ]: [
							{
								ID: 5,
								i_like: true,
								like_count: 5,
								content: 'wrong comment'
							},
							{
								ID: 123,
								i_like: false,
								like_count: 456,
								content: 'bla bla'
							}
						]
					} )
				}
			}, 1, 1, 123 );

			expect( res.size ).to.equal( 2 );
			expect( res.get( 'i_like' ) ).to.eql( false );
			expect( res.get( 'like_count' ) ).to.eql( 456 );
		} )
	} );
} );

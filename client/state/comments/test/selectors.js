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

const state = {
	comments: {
		items: {
			'1-1': [
					{ ID: 1, date: '2016-01-31T10:07:18-08:00', i_like: true, like_count: 5 },
					{ ID: 2, date: '2016-01-29T10:07:18-08:00', i_like: false, like_count: 456 }
			]
		}
	}
};

describe( 'selectors', () => {
	describe( '#getPostMostRecentCommentDate()', () => {
		it( 'should get most recent date', () => {
			const res = getPostMostRecentCommentDate( state, 1, 1 );

			expect( res ).to.be.eql( new Date( '2016-01-31T10:07:18-08:00' ) );
		} );

		it( 'should return undefined if no comment items', () => {
			const res = getPostMostRecentCommentDate( {
				comments: { items: { '1-1': [] } }
			}, 1, 1 );

			expect( res ).to.be.eql( undefined );
		} );
	} ); // end of getPostMostRecentCommentDate

	describe( '#getPostOldestCommentDate()', () => {
		it( 'should get earliest date', () => {
			const res = getPostOldestCommentDate( state, 1, 1 );

			expect( res ).to.be.eql( new Date( '2016-01-29T10:07:18-08:00' ) );
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
			const res = getCommentLike( state, 1, 1, 2 );

			expect( res.i_like ).to.eql( false );
			expect( res.like_count ).to.eql( 456 );
		} )
	} );
} );

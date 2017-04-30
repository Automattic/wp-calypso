/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getCommentReplies } from '../';

describe( '#getCommentReplies()', () => {
	const state = {
		discussions: {
			items: {
				101010: {
					1: { ID: 1, post: { ID: 1 }, parent: false },
					2: { ID: 2, post: { ID: 1 }, parent: false },
					3: { ID: 3, post: { ID: 1 }, parent: { ID: 2 } },
					4: { ID: 4, post: { ID: 1 }, parent: { ID: 2 } },
					5: { ID: 5, post: { ID: 2 }, parent: false },
					6: { ID: 6, post: { ID: 2 }, parent: false }
				}
			}
		}
	};

	it( 'should return an empty array for an empty state', () => {
		const comments = getCommentReplies( {}, 101010, 1 );
		expect( comments ).to.be.empty;
	} );

	it( 'should return an empty array for an unknown site', () => {
		const comments = getCommentReplies( state, 202020, 1 );
		expect( comments ).to.be.empty;
	} );

	it( 'should return an empty array for and unknown comment on a site', () => {
		const comments = getCommentReplies( state, 101010, 10 );
		expect( comments ).to.be.empty;
	} );

	it( 'should return an empty array for a comment with no replies', () => {
		const comments = getCommentReplies( state, 101010, 5 );
		expect( comments ).to.be.empty;
	} );

	it( 'should return an array with the replies for the specified comment', () => {
		const comments = getCommentReplies( state, 101010, 2 );
		expect( comments ).to.have.lengthOf( 2 );
		expect( comments ).to.be.eql( [
			{ ID: 3, post: { ID: 1 }, parent: { ID: 2 } },
			{ ID: 4, post: { ID: 1 }, parent: { ID: 2 } }
		] );
	} );
} );

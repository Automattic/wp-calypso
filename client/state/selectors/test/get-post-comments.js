/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getPostComments } from '../';

describe( '#getPostComments()', () => {
	const state = {
		discussions: {
			items: {
				101010: {
					1: { ID: 1, post: { ID: 1 }, parent: false },
					2: { ID: 2, post: { ID: 1 }, parent: false },
					3: { ID: 3, post: { ID: 1 }, parent: { ID: 2 } },
					4: { ID: 4, post: { ID: 2 }, parent: false },
					5: { ID: 5, post: { ID: 2 }, parent: false }
				}
			}
		}
	};

	it( 'should return an empty array for an empty state', () => {
		const comments = getPostComments( {}, 101010, 1 );
		expect( comments ).to.be.empty;
	} );

	it( 'should return an empty array for an unknown site', () => {
		const comments = getPostComments( state, 202020, 1 );
		expect( comments ).to.be.empty;
	} );

	it( 'should return an empty arrat for and unknown post on a site', () => {
		const comments = getPostComments( state, 101010, 10 );
		expect( comments ).to.be.empty;
	} );

	it( 'should return an array with only the comments at the root level', () => {
		const comments = getPostComments( state, 101010, 1 );
		expect( comments ).to.have.lengthOf( 2 );
		expect( comments ).to.be.eql( [
			{ ID: 1, post: { ID: 1 }, parent: false },
			{ ID: 2, post: { ID: 1 }, parent: false },
		] );
	} );
} );

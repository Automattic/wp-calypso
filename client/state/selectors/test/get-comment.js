/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getComment } from '../';

describe( '#getComment()', () => {
	const state = {
		discussions: {
			items: {
				101010: {
					1: { ID: 1, content: 'this is a comment' }
				}
			}
		}
	};

	it( 'should return null for an empty state', () => {
		const comment = getComment( {}, 101010, 1 );
		expect( comment ).to.be.null;
	} );

	it( 'sould return null for an unknown site', () => {
		const comment = getComment( state, 202020, 1 );
		expect( comment ).to.be.null;
	} );

	it( 'sould return null for an unknown comment', () => {
		const comment = getComment( state, 101010, 2 );
		expect( comment ).to.be.null;
	} );

	it( 'should return the specified comment for a known site', () => {
		const comment = getComment( state, 101010, 1 );
		expect( comment ).to.eql( {
			ID: 1,
			content: 'this is a comment'
		} );
	} );
} );

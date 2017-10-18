/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getSelectedComments } from '../';

describe( 'getSelectedComments()', () => {
	const state = {
		ui: {
			comments: {
				selected: {
					123456: {
						1: { commentId: 1, postId: 2 },
						3: { commentId: 3, postId: 1 },
					},
				},
			},
		},
	};

	test( 'should return and empty object when state is empty', () => {
		expect( getSelectedComments( {}, 123456 ) ).to.be.empty;
	} );

	test( 'should return an empty object when no comments are selected for a site', () => {
		expect( getSelectedComments( state, 654321 ) ).to.be.empty;
	} );

	test( 'should return the selected comments for a site', () => {
		expect( getSelectedComments( state, 123456 ) ).to.eql( {
			1: { commentId: 1, postId: 2 },
			3: { commentId: 3, postId: 1 },
		} );
	} );
} );

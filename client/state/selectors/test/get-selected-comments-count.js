/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getSelectedCommentsCount } from '../';

describe( 'getSelectedCommentsCount()', () => {
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

	test( 'should return 0 for empty state', () => {
		expect( getSelectedCommentsCount( {}, 123456 ) ).to.equal( 0 );
	} );

	test( 'should return 0 for sites with no selected comments', () => {
		expect( getSelectedCommentsCount( state, 654321 ) ).to.equal( 0 );
	} );

	test( 'should return comment count for sites with selected comments', () => {
		expect( getSelectedCommentsCount( state, 123456 ) ).to.equal( 2 );
	} );
} );

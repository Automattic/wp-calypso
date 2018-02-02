/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getPost } from '../selectors';

describe( 'selectors', () => {
	describe( '#getPost()', () => {
		test( 'should return undefined if there is no match', () => {
			const post = getPost(
				{
					reader: {
						posts: {
							items: {},
						},
					},
				},
				'nope'
			);

			expect( post ).to.eql( undefined );
		} );
	} );
} );

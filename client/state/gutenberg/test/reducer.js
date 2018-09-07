/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { GUTENBERG_SITE_POST_RECEIVE } from 'state/action-types';
import currentPost from '../reducer';

describe( 'reducer', () => {
	describe( 'currentPost', () => {
		test( 'should default to an empty object', () => {
			const state = currentPost( undefined, {} );

			expect( state ).to.eql( { currentPost: {} } );
		} );

		test( 'should replace the Gutenberg current post', () => {
			const state = deepFreeze( { currentPost: { id: 1 } } );
			const newSate = currentPost( state, {
				type: GUTENBERG_SITE_POST_RECEIVE,
				post: { id: 2 },
			} );

			expect( newSate ).to.eql( { currentPost: { id: 2 } } );
		} );
	} );
} );

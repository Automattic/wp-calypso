import { POST_SAVE_SUCCESS } from 'calypso/state/action-types';
import reducer, { postId } from '../reducer';

describe( 'reducer', () => {
	test( 'should export expected reducer keys', () => {
		expect( Object.keys( reducer( undefined, {} ) ) ).toEqual( [
			'postId',
			'imageEditor',
			'videoEditor',
		] );
	} );

	describe( '#postId()', () => {
		test( 'should default to null', () => {
			const state = postId( undefined, {} );

			expect( state ).toBeNull();
		} );

		test( 'should update the tracked post id if we save a draft post', () => {
			const state = postId( null, {
				type: POST_SAVE_SUCCESS,
				siteId: 1,
				postId: null,
				savedPost: {
					ID: 184,
				},
				post: {},
			} );

			expect( state ).toEqual( 184 );
		} );

		test( 'should not update the tracked post id if we save a draft post but we already switched the tracked post ID', () => {
			const state = postId( 10, {
				type: POST_SAVE_SUCCESS,
				siteId: 1,
				postId: null,
				savedPost: {
					ID: 184,
				},
				post: {},
			} );

			expect( state ).toEqual( 10 );
		} );
	} );
} );

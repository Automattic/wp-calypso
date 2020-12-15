/**
 * Internal dependencies
 */
import reducer, { postId, iframePort } from '../reducer';
import { EDITOR_START, POST_SAVE_SUCCESS, EDITOR_IFRAME_LOADED } from 'calypso/state/action-types';

describe( 'reducer', () => {
	test( 'should export expected reducer keys', () => {
		expect( Object.keys( reducer( undefined, {} ) ) ).toEqual( [
			'postId',
			'loadingError',
			'isLoading',
			'isIframeLoaded',
			'iframePort',
			'imageEditor',
			'videoEditor',
			'lastDraft',
		] );
	} );

	describe( '#postId()', () => {
		test( 'should default to null', () => {
			const state = postId( undefined, {} );

			expect( state ).toBeNull();
		} );

		test( 'should update the tracked id when starting the editor', () => {
			const state = postId( undefined, {
				type: EDITOR_START,
				siteId: 1,
				postId: 184,
			} );

			expect( state ).toEqual( 184 );
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

	describe( ' #iframePort', () => {
		test( 'should default to null', () => {
			const state = iframePort( undefined, {} );

			expect( state ).toBeNull();
		} );

		test( 'should return null if the iframe editor is not loaded', () => {
			const iframePortObject = {};
			const state = iframePort( undefined, {
				type: EDITOR_IFRAME_LOADED,
				isIframeLoaded: false,
				iframePort: iframePortObject,
			} );

			expect( state ).toBeNull();
		} );

		test( 'should return null if no iframePort object was given', () => {
			const state = iframePort( undefined, {
				type: EDITOR_IFRAME_LOADED,
				isIframeLoaded: true,
				iframePort: undefined,
			} );

			expect( state ).toBeNull();
		} );

		test( 'should return the iframePort object if the iframe editor is loaded', () => {
			const iframePortObject = {};
			const state = iframePort( undefined, {
				type: EDITOR_IFRAME_LOADED,
				isIframeLoaded: true,
				iframePort: iframePortObject,
			} );

			expect( state ).toBe( iframePortObject );
		} );
	} );
} );

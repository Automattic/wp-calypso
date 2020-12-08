/**
 * Internal dependencies
 */
import reducer, { postTypeList } from '../reducer';
import {
	POST_TYPE_LIST_SHARE_PANEL_HIDE,
	POST_TYPE_LIST_SHARE_PANEL_TOGGLE,
} from 'calypso/state/action-types';

describe( 'reducer', () => {
	test( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).toHaveProperty( 'postIdWithActiveSharePanel' );
	} );

	describe( '#postTypeList()', () => {
		test( 'should remove postGlobalId from the state when hiding Share panel', () => {
			const postGlobalId = 4;
			const state = postTypeList(
				{ postIdWithActiveSharePanel: postGlobalId },
				{
					type: POST_TYPE_LIST_SHARE_PANEL_HIDE,
					postGlobalId: postGlobalId,
				}
			);

			expect( state.postIdWithActiveSharePanel ).toBeNull();
		} );

		test( 'should not fail when hiding an already hidden Share panel', () => {
			const state = postTypeList( undefined, {
				type: POST_TYPE_LIST_SHARE_PANEL_HIDE,
				postGlobalId: 4,
			} );

			expect( state.postIdWithActiveSharePanel ).toBeNull();
		} );

		test( 'should hide an already-visible Share panel when toggling', () => {
			const postGlobalId = 4;
			const state = postTypeList(
				{ postIdWithActiveSharePanel: postGlobalId },
				{
					type: POST_TYPE_LIST_SHARE_PANEL_TOGGLE,
					postGlobalId: postGlobalId,
				}
			);

			expect( state.postIdWithActiveSharePanel ).toBeNull();
		} );

		test( 'should show a hidden Share panel when toggling', () => {
			const postGlobalId = 4;
			const state = postTypeList(
				{ postIdWithActiveLikesPopover: null },
				{
					type: POST_TYPE_LIST_SHARE_PANEL_TOGGLE,
					postGlobalId: postGlobalId,
				}
			);

			expect( state.postIdWithActiveSharePanel ).toBe( postGlobalId );
		} );

		test( 'should only allow one active Share panel at a time', () => {
			const existingPostGlobalId = 5;
			const postGlobalId = 4;
			const state = postTypeList(
				{ postIdWithActiveSharePanel: existingPostGlobalId },
				{
					type: POST_TYPE_LIST_SHARE_PANEL_TOGGLE,
					postGlobalId: postGlobalId,
				}
			);

			expect( state.postIdWithActiveSharePanel ).toBe( postGlobalId );
		} );
	} );
} );

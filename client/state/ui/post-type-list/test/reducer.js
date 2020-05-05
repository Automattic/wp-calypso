/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer, { postTypeList } from '../reducer';
import {
	POST_TYPE_LIST_LIKES_POPOVER_HIDE,
	POST_TYPE_LIST_LIKES_POPOVER_TOGGLE,
	POST_TYPE_LIST_MULTI_SELECTION_MODE_TOGGLE,
	POST_TYPE_LIST_SELECTION_TOGGLE,
	POST_TYPE_LIST_SHARE_PANEL_HIDE,
	POST_TYPE_LIST_SHARE_PANEL_TOGGLE,
	ROUTE_SET,
} from 'state/action-types';

describe( 'reducer', () => {
	test( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'postIdWithActiveSharePanel',
			'postIdWithActiveLikesPopover',
			'isMultiSelectEnabled',
			'selectedPosts',
		] );
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

			expect( state.postIdWithActiveSharePanel ).to.be.null;
		} );

		test( 'should not fail when hiding an already hidden Share panel', () => {
			const state = postTypeList( undefined, {
				type: POST_TYPE_LIST_SHARE_PANEL_HIDE,
				postGlobalId: 4,
			} );

			expect( state.postIdWithActiveSharePanel ).to.be.null;
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

			expect( state.postIdWithActiveSharePanel ).to.be.null;
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

			expect( state.postIdWithActiveSharePanel ).to.eql( postGlobalId );
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

			expect( state.postIdWithActiveSharePanel ).to.eql( postGlobalId );
		} );

		test( 'should remove postGlobalId from the state when hiding likes popover', () => {
			const postGlobalId = 4;
			const state = postTypeList(
				{ postIdWithActiveLikesPopover: postGlobalId },
				{
					type: POST_TYPE_LIST_LIKES_POPOVER_HIDE,
					postGlobalId: postGlobalId,
				}
			);

			expect( state.postIdWithActiveLikesPopover ).to.be.null;
		} );

		test( 'should not fail when hiding an already hidden likes popover', () => {
			const state = postTypeList( undefined, {
				type: POST_TYPE_LIST_LIKES_POPOVER_HIDE,
				postGlobalId: 4,
			} );

			expect( state.postIdWithActiveLikesPopover ).to.be.null;
		} );

		test( 'should hide an already-visible likes popover when toggling', () => {
			const postGlobalId = 4;
			const state = postTypeList(
				{ postIdWithActiveLikesPopover: postGlobalId },
				{
					type: POST_TYPE_LIST_LIKES_POPOVER_TOGGLE,
					postGlobalId: postGlobalId,
				}
			);

			expect( state.postIdWithActiveLikesPopover ).to.be.null;
		} );

		test( 'should show a hidden likes popover when toggling', () => {
			const postGlobalId = 4;
			const state = postTypeList(
				{ postIdWithActiveLikesPopover: null },
				{
					type: POST_TYPE_LIST_LIKES_POPOVER_TOGGLE,
					postGlobalId: postGlobalId,
				}
			);

			expect( state.postIdWithActiveLikesPopover ).to.eql( postGlobalId );
		} );

		test( 'should only allow one active likes popover at a time', () => {
			const existingPostGlobalId = 5;
			const postGlobalId = 4;
			const state = postTypeList(
				{ postIdWithActiveLikesPopover: existingPostGlobalId },
				{
					type: POST_TYPE_LIST_LIKES_POPOVER_TOGGLE,
					postGlobalId: postGlobalId,
				}
			);

			expect( state.postIdWithActiveLikesPopover ).to.eql( postGlobalId );
		} );

		test( 'should add postGlobalId to the state when toggling selectedPosts with a new globalId', () => {
			const existingPostGlobalId = 'abcdef0123456789';
			const postGlobalId = '0123456789abcdef';
			const state = postTypeList(
				{ selectedPosts: [ existingPostGlobalId ] },
				{
					type: POST_TYPE_LIST_SELECTION_TOGGLE,
					postGlobalId: postGlobalId,
				}
			);

			expect( state.selectedPosts ).to.eql( [ existingPostGlobalId, postGlobalId ] );
		} );

		test( 'should remove postGlobalId from the state when toggling selectedPosts with an existing globalId', () => {
			const existingPostGlobalId = 'abcdef0123456789';
			const postGlobalId = '0123456789abcdef';
			const state = postTypeList(
				{ selectedPosts: [ existingPostGlobalId, postGlobalId ] },
				{
					type: POST_TYPE_LIST_SELECTION_TOGGLE,
					postGlobalId: postGlobalId,
				}
			);

			expect( state.selectedPosts ).to.eql( [ existingPostGlobalId ] );
		} );

		test( 'should clear all selectedPosts state when toggling on selection mode', () => {
			const postGlobalId = '0123456789abcdef';
			const state = postTypeList(
				{ selectedPosts: [ postGlobalId ], isMultiSelectEnabled: false },
				{
					type: POST_TYPE_LIST_MULTI_SELECTION_MODE_TOGGLE,
				}
			);

			expect( state.selectedPosts ).to.be.empty;
			expect( state.isMultiSelectEnabled ).to.be.true;
		} );

		test( 'should maintain all selectedPosts state when toggling off selection mode', () => {
			const postGlobalId = '0123456789abcdef';
			const state = postTypeList(
				{ selectedPosts: [ postGlobalId ], isMultiSelectEnabled: true },
				{
					type: POST_TYPE_LIST_MULTI_SELECTION_MODE_TOGGLE,
				}
			);

			expect( state.selectedPosts ).to.eql( [ postGlobalId ] );
			expect( state.isMultiSelectEnabled ).to.be.false;
		} );

		test( 'should reset isMultiSelectEnabled, postIdWithActiveLikesPopover, and selectedPosts when navigating', () => {
			const postGlobalId = '0123456789abcdef';
			const state = postTypeList(
				{
					isMultiSelectEnabled: true,
					postIdWithActiveLikesPopover: postGlobalId,
					selectedPosts: [ postGlobalId ],
				},
				{
					type: ROUTE_SET,
					path: '/',
					query: {},
				}
			);

			expect( state ).to.eql( {
				isMultiSelectEnabled: false,
				postIdWithActiveLikesPopover: null,
				selectedPosts: [],
			} );
		} );
	} );
} );

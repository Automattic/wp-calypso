/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer, { postTypeList } from '../reducer';
import {
	POST_TYPE_LIST_MULTI_SELECTION_MODE_TOGGLE,
	POST_TYPE_LIST_SELECTION_TOGGLE,
	POST_TYPE_LIST_SHARE_PANEL_HIDE,
	POST_TYPE_LIST_SHARE_PANEL_TOGGLE,
	ROUTE_SET,
} from 'state/action-types';

describe( 'reducer', () => {
	test( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'activeSharePanels',
			'isMultiSelectEnabled',
			'selectedPosts',
		] );
	} );

	describe( '#postTypeList()', () => {
		test( 'should remove postGlobalId from the state when hiding Share panel', () => {
			const postGlobalId = 4;
			const state = postTypeList(
				{ activeSharePanels: [ postGlobalId ] },
				{
					type: POST_TYPE_LIST_SHARE_PANEL_HIDE,
					postGlobalId: postGlobalId,
				}
			);

			expect( state.activeSharePanels ).to.be.empty;
		} );

		test( 'should not fail when hiding an already hidden Share panel', () => {
			const state = postTypeList( undefined, {
				type: POST_TYPE_LIST_SHARE_PANEL_HIDE,
				postGlobalId: 4,
			} );

			expect( state.activeSharePanels ).to.be.empty;
		} );

		test( 'should remove postGlobalId from the state when toggling Share panel visibility when Share panel is currently showing', () => {
			const postGlobalId = 4;
			const state = postTypeList(
				{ activeSharePanels: [ postGlobalId ] },
				{
					type: POST_TYPE_LIST_SHARE_PANEL_TOGGLE,
					postGlobalId: postGlobalId,
				}
			);

			expect( state.activeSharePanels ).to.be.empty;
		} );

		test( 'should add postGlobalId to the state when toggling Share panel visibility when Share panel is currently not showing', () => {
			const postGlobalId = 4;
			const state = postTypeList(
				{ activeSharePanels: [] },
				{
					type: POST_TYPE_LIST_SHARE_PANEL_TOGGLE,
					postGlobalId: postGlobalId,
				}
			);

			expect( state.activeSharePanels ).to.eql( [ postGlobalId ] );
		} );

		test( 'should remove an existing active Share panel when toggling on a different Share panel', () => {
			const existingPostGlobalId = 5;
			const postGlobalId = 4;
			const state = postTypeList(
				{ activeSharePanels: [ existingPostGlobalId ] },
				{
					type: POST_TYPE_LIST_SHARE_PANEL_TOGGLE,
					postGlobalId: postGlobalId,
				}
			);

			expect( state.activeSharePanels ).to.eql( [ postGlobalId ] );
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

		test( 'should reset isMultiSelectEnabled and selectedPosts when navigating', () => {
			const postGlobalId = '0123456789abcdef';
			const state = postTypeList(
				{
					isMultiSelectEnabled: true,
					selectedPosts: [ postGlobalId ],
					activeSharePanels: [],
				},
				{
					type: ROUTE_SET,
					path: '/',
					query: {},
				}
			);

			expect( state ).to.eql( {
				isMultiSelectEnabled: false,
				selectedPosts: [],
				activeSharePanels: [],
			} );
		} );
	} );
} );

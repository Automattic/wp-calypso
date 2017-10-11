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
	POST_TYPE_LIST_SHARE_PANEL_HIDE,
	POST_TYPE_LIST_SHARE_PANEL_TOGGLE,
} from 'state/action-types';

describe( 'reducer', () => {
	test( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [ 'activeSharePanels' ] );
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
	} );
} );

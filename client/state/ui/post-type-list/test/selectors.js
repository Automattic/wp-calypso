/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	isLikesPopoverOpen,
	isSharePanelOpen,
	isMultiSelectEnabled,
	isPostSelected,
	getSelectedPostsCount,
} from '../selectors';

describe( 'isLikesPopoverOpen', () => {
	test( 'should return true if the likes popover for the given post is open', () => {
		const postGlobalId = 4;
		const isOpen = isLikesPopoverOpen(
			{
				ui: {
					postTypeList: {
						postIdWithActiveLikesPopover: postGlobalId,
					},
				},
			},
			postGlobalId
		);

		expect( isOpen ).to.be.true;
	} );

	test( 'should return false if no likes popover is open', () => {
		const postGlobalId = 4;
		const isOpen = isLikesPopoverOpen(
			{
				ui: {
					postTypeList: {
						postIdWithActiveLikesPopover: null,
					},
				},
			},
			postGlobalId
		);

		expect( isOpen ).to.be.false;
	} );

	test( 'should return false if the likes popover for a different post is open', () => {
		const postGlobalId = 4;
		const otherPostGlobalId = 5;
		const isOpen = isLikesPopoverOpen(
			{
				ui: {
					postTypeList: {
						postIdWithActiveLikesPopover: otherPostGlobalId,
					},
				},
			},
			postGlobalId
		);

		expect( isOpen ).to.be.false;
	} );
} );

describe( 'isSharePanelOpen', () => {
	test( 'should return true if the Share panel for the given post is open', () => {
		const postGlobalId = 4;
		const isOpen = isSharePanelOpen(
			{
				ui: {
					postTypeList: {
						postIdWithActiveSharePanel: postGlobalId,
					},
				},
			},
			postGlobalId
		);

		expect( isOpen ).to.be.true;
	} );

	test( 'should return false if no Share panel is open', () => {
		const postGlobalId = 4;
		const isOpen = isSharePanelOpen(
			{
				ui: {
					postTypeList: {
						postIdWithActiveLikesPopover: null,
					},
				},
			},
			postGlobalId
		);

		expect( isOpen ).to.be.false;
	} );

	test( 'should return false if the Share panel for a different post is open', () => {
		const postGlobalId = 4;
		const otherPostGlobalId = 5;
		const isOpen = isSharePanelOpen(
			{
				ui: {
					postTypeList: {
						postIdWithActiveSharePanel: otherPostGlobalId,
					},
				},
			},
			postGlobalId
		);

		expect( isOpen ).to.be.false;
	} );
} );

describe( 'isMultiSelectEnabled', () => {
	test( 'should return true if multi select is enabled', () => {
		const isOpen = isMultiSelectEnabled( {
			ui: {
				postTypeList: {
					isMultiSelectEnabled: true,
				},
			},
		} );

		expect( isOpen ).to.be.true;
	} );

	test( 'should return false if multi select is disabled', () => {
		const isOpen = isMultiSelectEnabled( {
			ui: {
				postTypeList: {
					isMultiSelectEnabled: false,
				},
			},
		} );

		expect( isOpen ).to.be.false;
	} );
} );

describe( 'isPostSelected', () => {
	test( 'should return true if the post is selected', () => {
		const postGlobalId = 'abcdef0123456789';
		const isSelected = isPostSelected(
			{
				ui: {
					postTypeList: {
						selectedPosts: [ postGlobalId ],
					},
				},
			},
			postGlobalId
		);

		expect( isSelected ).to.be.true;
	} );

	test( 'should return false if the post is not selected', () => {
		const postGlobalId = 'abcdef0123456789';
		const isSelected = isPostSelected(
			{
				ui: {
					postTypeList: {
						selectedPosts: [],
					},
				},
			},
			postGlobalId
		);

		expect( isSelected ).to.be.false;
	} );
} );

describe( 'getSelectedPostsCount', () => {
	test( 'should return 0 when no posts are selected', () => {
		const selectedCount = getSelectedPostsCount( {
			ui: {
				postTypeList: {
					selectedPosts: [],
				},
			},
		} );

		expect( selectedCount ).to.be.eql( 0 );
	} );

	test( 'should return 1 when one post is selected', () => {
		const selectedCount = getSelectedPostsCount( {
			ui: {
				postTypeList: {
					selectedPosts: [ 'abc' ],
				},
			},
		} );

		expect( selectedCount ).to.be.eql( 1 );
	} );

	test( 'should return 3 when three posts are selected', () => {
		const selectedCount = getSelectedPostsCount( {
			ui: {
				postTypeList: {
					selectedPosts: [ 'abc', 'def', 'ghi' ],
				},
			},
		} );

		expect( selectedCount ).to.be.eql( 3 );
	} );
} );

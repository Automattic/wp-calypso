/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isLikesPopoverOpen, isSharePanelOpen } from '../selectors';

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

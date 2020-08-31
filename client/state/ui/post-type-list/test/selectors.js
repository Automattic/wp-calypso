/**
 * Internal dependencies
 */
import { isSharePanelOpen } from '../selectors';

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

		expect( isOpen ).toBe( true );
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

		expect( isOpen ).toBe( false );
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

		expect( isOpen ).toBe( false );
	} );
} );

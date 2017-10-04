/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isSharePanelOpen } from '../selectors';

describe( 'isSharePanelOpen', () => {
	it( 'should return true if the Share panel is open', () => {
		const postGlobalId = 4;
		const isOpen = isSharePanelOpen(
			{
				ui: {
					postTypeList: {
						activeSharePanels: [ postGlobalId ],
					},
				},
			},
			postGlobalId
		);

		expect( isOpen ).to.be.true;
	} );

	it( 'should return false if the Share panel is not open', () => {
		const postGlobalId = 4;
		const isOpen = isSharePanelOpen(
			{
				ui: {
					postTypeList: {
						activeSharePanels: [],
					},
				},
			},
			postGlobalId
		);

		expect( isOpen ).to.be.false;
	} );
} );

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	isSharePanelOpen,
	getOpenSharePanels,
} from '../selectors';

describe( 'isSharePanelOpen', () => {
	it( 'should return true if the Share panel is open', () => {
		const postGlobalId = 4;
		const isOpen = isSharePanelOpen( {
			ui: {
				postTypeList: {
					activeSharePanels: [ postGlobalId ],
				},
			}
		}, postGlobalId );

		expect( isOpen ).to.be.true;
	} );

	it( 'should return false if the Share panel is not open', () => {
		const postGlobalId = 4;
		const isOpen = isSharePanelOpen( {
			ui: {
				postTypeList: {
					activeSharePanels: [],
				},
			},
		}, postGlobalId );

		expect( isOpen ).to.be.false;
	} );
} );

describe( 'getOpenSharePanels', () => {
	it( 'should return an array of global IDs of posts with an open Share panel', () => {
		const postGlobalIds = [ 2, 5, 8 ];
		const openSharePanels = getOpenSharePanels( {
			ui: {
				postTypeList: {
					activeSharePanels: postGlobalIds,
				},
			},
		} );

		expect( openSharePanels ).to.eql( postGlobalIds );
	} );

	it( 'should return an empty array if no post has an open Share panel', () => {
		const openSharePanels = getOpenSharePanels( {
			ui: {
				postTypeList: {
					activeSharePanels: [],
				},
			},
		} );

		expect( openSharePanels ).to.be.empty;
	} );
} );

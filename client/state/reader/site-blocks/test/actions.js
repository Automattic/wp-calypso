/**
 * Internal dependencies
 */
import {
	READER_SITE_BLOCK,
	READER_SITE_BLOCKS_REQUEST,
	READER_SITE_UNBLOCK,
} from 'calypso/state/reader/action-types';
import {
	blockSite,
	requestSiteBlocks,
	unblockSite,
} from 'calypso/state/reader/site-blocks/actions';

describe( 'actions', () => {
	describe( '#blockSite', () => {
		test( 'should return an action when a site is blocked', () => {
			const action = blockSite( 123 );
			expect( action ).toEqual( {
				type: READER_SITE_BLOCK,
				payload: { siteId: 123 },
			} );
		} );
	} );

	describe( '#unblockSite', () => {
		test( 'should return an action when a site is unblocked', () => {
			const action = unblockSite( 123 );
			expect( action ).toEqual( {
				type: READER_SITE_UNBLOCK,
				payload: { siteId: 123 },
			} );
		} );
	} );

	describe( '#requestSiteBlocks', () => {
		test( 'should return an action when site blocks are requested', () => {
			const action = requestSiteBlocks( { page: 4 } );
			expect( action ).toEqual( {
				type: READER_SITE_BLOCKS_REQUEST,
				payload: { page: 4 },
			} );
		} );
	} );
} );

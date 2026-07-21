import { readSiteQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { getCalypsoQueryClient } from 'calypso/state/query-client';
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

jest.mock( 'calypso/state/query-client', () => ( {
	getCalypsoQueryClient: jest.fn(),
} ) );

describe( 'actions', () => {
	beforeEach( () => {
		getCalypsoQueryClient.mockReset();
	} );

	describe( '#blockSite', () => {
		test( 'should return an action when a site is blocked', () => {
			const action = blockSite( 123 );
			expect( action ).toEqual( {
				type: READER_SITE_BLOCK,
				payload: { siteId: 123 },
			} );
		} );

		test( 'should mark a cached Reader site as blocked', () => {
			const queryClient = new QueryClient();
			const queryKey = readSiteQuery( 123 ).queryKey;
			queryClient.setQueryData( queryKey, { ID: 123, is_blocked: false } );
			getCalypsoQueryClient.mockReturnValue( queryClient );

			blockSite( 123 );

			expect( queryClient.getQueryData( queryKey ) ).toMatchObject( { is_blocked: true } );
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

		test( 'should mark a cached Reader site as unblocked', () => {
			const queryClient = new QueryClient();
			const queryKey = readSiteQuery( 123 ).queryKey;
			queryClient.setQueryData( queryKey, { ID: 123, is_blocked: true } );
			getCalypsoQueryClient.mockReturnValue( queryClient );

			unblockSite( 123 );

			expect( queryClient.getQueryData( queryKey ) ).toMatchObject( { is_blocked: false } );
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

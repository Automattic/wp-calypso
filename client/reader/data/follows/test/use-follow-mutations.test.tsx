/**
 * @jest-environment jsdom
 */
import { readSiteQuery, getFollowsQueryKey } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { QueryClient } from '@tanstack/react-query';
import {
	getFollowingSource,
	invalidateFollowSensitiveCaches,
	patchReadSiteFollowStatus,
	patchReadSiteFollowStatusByBlogId,
} from '../use-follow-mutations';
import type { ReadSiteResponse } from '@automattic/api-core';

jest.mock( '@automattic/calypso-config', () => {
	const mockConfig = jest.fn();

	return {
		__esModule: true,
		default: mockConfig,
	};
} );

const makeQueryClient = () => new QueryClient( { defaultOptions: { queries: { retry: false } } } );

const makeSite = ( overrides: Partial< ReadSiteResponse > = {} ): ReadSiteResponse =>
	( {
		ID: 1,
		feed_URL: 'https://example.com/feed/',
		is_following: false,
		...overrides,
	} ) as ReadSiteResponse;

const mockConfig = config as jest.MockedFunction< typeof config >;

describe( 'follow mutation cache helpers', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'patchReadSiteFollowStatus updates cached read sites by matching feed_URL', () => {
		const queryClient = makeQueryClient();
		queryClient.setQueryData( [ 'read', 'sites', 1 ], makeSite() );
		queryClient.setQueryData(
			[ 'read', 'sites', 2 ],
			makeSite( { ID: 2, feed_URL: 'https://other.example/feed/' } )
		);

		patchReadSiteFollowStatus( queryClient, 'https://example.com/feed', true );

		expect(
			queryClient.getQueryData< ReadSiteResponse >( [ 'read', 'sites', 1 ] )?.is_following
		).toBe( true );
		expect(
			queryClient.getQueryData< ReadSiteResponse >( [ 'read', 'sites', 2 ] )?.is_following
		).toBe( false );
	} );

	it( 'patchReadSiteFollowStatusByBlogId updates the read site query for numeric blog IDs', () => {
		const queryClient = makeQueryClient();
		const queryKey = readSiteQuery( 123 ).queryKey;
		queryClient.setQueryData( queryKey, makeSite( { ID: 123 } ) );

		patchReadSiteFollowStatusByBlogId( queryClient, '123', true );

		expect( queryClient.getQueryData< ReadSiteResponse >( queryKey )?.is_following ).toBe( true );
	} );

	it( 'invalidateFollowSensitiveCaches invalidates follows and follow-sensitive read caches', async () => {
		const queryClient = makeQueryClient();
		const queryKeys = [
			getFollowsQueryKey(),
			[ 'read', 'stream', 'following' ],
			[ 'read', 'stream', 'infinite', 'following' ],
			[ 'read', 'site-subscriptions' ],
			[ 'read', 'subscriptions-count' ],
		] as const;

		for ( const queryKey of queryKeys ) {
			queryClient.setQueryData( queryKey, { value: queryKey.join( ':' ) } );
		}

		await invalidateFollowSensitiveCaches( queryClient );

		for ( const queryKey of queryKeys ) {
			expect( queryClient.getQueryState( queryKey )?.isInvalidated ).toBe( true );
		}
	} );

	it( 'getFollowingSource reads the configured following source', () => {
		mockConfig.mockReturnValue( 'test-follow-source' );

		expect( getFollowingSource() ).toBe( 'test-follow-source' );
		expect( mockConfig ).toHaveBeenCalledWith( 'readerFollowingSource' );
	} );
} );

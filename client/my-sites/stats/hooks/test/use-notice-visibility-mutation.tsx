/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import useNoticeVisibilityMutation from '../use-notice-visibility-mutation';
import {
	noticesVisibilityQueryKey,
	NoticeRecords,
	useNoticesVisibilityQuery,
} from '../use-notice-visibility-query';

const mockPost = jest.fn();
const mockGet = jest.fn();
jest.mock( 'calypso/lib/wp', () => ( {
	__esModule: true,
	default: {
		req: {
			post: ( ...args: unknown[] ) => mockPost( ...args ),
			get: ( ...args: unknown[] ) => mockGet( ...args ),
		},
	},
} ) );

const SITE_ID = 123;
const THIRTY_DAYS = 30 * 24 * 3600;

const visibleRecord = { show: true, status: null, postponed_count: 0, next_show_at: null };

const renderMutation = (
	client: QueryClient,
	status?: 'dismissed' | 'postponed',
	seconds?: number
) =>
	renderHook(
		() => useNoticeVisibilityMutation( SITE_ID, 'premium_analytics_preview', status, seconds ),
		{
			wrapper: ( { children } ) => (
				<QueryClientProvider client={ client }>{ children }</QueryClientProvider>
			),
		}
	);

describe( 'useNoticeVisibilityMutation', () => {
	let client: QueryClient;

	beforeEach( () => {
		jest.clearAllMocks();
		client = new QueryClient( {
			defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
		} );
		mockGet.mockResolvedValue( {} );
		client.setQueryData< NoticeRecords >( noticesVisibilityQueryKey( SITE_ID ), {
			premium_analytics_preview: visibleRecord,
			tier_upgrade: visibleRecord,
		} as NoticeRecords );
	} );

	it( 'sends the hook arguments when the call passes nothing', async () => {
		mockPost.mockResolvedValue( { updated: true } );
		const { result } = renderMutation( client, 'postponed', THIRTY_DAYS );

		await result.current.mutateAsync();

		expect( mockPost ).toHaveBeenCalledWith(
			expect.objectContaining( {
				body: { id: 'premium_analytics_preview', status: 'postponed', postponed_for: THIRTY_DAYS },
			} )
		);
	} );

	it( 'lets a call override the update, so one hook can escalate', async () => {
		mockPost.mockResolvedValue( { updated: true } );
		const { result } = renderMutation( client );

		await result.current.mutateAsync( { status: 'postponed', postponedFor: THIRTY_DAYS } );
		await result.current.mutateAsync( { status: 'dismissed' } );

		expect( mockPost.mock.calls.map( ( [ params ] ) => params.body ) ).toEqual( [
			{ id: 'premium_analytics_preview', status: 'postponed', postponed_for: THIRTY_DAYS },
			{ id: 'premium_analytics_preview', status: 'dismissed', postponed_for: 0 },
		] );
	} );

	it( 'writes the returned record into the cache as hidden, without a refetch', async () => {
		const invalidate = jest.spyOn( client, 'invalidateQueries' );
		mockPost.mockResolvedValue( {
			updated: true,
			notice: {
				id: 'premium_analytics_preview',
				status: 'postponed',
				dismissed_at: 1_700_000_000,
				postponed_count: 1,
				next_show_at: 1_700_000_000 + THIRTY_DAYS,
			},
		} );
		const { result } = renderMutation( client );

		await result.current.mutateAsync( { status: 'postponed', postponedFor: THIRTY_DAYS } );

		await waitFor( () =>
			expect(
				client.getQueryData< NoticeRecords >( noticesVisibilityQueryKey( SITE_ID ) )
					?.premium_analytics_preview
			).toEqual( {
				show: false,
				status: 'postponed',
				postponed_count: 1,
				next_show_at: 1_700_000_000 + THIRTY_DAYS,
			} )
		);
		expect(
			client.getQueryData< NoticeRecords >( noticesVisibilityQueryKey( SITE_ID ) )?.tier_upgrade
		).toBe( visibleRecord );
		expect( invalidate ).not.toHaveBeenCalled();
	} );

	it( 'hides the notice even if the returned record claims it is shown', async () => {
		mockPost.mockResolvedValue( {
			updated: true,
			notice: { show: true, status: 'postponed', postponed_count: 1, next_show_at: 1 },
		} );
		const { result } = renderMutation( client );

		await result.current.mutateAsync( { status: 'postponed', postponedFor: THIRTY_DAYS } );

		await waitFor( () =>
			expect(
				client.getQueryData< NoticeRecords >( noticesVisibilityQueryKey( SITE_ID ) )
					?.premium_analytics_preview.show
			).toBe( false )
		);
	} );

	/**
	 * A fetch already in flight resolves after the patch and would put the pre-dismissal record
	 * back. Invalidating cancels it and refetches, which is how trunk always converged.
	 */
	it( 'refetches instead of patching while a fetch is in flight', async () => {
		const invalidate = jest.spyOn( client, 'invalidateQueries' );
		let answerStaleGet: ( payload: unknown ) => void = () => {};
		mockGet
			.mockReturnValueOnce( new Promise( ( resolve ) => ( answerStaleGet = resolve ) ) )
			.mockResolvedValue( {
				premium_analytics_preview: { show: false, status: 'postponed', postponed_count: 1 },
			} );
		mockPost.mockResolvedValue( {
			updated: true,
			notice: { status: 'postponed', postponed_count: 1, next_show_at: 1 },
		} );
		const { result: query } = renderHook( () => useNoticesVisibilityQuery( SITE_ID ), {
			wrapper: ( { children } ) => (
				<QueryClientProvider client={ client }>{ children }</QueryClientProvider>
			),
		} );
		client.refetchQueries( { queryKey: noticesVisibilityQueryKey( SITE_ID ) } );
		await waitFor( () => expect( query.current.isFetching ).toBe( true ) );
		const { result } = renderMutation( client );

		await result.current.mutateAsync( { status: 'postponed', postponedFor: THIRTY_DAYS } );

		expect( invalidate ).toHaveBeenCalledWith( { queryKey: noticesVisibilityQueryKey( SITE_ID ) } );
		answerStaleGet( { premium_analytics_preview: true } );
		await waitFor( () => expect( query.current.data?.premium_analytics_preview ).toBe( false ) );
		expect( mockGet ).toHaveBeenCalledTimes( 2 );
	} );

	/**
	 * A server predating the detail contract answers `{ updated }` alone. The refetch is what
	 * hides the notice there, so it has to stay.
	 */
	it( 'falls back to a refetch when the response carries no record', async () => {
		const invalidate = jest.spyOn( client, 'invalidateQueries' );
		mockPost.mockResolvedValue( { updated: true } );
		const { result } = renderMutation( client );

		await result.current.mutateAsync( { status: 'postponed', postponedFor: THIRTY_DAYS } );

		await waitFor( () =>
			expect( invalidate ).toHaveBeenCalledWith( {
				queryKey: noticesVisibilityQueryKey( SITE_ID ),
			} )
		);
		expect(
			client.getQueryData< NoticeRecords >( noticesVisibilityQueryKey( SITE_ID ) )
				?.premium_analytics_preview
		).toBe( visibleRecord );
	} );

	it( 'does not seed a cache that was never fetched', async () => {
		client.removeQueries( { queryKey: noticesVisibilityQueryKey( SITE_ID ) } );
		const invalidate = jest.spyOn( client, 'invalidateQueries' );
		mockPost.mockResolvedValue( {
			updated: true,
			notice: { status: 'dismissed', postponed_count: 1, next_show_at: null },
		} );
		const { result } = renderMutation( client );

		await result.current.mutateAsync( { status: 'dismissed' } );

		await waitFor( () => expect( invalidate ).toHaveBeenCalled() );
		expect( client.getQueryData( noticesVisibilityQueryKey( SITE_ID ) ) ).toBeUndefined();
	} );
} );

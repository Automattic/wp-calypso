/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import useNoticeVisibilityMutation from '../use-notice-visibility-mutation';
import { noticesVisibilityQueryKey } from '../use-notice-visibility-query';

const mockPost = jest.fn();
jest.mock( 'calypso/lib/wp', () => ( {
	__esModule: true,
	default: { req: { post: ( ...args: unknown[] ) => mockPost( ...args ) } },
} ) );

const SITE_ID = 123;
const THIRTY_DAYS = 30 * 24 * 3600;

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
		client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
		mockPost.mockResolvedValue( { updated: true } );
	} );

	it( 'sends the hook arguments when the call passes nothing', async () => {
		const { result } = renderMutation( client, 'postponed', THIRTY_DAYS );

		await result.current.mutateAsync();

		expect( mockPost ).toHaveBeenCalledWith(
			expect.objectContaining( {
				body: { id: 'premium_analytics_preview', status: 'postponed', postponed_for: THIRTY_DAYS },
			} )
		);
	} );

	it( 'lets a call override the update, so one hook can escalate', async () => {
		const { result } = renderMutation( client );

		await result.current.mutateAsync( { status: 'postponed', postponedFor: THIRTY_DAYS } );
		await result.current.mutateAsync( { status: 'dismissed' } );

		expect( mockPost.mock.calls.map( ( [ params ] ) => params.body ) ).toEqual( [
			{ id: 'premium_analytics_preview', status: 'postponed', postponed_for: THIRTY_DAYS },
			{ id: 'premium_analytics_preview', status: 'dismissed', postponed_for: 0 },
		] );
	} );

	it( 'refetches the notices once the write lands', async () => {
		const invalidate = jest.spyOn( client, 'invalidateQueries' );
		const { result } = renderMutation( client );

		await result.current.mutateAsync( { status: 'dismissed' } );

		await waitFor( () =>
			expect( invalidate ).toHaveBeenCalledWith( {
				queryKey: noticesVisibilityQueryKey( SITE_ID ),
			} )
		);
	} );
} );

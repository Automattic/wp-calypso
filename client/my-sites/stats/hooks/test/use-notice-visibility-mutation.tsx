/**
 * @vitest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import useNoticeVisibilityMutation from '../use-notice-visibility-mutation';
import { noticesVisibilityQueryKey } from '../use-notice-visibility-query';

const mockPost = vi.fn();
vi.mock( 'calypso/lib/wp', () => ( {
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
	renderHook( () => useNoticeVisibilityMutation( SITE_ID, 'pricing_grid', status, seconds ), {
		wrapper: ( { children } ) => (
			<QueryClientProvider client={ client }>{ children }</QueryClientProvider>
		),
	} );

describe( 'useNoticeVisibilityMutation', () => {
	let client: QueryClient;

	beforeEach( () => {
		vi.clearAllMocks();
		client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
		mockPost.mockResolvedValue( { updated: true } );
	} );

	it( 'sends the hook arguments', async () => {
		const { result } = renderMutation( client, 'postponed', THIRTY_DAYS );

		await result.current.mutateAsync();

		expect( mockPost ).toHaveBeenCalledWith(
			expect.objectContaining( {
				body: { id: 'pricing_grid', status: 'postponed', postponed_for: THIRTY_DAYS },
			} )
		);
	} );

	it( 'refetches the notices once the write lands', async () => {
		const invalidate = vi.spyOn( client, 'invalidateQueries' );
		const { result } = renderMutation( client );

		await result.current.mutateAsync();

		await waitFor( () =>
			expect( invalidate ).toHaveBeenCalledWith( {
				queryKey: noticesVisibilityQueryKey( SITE_ID ),
			} )
		);
	} );
} );

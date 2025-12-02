/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { useSuggestionMutation } from '..';
import { getQueryKey as getEligibilityQueryKey } from '../../use-eligibility-query';

describe( 'useSuggestionMutation', () => {
	const Wrapper =
		( queryClient?: QueryClient ) =>
		( { children }: { children: React.ReactNode } ) => {
			return (
				<QueryClientProvider client={ queryClient || new QueryClient() }>
					{ children }
				</QueryClientProvider>
			);
		};

	const render = (
		hook: () => ReturnType< typeof useSuggestionMutation >,
		queryClient?: QueryClient
	) => {
		return renderHook( () => hook(), {
			wrapper: Wrapper( queryClient ),
		} );
	};

	it( 'post a suggestion', async () => {
		const blogId = 123;
		const postId = 456;
		nock( 'https://public-api.wordpress.com' )
			.post( `/wpcom/v2/freshly-pressed/suggest/${ blogId }/${ postId }`, { source: 'reader' } )
			.reply( 200, {
				body: true,
				status: 200,
				headers: {
					Allow: 'POST',
				},
			} );

		const { result } = render( () => useSuggestionMutation( { blogId, postId } ) );

		result.current.mutate();

		await waitFor( () => {
			expect( result.current.isSuccess ).toBe( true );
			expect( result.current.data?.body ).toBe( true );
		} );
	} );

	it( 'returns error when the request fails', async () => {
		const blogId = 34234234;
		const postId = 123;
		nock( 'https://public-api.wordpress.com' )
			.post( `/wpcom/v2/freshly-pressed/suggest/${ blogId }/${ postId }`, { source: 'reader' } )
			.reply( 400, {
				body: false,
				status: 400,
				headers: {
					Allow: 'POST',
				},
			} );

		const { result } = render( () => useSuggestionMutation( { blogId, postId } ) );

		result.current.mutate();

		await waitFor( () => {
			expect( result.current.isError ).toBe( true );
			expect( result.current.error ).toBeDefined();
		} );
	} );

	it( 'calls on success', async () => {
		const blogId = 34234234;
		const postId = 123;
		nock( 'https://public-api.wordpress.com' )
			.post( `/wpcom/v2/freshly-pressed/suggest/${ blogId }/${ postId }`, { source: 'reader' } )
			.reply( 200, {
				body: true,
				status: 200,
				headers: {
					Allow: 'POST',
				},
			} );

		const onSuccess = jest.fn();
		const { result } = render( () => useSuggestionMutation( { blogId, postId }, { onSuccess } ) );

		result.current.mutate();

		await waitFor( () => {
			expect( onSuccess ).toHaveBeenCalled();
		} );
	} );

	it( 'forces the eligibility query cache to be invalidated and a new request is made', async () => {
		const blogId = 34234234;
		const postId = 123;
		const queryClient = new QueryClient();

		queryClient.setQueryData( getEligibilityQueryKey( { blogId, postId } ), {
			eligible: true,
			wasSuggested: false,
			details: null,
		} );

		nock( 'https://public-api.wordpress.com' )
			.post( `/wpcom/v2/freshly-pressed/suggest/${ blogId }/${ postId }`, { source: 'reader' } )
			.reply( 200, {
				body: true,
				status: 200,
				headers: {
					Allow: 'POST',
				},
			} );

		const { result } = render( () => useSuggestionMutation( { blogId, postId } ), queryClient );

		result.current.mutate();

		await waitFor( () => {
			const state = queryClient.getQueryState( getEligibilityQueryKey( { blogId, postId } ) );
			//It should be invalidated and a new request should be made
			expect( state?.isInvalidated ).toBe( true );
		} );
	} );
} );

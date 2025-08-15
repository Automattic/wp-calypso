/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { useFreshlyPressedMutation } from '..';

describe( 'useFreshlyPressedMutation', () => {
	const Wrapper = ( { children }: { children: React.ReactNode } ) => {
		const queryClient = new QueryClient();
		return <QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>;
	};
	it( 'post a suggestion', async () => {
		const blogId = 123;
		const postId = 456;
		nock( 'https://public-api.wordpress.com' )
			.post( `/wpcom/v2/freshly-pressed/suggest/${ blogId }/${ postId }` )
			.reply( 200, {
				body: true,
				status: 200,
				headers: {
					Allow: 'POST',
				},
			} );

		const { result } = renderHook(
			() =>
				useFreshlyPressedMutation( {
					blogId,
					postId,
				} ),
			{
				wrapper: Wrapper,
			}
		);

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
			.post( `/wpcom/v2/freshly-pressed/suggest/${ blogId }/${ postId }` )
			.reply( 400, {
				body: false,
				status: 400,
				headers: {
					Allow: 'POST',
				},
			} );

		const { result } = renderHook(
			() =>
				useFreshlyPressedMutation( {
					blogId,
					postId,
				} ),
			{
				wrapper: Wrapper,
			}
		);

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
			.post( `/wpcom/v2/freshly-pressed/suggest/${ blogId }/${ postId }` )
			.reply( 200, {
				body: true,
				status: 200,
				headers: {
					Allow: 'POST',
				},
			} );

		const onSuccess = jest.fn();
		const { result } = renderHook(
			() =>
				useFreshlyPressedMutation(
					{
						blogId,
						postId,
					},
					{
						onSuccess,
					}
				),
			{
				wrapper: Wrapper,
			}
		);

		result.current.mutate();

		await waitFor( () => {
			expect( onSuccess ).toHaveBeenCalled();
		} );
	} );
} );

/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import { getSessionRating, useRateArticle } from '../use-rate-article';

jest.mock( 'wpcom-proxy-request', () => ( {
	__esModule: true,
	default: jest.fn(),
	canAccessWpcomApis: () => true,
} ) );

const mockedRequest = wpcomRequest as jest.Mock;

function renderRateArticle() {
	const queryClient = new QueryClient();
	const wrapper = ( { children }: { children: React.ReactNode } ) =>
		React.createElement( QueryClientProvider, { client: queryClient }, children );

	return renderHook( () => useRateArticle(), { wrapper } );
}

describe( 'useRateArticle', () => {
	beforeEach( () => jest.clearAllMocks() );

	it( 'posts the rating and remembers the rating on record', async () => {
		mockedRequest.mockResolvedValue( { user_rating: 2 } );
		const { result } = renderRateArticle();

		result.current.mutate( { blogId: 9619154, postId: 1001, rating: 1, persist: true } );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( mockedRequest ).toHaveBeenCalledWith(
			expect.objectContaining( {
				path: '/help/article/rating',
				method: 'POST',
				body: { blog_id: 9619154, post_id: 1001, rating: 1 },
			} )
		);
		expect( getSessionRating( 9619154, 1001 ) ).toBe( 2 );
	} );

	it( 'only remembers the rating for the session when it cannot be persisted', async () => {
		const { result } = renderRateArticle();

		result.current.mutate( { blogId: 9619154, postId: 1002, rating: 1, persist: false } );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( mockedRequest ).not.toHaveBeenCalled();
		expect( getSessionRating( 9619154, 1002 ) ).toBe( 1 );
	} );

	it( 'forgets the rating when the request fails', async () => {
		mockedRequest.mockRejectedValue( new Error( 'offline' ) );
		const { result } = renderRateArticle();

		result.current.mutate( { blogId: 9619154, postId: 1003, rating: 1, persist: true } );

		await waitFor( () => expect( result.current.isError ).toBe( true ) );
		expect( getSessionRating( 9619154, 1003 ) ).toBeUndefined();
	} );

	it( 'keeps ratings apart per blog', async () => {
		const { result } = renderRateArticle();

		result.current.mutate( { blogId: 1, postId: 1004, rating: 1, persist: false } );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( getSessionRating( 1, 1004 ) ).toBe( 1 );
		expect( getSessionRating( 2, 1004 ) ).toBeUndefined();
	} );

	it( 'has no session rating for an article that was not rated', () => {
		expect( getSessionRating( 9619154, 1005 ) ).toBeUndefined();
	} );
} );

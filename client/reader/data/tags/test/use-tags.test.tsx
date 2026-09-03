/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { thunk as thunkMiddleware } from 'redux-thunk';
import initialReducer from 'calypso/state/reducer';
import { useFollowedTags, useTagBySlug } from '../use-tags';

const BASE = 'https://public-api.wordpress.com';

function makeWrapper() {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	const store = createStore( initialReducer, {}, applyMiddleware( thunkMiddleware ) );

	const Wrapper = ( { children }: { children: React.ReactNode } ) => (
		<QueryClientProvider client={ queryClient }>
			<Provider store={ store }>{ children }</Provider>
		</QueryClientProvider>
	);

	return { Wrapper };
}

describe( 'useFollowedTags', () => {
	afterEach( () => nock.cleanAll() );

	it( 'returns the followed tags, annotated with isFollowing and sorted by slug', async () => {
		nock( BASE )
			.get( '/rest/v1.2/read/tags' )
			.query( true )
			.reply( 200, {
				tags: [
					{
						ID: '99',
						slug: 'photography',
						title: 'Photography',
						display_name: 'Photography',
						URL: '/tag/photography',
					},
					{
						ID: '12',
						slug: 'food',
						title: 'Food &amp; Drink',
						display_name: 'food',
						URL: '/tag/food',
						description: 'Tasty &amp; delicious',
					},
				],
			} );

		const { Wrapper } = makeWrapper();
		const { result } = renderHook( () => useFollowedTags(), { wrapper: Wrapper } );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		// Sorted by slug (food before photography), HTML entities decoded, isFollowing: true.
		expect( result.current.data ).toEqual( [
			{
				id: '12',
				slug: 'food',
				title: 'Food & Drink',
				displayName: 'Food & Drink',
				url: '/tag/food',
				description: 'Tasty & delicious',
				isFollowing: true,
			},
			{
				id: '99',
				slug: 'photography',
				title: 'Photography',
				displayName: 'Photography',
				url: '/tag/photography',
				description: undefined,
				isFollowing: true,
			},
		] );
	} );
} );

describe( 'useTagBySlug', () => {
	afterEach( () => nock.cleanAll() );

	it( 'returns the normalized tag and isNotFound=false when the slug resolves', async () => {
		nock( BASE )
			.get( '/rest/v1.2/read/tags/food' )
			.query( true )
			.reply( 200, {
				tag: {
					ID: '12',
					slug: 'food',
					title: 'Food &amp; Drink',
					display_name: 'food',
					URL: '/tag/food',
				},
			} );

		const { Wrapper } = makeWrapper();
		const { result } = renderHook( () => useTagBySlug( 'food' ), { wrapper: Wrapper } );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( result.current.data ).toEqual( {
			id: '12',
			slug: 'food',
			title: 'Food & Drink',
			displayName: 'Food & Drink',
			url: '/tag/food',
			description: undefined,
		} );
		expect( result.current.isNotFound ).toBe( false );
	} );

	it( 'sets isNotFound=true when the API responds 404 for the slug', async () => {
		nock( BASE )
			.get( '/rest/v1.2/read/tags/does-not-exist' )
			.query( true )
			.reply( 404, { error: 'unknown_tag', message: '', statusCode: 404, status: 404 } );

		const { Wrapper } = makeWrapper();
		const { result } = renderHook( () => useTagBySlug( 'does-not-exist' ), { wrapper: Wrapper } );

		await waitFor( () => expect( result.current.isError ).toBe( true ) );
		expect( result.current.isNotFound ).toBe( true );
	} );

	it( 'keeps isNotFound=false for non-404 errors', async () => {
		nock( BASE )
			.get( '/rest/v1.2/read/tags/boom' )
			.query( true )
			.reply( 500, { error: 'server_error', message: '', statusCode: 500, status: 500 } );

		const { Wrapper } = makeWrapper();
		const { result } = renderHook( () => useTagBySlug( 'boom' ), { wrapper: Wrapper } );

		await waitFor( () => expect( result.current.isError ).toBe( true ) );
		expect( result.current.isNotFound ).toBe( false );
	} );

	it( 'is disabled (no fetch) and isNotFound=false for a falsy slug', () => {
		const { Wrapper } = makeWrapper();
		const { result } = renderHook( () => useTagBySlug( undefined ), { wrapper: Wrapper } );

		expect( result.current.data ).toBeUndefined();
		expect( result.current.isLoading ).toBe( false );
		expect( result.current.isNotFound ).toBe( false );
	} );
} );

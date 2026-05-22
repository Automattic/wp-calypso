/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Provider } from 'react-redux';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { thunk as thunkMiddleware } from 'redux-thunk';
import { upsertPostCache } from 'calypso/reader/data/post-cache';
import readerReducer from 'calypso/state/reader/reducer';
import PostLifecycle from '../post-lifecycle';
import type { ForwardRefExoticComponent, ReactNode, RefAttributes } from 'react';

type PostLifecycleProps = {
	postKey: { blogId?: number; feedId?: number; postId: number };
	blockedSites: unknown[];
};

const TestPostLifecycle = PostLifecycle as ForwardRefExoticComponent<
	PostLifecycleProps & RefAttributes< unknown >
>;

jest.mock( '../post', () => ( props: { post: { title?: string } } ) => (
	<div data-testid="stream-post">{ props.post.title }</div>
) );

jest.mock( 'calypso/components/blogging-prompt-card', () => () => (
	<div data-testid="blogging-prompt-card" />
) );

jest.mock( '../recommended-posts', () => () => <div data-testid="recommended-posts" /> );
jest.mock( '../empty-search-recommended-post', () => () => (
	<div data-testid="empty-search-recommended-post" />
) );
jest.mock( '../post-placeholder', () => () => <div data-testid="post-placeholder" /> );
jest.mock( '../post-unavailable', () => () => <div data-testid="post-unavailable" /> );
jest.mock( '../x-post', () => () => <div data-testid="x-post" /> );
jest.mock( 'calypso/blocks/reader-post-card/blocked', () => () => (
	<div data-testid="post-blocked" />
) );

function makeWrapper( queryClient: QueryClient ) {
	const store = createStore(
		combineReducers( { reader: readerReducer } ),
		undefined,
		applyMiddleware( thunkMiddleware )
	);

	return function Wrapper( { children }: { children: ReactNode } ) {
		return (
			<QueryClientProvider client={ queryClient }>
				<Provider store={ store }>{ children }</Provider>
			</QueryClientProvider>
		);
	};
}

describe( 'PostLifecycle', () => {
	it( 'renders posts from the canonical post cache', () => {
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		upsertPostCache( queryClient, [
			{
				ID: 1,
				site_ID: 100,
				global_ID: 'global-1',
				title: 'Canonical title',
				content: '<p>Canonical body</p>',
			},
		] );
		const Wrapper = makeWrapper( queryClient );

		render(
			<Wrapper>
				<TestPostLifecycle postKey={ { blogId: 100, postId: 1 } } blockedSites={ [] } />
			</Wrapper>
		);

		expect( screen.getByTestId( 'stream-post' ) ).toHaveTextContent( 'Canonical title' );
	} );

	it( 'forwards refs for InfiniteList item measurement', () => {
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		upsertPostCache( queryClient, [
			{
				ID: 1,
				site_ID: 100,
				global_ID: 'global-1',
				title: 'Canonical title',
			},
		] );
		const Wrapper = makeWrapper( queryClient );
		const postLifecycleRef = createRef< unknown >();

		render(
			<Wrapper>
				<TestPostLifecycle
					ref={ postLifecycleRef }
					postKey={ { blogId: 100, postId: 1 } }
					blockedSites={ [] }
				/>
			</Wrapper>
		);

		expect( postLifecycleRef.current ).not.toBeNull();
	} );

	it( 'renders a placeholder when no canonical cache entry exists', () => {
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		const Wrapper = makeWrapper( queryClient );

		render(
			<Wrapper>
				<TestPostLifecycle postKey={ { blogId: 100, postId: 1 } } blockedSites={ [] } />
			</Wrapper>
		);

		expect( screen.getByTestId( 'post-placeholder' ) ).toBeInTheDocument();
		expect( screen.queryByTestId( 'stream-post' ) ).not.toBeInTheDocument();
	} );
} );

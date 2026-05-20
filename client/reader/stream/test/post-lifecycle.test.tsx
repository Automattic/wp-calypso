/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { thunk as thunkMiddleware } from 'redux-thunk';
import { upsertReaderPostEntities } from 'calypso/reader/data/reader-post-entities';
import { READER_POSTS_RECEIVE } from 'calypso/state/reader/action-types';
import readerReducer from 'calypso/state/reader/reducer';
import PostLifecycle from '../post-lifecycle';
import type { ReactNode } from 'react';

jest.mock( '../post', () => ( props: { post: { title?: string } } ) => (
	<div data-testid="stream-post">{ props.post.title }</div>
) );

jest.mock( 'calypso/components/data/query-reader-post', () => () => (
	<div data-testid="query-reader-post" />
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

function makeWrapper( queryClient: QueryClient, posts: Array< Record< string, unknown > > = [] ) {
	const store = createStore(
		combineReducers( { reader: readerReducer } ),
		undefined,
		applyMiddleware( thunkMiddleware )
	);
	store.dispatch( { type: READER_POSTS_RECEIVE, posts } );

	return function Wrapper( { children }: { children: ReactNode } ) {
		return (
			<QueryClientProvider client={ queryClient }>
				<Provider store={ store }>{ children }</Provider>
			</QueryClientProvider>
		);
	};
}

describe( 'PostLifecycle', () => {
	it( 'renders posts from the canonical post entity cache', () => {
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		upsertReaderPostEntities( queryClient, [
			{ ID: 1, site_ID: 100, global_ID: 'global-1', title: 'Canonical title' },
		] );
		const Wrapper = makeWrapper( queryClient );

		render(
			<Wrapper>
				<PostLifecycle postKey={ { blogId: 100, postId: 1 } } blockedSites={ [] } />
			</Wrapper>
		);

		expect( screen.getByTestId( 'stream-post' ) ).toHaveTextContent( 'Canonical title' );
		expect( screen.queryByTestId( 'query-reader-post' ) ).not.toBeInTheDocument();
	} );

	it( 'falls back to Redux posts when no canonical entity exists', () => {
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		const Wrapper = makeWrapper( queryClient, [
			{ ID: 1, site_ID: 100, global_ID: 'global-1', title: 'Redux title' },
		] );

		render(
			<Wrapper>
				<PostLifecycle postKey={ { blogId: 100, postId: 1 } } blockedSites={ [] } />
			</Wrapper>
		);

		expect( screen.getByTestId( 'stream-post' ) ).toHaveTextContent( 'Redux title' );
		expect( screen.queryByTestId( 'query-reader-post' ) ).not.toBeInTheDocument();
	} );
} );

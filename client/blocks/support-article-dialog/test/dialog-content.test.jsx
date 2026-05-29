/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { Provider } from 'react-redux';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { thunk as thunkMiddleware } from 'redux-thunk';
import { upsertPostCache } from 'calypso/reader/data/post/cache';
import { createPostCacheMiddleware } from 'calypso/reader/data/post/middleware';
import readerReducer from 'calypso/state/reader/reducer';
import DialogContent from '../dialog-content';

jest.mock( '@automattic/components', () => ( {
	EmbedContainer: ( { children } ) => <div>{ children }</div>,
} ) );

jest.mock( '@automattic/i18n-utils', () => ( {
	useLocale: () => 'en',
} ) );

jest.mock( '@automattic/support-articles', () => ( {
	SupportArticleHeader: ( { post, isLoading } ) => (
		<div data-testid="support-article-header" data-loading={ String( isLoading ) }>
			{ post?.title }
		</div>
	),
} ) );

jest.mock( 'calypso/state/reader/conversations/actions', () => ( {
	updateConversationFollowStatus: jest.fn( ( payload ) => ( {
		type: 'UPDATE_CONVERSATION_FOLLOW_STATUS',
		payload,
	} ) ),
} ) );

jest.mock( 'calypso/components/data/query-reader-site', () => ( {
	__esModule: true,
	default: () => <div data-testid="query-reader-site" />,
} ) );

const makeQueryClient = () => new QueryClient( { defaultOptions: { queries: { retry: false } } } );

const makeStore = ( queryClient ) =>
	createStore(
		combineReducers( { reader: readerReducer } ),
		undefined,
		applyMiddleware(
			thunkMiddleware,
			createPostCacheMiddleware( () => queryClient )
		)
	);

const renderWithProviders = ( queryClient, children ) =>
	render(
		<QueryClientProvider client={ queryClient }>
			<Provider store={ makeStore( queryClient ) }>{ children }</Provider>
		</QueryClientProvider>
	);

describe( 'DialogContent', () => {
	beforeEach( () => {
		nock.cleanAll();
	} );

	it( 'renders a support article from the canonical Reader post cache', () => {
		const queryClient = makeQueryClient();
		upsertPostCache( queryClient, [
			{
				ID: 123,
				site_ID: 456,
				global_ID: 'support-article-123',
				title: 'Cached support article',
				content: '<p>Cached support article body</p>',
			},
		] );

		renderWithProviders( queryClient, <DialogContent blogId={ 456 } postId={ 123 } /> );

		expect( screen.getByTestId( 'support-article-header' ) ).toHaveTextContent(
			'Cached support article'
		);
		expect( screen.getByTestId( 'support-article-header' ) ).toHaveAttribute(
			'data-loading',
			'false'
		);
		expect( screen.getByText( 'Cached support article body' ) ).toBeInTheDocument();
	} );

	it( 'fetches a support article when it is missing from the post cache', async () => {
		const queryClient = makeQueryClient();
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/read/sites/456/posts/123' )
			.query( true )
			.reply( 200, {
				ID: 123,
				site_ID: 456,
				global_ID: 'support-article-123',
				title: 'Fetched support article',
				content: '<p>Fetched support article body</p>',
			} );

		renderWithProviders( queryClient, <DialogContent blogId={ 456 } postId={ 123 } /> );

		await waitFor( () =>
			expect( screen.getByTestId( 'support-article-header' ) ).toHaveTextContent(
				'Fetched support article'
			)
		);
		expect( screen.getByText( 'Fetched support article body' ) ).toBeInTheDocument();
	} );
} );

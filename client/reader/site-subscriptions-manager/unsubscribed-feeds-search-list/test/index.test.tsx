/**
 * @jest-environment jsdom
 */

import { getSiteSubscriptionsQueryKey } from '@automattic/api-queries';
import { Reader, SubscriptionManager } from '@automattic/data-stores';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render as rtlRender, screen } from '@testing-library/react';
import nock from 'nock';
import { ComponentProps } from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import ReaderFeedItem from 'calypso/blocks/reader-feed-item';
import FeedPreview from 'calypso/landing/subscriptions/components/feed-preview';
import { UnsubscribedFeedsSearchList } from '../index';

const mockUseSiteUnsubscribeMutation = SubscriptionManager.useSiteUnsubscribeMutation as jest.Mock;

jest.mock( '@automattic/data-stores', () => {
	const actual = jest.requireActual( '@automattic/data-stores' );
	return {
		...actual,
		SubscriptionManager: {
			...actual.SubscriptionManager,
			useSiteUnsubscribeMutation: jest.fn(),
		},
	};
} );

// Mock recordTrainTracksRender
const mockRecordTrainTracksRender = jest.fn();
jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTrainTracksRender: ( ...args: unknown[] ) => mockRecordTrainTracksRender( ...args ),
	getDoNotTrack: jest.fn(),
} ) );

// Mock FeedPreview component
jest.mock( 'calypso/landing/subscriptions/components/feed-preview', () => {
	return jest.fn( ( { url, source }: ComponentProps< typeof FeedPreview > ) => (
		<div data-testid="mock-feed-preview" data-url={ url } data-source={ source } />
	) );
} );

// Mock ReaderFeedItem component
jest.mock( 'calypso/blocks/reader-feed-item', () => {
	return jest.fn( ( { feed, source }: ComponentProps< typeof ReaderFeedItem > ) => (
		<div
			data-testid="mock-reader-feed-item"
			data-feed-id={ feed.feed_ID }
			data-blog-id={ feed.blog_ID }
			data-source={ source }
		/>
	) );
} );

const createMockFeedItem = ( overrides = {} ): Partial< Reader.FeedItem > => ( {
	feed_ID: '123',
	blog_ID: '456',
	subscribe_URL: 'https://example.com/feed',
	railcar: {
		railcar: 'test-railcar-id',
		fetch_algo: 'test-algo',
		fetch_position: 0,
		rec_blog_id: '456',
		fetch_lang: 'en',
	},
	meta: {},
	...overrides,
} );

const createMockSubscription = ( overrides = {} ) => ( {
	ID: 1,
	feed_ID: 999,
	blog_ID: 888,
	URL: 'https://subscribed.example.com',
	feed_URL: 'https://subscribed.example.com',
	is_following: true,
	isDeleted: false,
	...overrides,
} );

const makeSiteSubscriptionsData = (
	subscriptions: ReturnType< typeof createMockSubscription >[]
) => ( {
	pages: [
		{
			subscriptions,
			totalCount: subscriptions.length,
			page: 1,
			number: 100,
		},
	],
	pageParams: [ 1 ],
} );

const render = (
	ui: React.ReactNode,
	renderOptions: {
		searchTerm?: string;
		subscriptions?: Array< ReturnType< typeof createMockSubscription > >;
	} = { searchTerm: 'test' }
) => {
	const { subscriptions = [], searchTerm = 'test' } = renderOptions;
	mockUseSiteUnsubscribeMutation.mockReturnValue( { isPending: false } );

	const queryClient = new QueryClient( {
		defaultOptions: {
			queries: { retry: false },
		},
	} );
	queryClient.setQueryData(
		getSiteSubscriptionsQueryKey(),
		makeSiteSubscriptionsData( subscriptions )
	);

	const store = createStore( () => ( {
		currentUser: { id: 1 },
	} ) );

	return rtlRender( ui, {
		wrapper: ( { children }: { children: React.ReactNode } ) => (
			<Provider store={ store }>
				<SubscriptionManager.SiteSubscriptionsQueryPropsProvider
					initialSearchTermState={ searchTerm }
				>
					<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
				</SubscriptionManager.SiteSubscriptionsQueryPropsProvider>
			</Provider>
		),
	} );
};

describe( 'UnsubscribedFeedsSearchList', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		nock.disableNetConnect();
	} );

	afterEach( () => {
		nock.cleanAll();
	} );

	it( 'shows the loading state', () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/read/feed' )
			.query( () => true )
			.delay( 1000 );

		render( <UnsubscribedFeedsSearchList />, { searchTerm: 'test' } );

		expect( screen.getByRole( 'status' ) ).toBeVisible();
	} );

	it( 'renders error message when no feeds are found', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/read/feed' )
			.query( () => true )
			.reply( 200, {
				feeds: [],
			} );

		render( <UnsubscribedFeedsSearchList />, { searchTerm: 'test' } );
		expect(
			await screen.findByText( "Sorry, we couldn't find any sites related to your search." )
		).toBeVisible();
	} );

	it( 'renders nothing when there is no active search term', () => {
		const { container } = render( <UnsubscribedFeedsSearchList />, { searchTerm: '' } );

		expect(
			screen.queryByText( "Sorry, we couldn't find any sites related to your search." )
		).not.toBeInTheDocument();
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders error message when there is an error with the api', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/read/feed' )
			.query( () => true )
			.once()
			.reply( 500, {
				error: 'Internal Server Error',
			} );

		render( <UnsubscribedFeedsSearchList />, { searchTerm: 'test' } );
		expect(
			await screen.findByText( "Sorry, we couldn't find any sites related to your search." )
		).toBeVisible();
	} );

	it( 'renders list of feed items with a heading when the subscribed table has results', async () => {
		const feedItems = [
			createMockFeedItem( { feed_ID: '1', blog_ID: '1' } ),
			createMockFeedItem( { feed_ID: '2', blog_ID: '2' } ),
			createMockFeedItem( { feed_ID: '3', blog_ID: '3' } ),
		];

		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/read/feed' )
			.query( () => true )
			.once()
			.reply( 200, {
				feeds: feedItems,
			} );

		render( <UnsubscribedFeedsSearchList />, {
			searchTerm: 'test',
			subscriptions: [ createMockSubscription() ],
		} );

		const feedItemElements = await screen.findAllByTestId( 'mock-reader-feed-item' );
		expect( feedItemElements ).toHaveLength( 3 );
		expect( screen.queryByTestId( 'mock-feed-preview' ) ).not.toBeInTheDocument();

		feedItemElements.forEach( ( element ) => {
			expect( element ).toHaveAttribute(
				'data-source',
				'subscriptions-search-recommendation-list'
			);
		} );

		expect(
			screen.getByRole( 'heading', {
				name: 'Here are some other sites that match your search:',
			} )
		).toBeVisible();
	} );

	it( 'still renders a subscribed feed so ReaderFeedItem can show Unsubscribe', async () => {
		const feedItem = createMockFeedItem( {
			feed_ID: '123',
			blog_ID: '456',
			subscribe_URL: 'https://example.com/feed',
		} );

		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/read/feed' )
			.query( () => true )
			.once()
			.reply( 200, {
				feeds: [ feedItem ],
			} );

		render( <UnsubscribedFeedsSearchList />, {
			searchTerm: 'https://example.com/feed',
			subscriptions: [
				createMockSubscription( {
					feed_ID: 123,
					blog_ID: 456,
					URL: 'https://example.com/feed',
					feed_URL: 'https://example.com/feed',
				} ),
			],
		} );

		expect( await screen.findByTestId( 'mock-feed-preview' ) ).toBeVisible();
		expect( screen.getByTestId( 'mock-feed-preview' ) ).toHaveAttribute(
			'data-url',
			'https://example.com/feed'
		);
	} );

	it( 'omits the recommendation list heading when hideTitle is set', async () => {
		const feedItems = [
			createMockFeedItem( { feed_ID: '1', blog_ID: '1' } ),
			createMockFeedItem( { feed_ID: '2', blog_ID: '2' } ),
		];

		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/read/feed' )
			.query( () => true )
			.once()
			.reply( 200, {
				feeds: feedItems,
			} );

		render( <UnsubscribedFeedsSearchList hideTitle />, {
			searchTerm: 'test',
			subscriptions: [ createMockSubscription() ],
		} );

		await screen.findAllByTestId( 'mock-reader-feed-item' );

		expect(
			screen.queryByRole( 'heading', {
				name: 'Here are some other sites that match your search:',
			} )
		).not.toBeInTheDocument();
	} );

	it( 'does not render a heading when the subscribed table is empty', async () => {
		const feedItems = [
			createMockFeedItem( { feed_ID: '1', blog_ID: '1' } ),
			createMockFeedItem( { feed_ID: '2', blog_ID: '2' } ),
		];

		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/read/feed' )
			.query( () => true )
			.once()
			.reply( 200, {
				feeds: feedItems,
			} );

		render( <UnsubscribedFeedsSearchList />, { searchTerm: 'test', subscriptions: [] } );

		await screen.findAllByTestId( 'mock-reader-feed-item' );

		expect(
			screen.queryByRole( 'heading', {
				name: 'Here are some other sites that match your search:',
			} )
		).not.toBeInTheDocument();
	} );

	it( 'renders a feed preview with a heading when the subscribed table has results', async () => {
		const feedItem = createMockFeedItem( { feed_ID: '1', blog_ID: '1' } );

		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/read/feed' )
			.query( () => true )
			.once()
			.reply( 200, { feeds: [ feedItem ] } );

		render( <UnsubscribedFeedsSearchList />, {
			searchTerm: 'test',
			subscriptions: [ createMockSubscription() ],
		} );

		expect( await screen.findByTestId( 'mock-feed-preview' ) ).toBeVisible();
		expect( screen.queryByTestId( 'mock-reader-feed-item' ) ).not.toBeInTheDocument();
		expect(
			screen.getByRole( 'heading', {
				name: 'Here is one result that matches your search:',
			} )
		).toBeVisible();
	} );

	it( 'renders a feed preview without a heading when the subscribed table is empty', async () => {
		const feedItem = createMockFeedItem( { feed_ID: '1', blog_ID: '1' } );

		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/read/feed' )
			.query( () => true )
			.once()
			.reply( 200, { feeds: [ feedItem ] } );

		render( <UnsubscribedFeedsSearchList />, { searchTerm: 'test', subscriptions: [] } );

		expect( await screen.findByTestId( 'mock-feed-preview' ) ).toBeVisible();
		expect(
			screen.queryByRole( 'heading', {
				name: 'Here is one result that matches your search:',
			} )
		).not.toBeInTheDocument();
	} );
} );

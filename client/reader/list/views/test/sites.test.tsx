/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render as rtlRender, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { ComponentProps } from 'react';
import { ReaderSitesList } from 'calypso/reader/sites-list';
import ListSites from '../sites';

// ReaderSitesList has Redux dependencies (site data, follows, notices).
jest.mock( 'calypso/reader/sites-list', () => ( {
	ReaderSitesList: jest.fn( () => <ul data-testid="reader-sites-list" /> ),
} ) );

// ListEmpty uses Redux selectors and data-layer query components.
jest.mock( '../../components/empty', () => ( {
	__esModule: true,
	default: () => <div data-testid="list-empty">No sites</div>,
} ) );

// useInView relies on IntersectionObserver; mock to control infinite scroll.
const mockInView = jest.fn().mockReturnValue( { ref: jest.fn(), inView: false } );
jest.mock( 'react-intersection-observer', () => ( {
	useInView: ( ...args: unknown[] ) => mockInView( ...args ),
} ) );

const defaultList: ComponentProps< typeof ListSites >[ 'list' ] = {
	ID: 1,
	title: 'My List',
	slug: 'my-list',
	owner: 'test_user',
	is_owner: true,
};

let queryClient: QueryClient;

function renderWithClient( ui: React.ReactElement ) {
	queryClient = new QueryClient( {
		defaultOptions: {
			queries: { retry: false },
		},
	} );
	return rtlRender( <QueryClientProvider client={ queryClient }>{ ui }</QueryClientProvider> );
}

function nockListItems( response: Record< string, unknown > ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/read/lists/test_user/my-list/items' )
		.query( true )
		.reply( 200, response );
}

function createListItem( overrides: Record< string, unknown > = {} ) {
	return {
		ID: '1',
		feed_ID: 100,
		site_ID: 200,
		tag_ID: 0,
		meta: {
			links: { feed: 'https://example.com/feed' },
			data: {
				feed: {
					blog_ID: '200',
					feed_ID: '100',
					name: 'Example Feed',
					feed_URL: 'https://example.com/feed',
					image: 'https://example.com/icon.jpg',
				},
				site: {
					ID: 200,
					name: 'Example Site',
					feed_ID: 100,
					feed_URL: 'https://example.com/feed',
					icon: { img: 'https://example.com/site-icon.jpg' },
				},
			},
		},
		...overrides,
	};
}

describe( 'ListSites', () => {
	afterEach( () => {
		queryClient?.clear();
		nock.cleanAll();
		jest.clearAllMocks();
	} );

	test( 'shows loading spinner while fetching', () => {
		// Nock a normal response — the query starts async so the first render is still loading.
		nockListItems( { items: [], total_items: 0 } );

		renderWithClient( <ListSites list={ defaultList } /> );

		expect( screen.getByText( 'Loading sites' ) ).toBeVisible();
	} );

	test( 'shows empty state when there are no items', async () => {
		nockListItems( { items: [], total_items: 0 } );

		renderWithClient( <ListSites list={ defaultList } /> );

		expect( await screen.findByTestId( 'list-empty' ) ).toBeVisible();
	} );

	test( 'renders sites list with normalized data from feed metadata', async () => {
		nockListItems( {
			items: [
				createListItem( {
					ID: '1',
					meta: {
						links: { feed: 'https://feed-one.com/feed' },
						data: {
							feed: {
								blog_ID: '10',
								feed_ID: '20',
								name: 'Feed One',
								feed_URL: 'https://feed-one.com/feed',
								image: 'https://feed-one.com/icon.jpg',
							},
							site: null,
						},
					},
				} ),
			],
			total_items: 1,
		} );

		renderWithClient( <ListSites list={ defaultList } /> );

		await waitFor( () => {
			expect( ReaderSitesList ).toHaveBeenCalled();
		} );

		const lastCall = jest.mocked( ReaderSitesList ).mock.calls.at( -1 )![ 0 ];
		expect( lastCall.sites ).toEqual( [
			{
				siteId: '10',
				feedId: '20',
				name: 'Feed One',
				feedUrl: 'https://feed-one.com/feed',
				image: 'https://feed-one.com/icon.jpg',
			},
		] );
	} );

	test( 'falls back to site metadata when feed metadata is absent', async () => {
		nockListItems( {
			items: [
				createListItem( {
					ID: '2',
					meta: {
						links: {},
						data: {
							feed: null,
							site: {
								ID: 300,
								name: 'Site Only',
								feed_ID: 50,
								feed_URL: 'https://site-only.com/feed',
								icon: { img: 'https://site-only.com/icon.jpg' },
							},
						},
					},
				} ),
			],
			total_items: 1,
		} );

		renderWithClient( <ListSites list={ defaultList } /> );

		await waitFor( () => {
			expect( ReaderSitesList ).toHaveBeenCalled();
		} );

		const lastCall = jest.mocked( ReaderSitesList ).mock.calls.at( -1 )![ 0 ];
		expect( lastCall.sites ).toEqual( [
			{
				siteId: '300',
				feedId: '50',
				name: 'Site Only',
				feedUrl: 'https://site-only.com/feed',
				image: 'https://site-only.com/icon.jpg',
			},
		] );
	} );
} );

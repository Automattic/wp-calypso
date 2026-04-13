/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import ListsLanding from '../index';

jest.mock(
	'../../components/reader-main',
	() =>
		function ReaderMain( { children }: { children: React.ReactNode } ) {
			return <div>{ children }</div>;
		}
);

jest.mock( 'calypso/components/data/document-head', () => () => null );

jest.mock( 'calypso/state/reader/analytics/actions', () => ( {
	recordReaderTracksEvent: jest.fn( () => ( { type: 'READER_TRACKS_EVENT' } ) ),
} ) );

const popularResponse = {
	lists: [
		{
			ID: 1,
			title: 'Quirky Histories',
			slug: 'quirky-histories',
			description: 'A cabinet of curiosities',
			owner: 'benhuberman',
			subscriber_count: 28,
			item_count: 30,
			tags: [ 'Arts & Entertainment' ],
		},
		{
			ID: 2,
			title: 'Fediverse Food Blogs',
			slug: 'fediverse-food-blogs',
			description: 'Food bloggers on the Fediverse',
			owner: 'jeherve',
			subscriber_count: 15,
			item_count: 10,
			tags: [ 'Food & Drink' ],
		},
	],
};

const listDetailResponse = {
	ID: 1,
	title: 'Quirky Histories',
	slug: 'quirky-histories',
	description: 'A cabinet of curiosities',
	owner: 'benhuberman',
	item_count: 30,
	tags: [ 'Arts & Entertainment' ],
	items: [
		{
			blog_id: 456,
			feed_id: 1234,
			site_name: 'History Blog',
			site_url: 'https://historyblog.com',
			site_icon: 'https://historyblog.com/icon.png',
			fediverse_handle: null,
			fediverse_handle_url: null,
		},
	],
};

function mockFetchResponse( data: unknown ) {
	return Promise.resolve( {
		ok: true,
		status: 200,
		json: () => Promise.resolve( data ),
	} );
}

function renderWithQueryClient( ui: React.ReactElement ) {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false } },
	} );
	return renderWithProvider(
		<QueryClientProvider client={ queryClient }>{ ui }</QueryClientProvider>
	);
}

describe( 'ListsLanding', () => {
	afterEach( () => {
		nock.cleanAll();
		jest.clearAllMocks();
	} );

	test( 'renders heading and subtitle', async () => {
		( global.fetch as jest.Mock ).mockImplementation( ( url: string ) => {
			if ( url.includes( '/popular' ) ) {
				return mockFetchResponse( popularResponse );
			}
			return mockFetchResponse( listDetailResponse );
		} );

		renderWithQueryClient( <ListsLanding /> );

		await waitFor( () => {
			expect( screen.getByRole( 'heading', { name: /discover lists/i } ) ).toBeVisible();
		} );
	} );

	test( 'renders list cards when data loads', async () => {
		( global.fetch as jest.Mock ).mockImplementation( ( url: string ) => {
			if ( url.includes( '/popular' ) ) {
				return mockFetchResponse( popularResponse );
			}
			return mockFetchResponse( listDetailResponse );
		} );

		renderWithQueryClient( <ListsLanding /> );

		await waitFor( () => {
			expect( screen.getByText( 'Quirky Histories' ) ).toBeVisible();
			expect( screen.getByText( 'Fediverse Food Blogs' ) ).toBeVisible();
		} );
	} );

	test( 'shows skeleton state while loading', () => {
		( global.fetch as jest.Mock ).mockImplementation(
			() =>
				new Promise( () => {
					// Never resolves — simulates a slow fetch
				} )
		);

		const { container } = renderWithQueryClient( <ListsLanding /> );

		expect( container.querySelector( '.lists-landing__skeleton-card' ) ).toBeInTheDocument();
	} );

	test( 'shows empty state when no lists returned', async () => {
		( global.fetch as jest.Mock ).mockImplementation( () => mockFetchResponse( { lists: [] } ) );

		renderWithQueryClient( <ListsLanding /> );

		await waitFor( () => {
			expect( screen.getByText( /no lists to show/i ) ).toBeVisible();
		} );
	} );
} );

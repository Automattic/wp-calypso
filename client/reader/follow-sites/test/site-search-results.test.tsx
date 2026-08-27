/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import { useFeedSearchInfiniteQuery, type Feed } from 'calypso/reader/data/feed';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import SiteSearchResults, { dedupeFeeds } from '../site-search-results';

jest.mock( 'calypso/reader/data/feed', () => ( {
	useFeedSearchInfiniteQuery: jest.fn(),
} ) );

jest.mock(
	'calypso/blocks/reader-subscription-list-item/connected',
	() =>
		function ListItem( { feedId, url }: { feedId?: number; url?: string } ) {
			return <div data-testid="site" data-feed-id={ feedId } data-url={ url } />;
		}
);

const mockUseFeedSearchInfiniteQuery = jest.mocked( useFeedSearchInfiniteQuery );

const feed = ( overrides: Partial< Feed > ): Feed => ( {
	feed_ID: 0,
	blog_ID: 0,
	...overrides,
} );

const mockResults = (
	feeds: Feed[],
	extra: Partial< ReturnType< typeof useFeedSearchInfiniteQuery > > = {}
) => {
	mockUseFeedSearchInfiniteQuery.mockReturnValue( {
		data: { pages: [ { feeds } ], pageParams: [ 0 ] },
		fetchNextPage: jest.fn(),
		hasNextPage: false,
		isLoading: false,
		isFetchingNextPage: false,
		...extra,
	} as unknown as ReturnType< typeof useFeedSearchInfiniteQuery > );
};

describe( 'dedupeFeeds', () => {
	it( 'collapses repeated feed IDs and scheme-less duplicate URLs', () => {
		const result = dedupeFeeds( [
			feed( { feed_ID: 1, feed_URL: 'https://a.com/feed' } ),
			feed( { feed_ID: 1, feed_URL: 'https://a.com/feed' } ),
			feed( { feed_URL: 'http://b.com/feed' } ),
			feed( { feed_URL: 'https://b.com/feed' } ),
			feed( { feed_ID: 2, feed_URL: 'https://c.com/feed' } ),
		] );

		expect( result.map( ( f ) => f.feed_URL ) ).toEqual( [
			'https://a.com/feed',
			'http://b.com/feed',
			'https://c.com/feed',
		] );
	} );
} );

describe( 'SiteSearchResults', () => {
	beforeEach( () => jest.clearAllMocks() );

	it( 'renders a row per site and a link to search posts', () => {
		mockResults( [
			feed( { feed_ID: 1, blog_ID: 10, feed_URL: 'https://a.com/feed' } ),
			feed( { feed_ID: 2, blog_ID: 20, feed_URL: 'https://b.com/feed' } ),
		] );

		renderWithProvider( <SiteSearchResults query="birds" /> );

		expect( screen.getAllByTestId( 'site' ) ).toHaveLength( 2 );
		expect( screen.getByRole( 'link', { name: 'Search posts for “birds”' } ) ).toHaveAttribute(
			'href',
			'/reader/search?q=birds'
		);
	} );

	it( 'shows an empty state when nothing matches', () => {
		mockResults( [] );

		renderWithProvider( <SiteSearchResults query="zzz" /> );

		expect( screen.getByText( /Nothing matched “zzz”/ ) ).toBeVisible();
		expect( screen.queryByTestId( 'site' ) ).not.toBeInTheDocument();
	} );

	it( 'offers to load more when another page exists', () => {
		const fetchNextPage = jest.fn();
		mockResults( [ feed( { feed_ID: 1, feed_URL: 'https://a.com/feed' } ) ], {
			hasNextPage: true,
			fetchNextPage,
		} );

		renderWithProvider( <SiteSearchResults query="birds" /> );

		screen.getByRole( 'button', { name: 'Load more sites' } ).click();
		expect( fetchNextPage ).toHaveBeenCalled();
	} );
} );

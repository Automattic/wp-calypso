/**
 * @jest-environment jsdom
 */
import { ReadFeedSearchSort } from '@automattic/api-core';
import { render } from '@testing-library/react';
import { useFeedSearchInfiniteQuery } from 'calypso/reader/data/feed';
import SiteResults from '../site-results';
import SiteResultsContainer from '../site-results-container';

jest.mock( 'react-redux', () => ( {
	useSelector: jest.fn( () => true ),
} ) );
jest.mock( 'calypso/reader/data/feed', () => ( {
	useFeedSearchInfiniteQuery: jest.fn(),
} ) );
jest.mock( '../site-results', () => jest.fn( () => null ) );

const mockUseFeedSearchInfiniteQuery = jest.mocked( useFeedSearchInfiniteQuery );
const mockSiteResults = jest.mocked( SiteResults );

describe( 'SiteResultsContainer', () => {
	it( 'keeps the fetchNextPage prop stable across rerenders', () => {
		const fetchNextPage = jest.fn();
		mockUseFeedSearchInfiniteQuery.mockReturnValue( {
			data: undefined,
			fetchNextPage,
			hasNextPage: false,
			isLoading: true,
		} as unknown as ReturnType< typeof useFeedSearchInfiniteQuery > );
		const onReceiveSearchResults = jest.fn();

		const { rerender } = render(
			<SiteResultsContainer
				query="cats"
				sort={ ReadFeedSearchSort.Relevance }
				onReceiveSearchResults={ onReceiveSearchResults }
			/>
		);
		const firstFetchNextPage = mockSiteResults.mock.calls[ 0 ][ 0 ].fetchNextPage;

		rerender(
			<SiteResultsContainer
				query="cats"
				sort={ ReadFeedSearchSort.Relevance }
				onReceiveSearchResults={ onReceiveSearchResults }
			/>
		);

		expect( mockSiteResults.mock.calls[ 1 ][ 0 ].fetchNextPage ).toBe( firstFetchNextPage );
	} );
} );

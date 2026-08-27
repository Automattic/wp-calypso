/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import { useInfiniteStream } from 'calypso/reader/data/stream';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import PopularSites from '../popular-sites';

jest.mock( 'calypso/reader/data/stream', () => ( { useInfiniteStream: jest.fn() } ) );
jest.mock(
	'calypso/blocks/reader-subscription-list-item/connected',
	() =>
		function ListItem( { feedId, url }: { feedId?: number; url?: string } ) {
			return <div data-testid="site" data-feed-id={ feedId } data-url={ url } />;
		}
);

const mockUseInfiniteStream = jest.mocked( useInfiniteStream );

describe( 'PopularSites', () => {
	it( 'renders a follow row for each recommended site', () => {
		mockUseInfiniteStream.mockReturnValue( {
			isLoading: false,
			items: [
				{ blogId: 1, feed_ID: 11, feed_URL: 'https://a.com/feed', site_name: 'A' },
				{ blogId: 2, feed_ID: 22, url: 'https://b.com', site_name: 'B' },
				{ blogId: 3, feed_ID: 33 },
			],
		} as unknown as ReturnType< typeof useInfiniteStream > );

		renderWithProvider( <PopularSites /> );

		expect( screen.getByRole( 'heading', { name: 'Popular this week' } ) ).toBeVisible();
		const rows = screen.getAllByTestId( 'site' );
		expect( rows ).toHaveLength( 2 );
		expect( rows[ 1 ] ).toHaveAttribute( 'data-url', 'https://b.com' );
	} );

	it( 'renders nothing while loading or when empty', () => {
		mockUseInfiniteStream.mockReturnValue( {
			isLoading: false,
			items: [],
		} as unknown as ReturnType< typeof useInfiniteStream > );

		const { container } = renderWithProvider( <PopularSites /> );

		expect( container ).toBeEmptyDOMElement();
	} );
} );

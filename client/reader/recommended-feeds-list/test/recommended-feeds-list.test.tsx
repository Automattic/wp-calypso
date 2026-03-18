/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { ComponentProps } from 'react';
import { FeedRecommendation } from 'calypso/data/reader/use-feed-recommendations-query';
import { RecommendedFeedsList } from '../index';
import { RecommendedFeedItem } from '../recommended-feed-item';

jest.mock( '../recommended-feed-item', () => ( {
	__esModule: true,
	RecommendedFeedItem: ( props: ComponentProps< typeof RecommendedFeedItem > ) => (
		<li
			data-testid="recommended-feed-item"
			data-variant={ props.variant }
			data-follow-source={ props.followSource }
		>
			{ props.feed.name }
		</li>
	),
} ) );

describe( 'RecommendedFeedsList', () => {
	let idCounter = 0;

	beforeEach( () => {
		idCounter = 0;
	} );

	const createFeed = ( overrides: Partial< FeedRecommendation > = {} ): FeedRecommendation => ( {
		ID: String( ++idCounter ),
		name: `Example Feed - ${ idCounter }`,
		feedUrl: `https://example-${ idCounter }.com/feed`,
		siteId: `site-id-${ idCounter }`,
		feedId: `feed-id-${ idCounter }`,
		image: `https://example.com/icon-${ idCounter }.jpg`,
		...overrides,
	} );

	test( 'applies variant CSS class to the list', () => {
		render( <RecommendedFeedsList feeds={ [] } variant="compact" followSource="test" /> );

		expect( screen.getByRole( 'list' ) ).toHaveClass( 'is-compact-view' );
	} );

	test( 'renders no feed item when feeds array is empty', () => {
		render( <RecommendedFeedsList feeds={ [] } variant="default" followSource="test" /> );

		expect( screen.queryByTestId( 'recommended-feed-item' ) ).not.toBeInTheDocument();
	} );

	test( 'renders one item per feed that has a feedUrl', () => {
		const feeds = [ createFeed(), createFeed( { feedUrl: undefined } ), createFeed() ];

		render( <RecommendedFeedsList feeds={ feeds } variant="default" followSource="my-source" /> );

		const items = screen.getAllByTestId( 'recommended-feed-item' );
		expect( items ).toHaveLength( 2 );
		expect( screen.getByText( 'Example Feed - 1' ) ).toBeVisible();
		expect( screen.queryByText( 'Example Feed - 2' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'Example Feed - 3' ) ).toBeVisible();
		items.forEach( ( item ) => {
			expect( item ).toHaveAttribute( 'data-variant', 'default' );
			expect( item ).toHaveAttribute( 'data-follow-source', 'my-source' );
		} );
	} );
} );

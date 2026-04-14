/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { ComponentProps } from 'react';
import { FeedRecommendation } from 'calypso/data/reader/use-feed-recommendations-query';
import { ReaderSitesList } from '../index';
import { ReaderSiteItem } from '../site-item';

jest.mock( '../site-item', () => ( {
	__esModule: true,
	ReaderSiteItem: ( props: ComponentProps< typeof ReaderSiteItem > ) => (
		<li
			data-testid="reader-site-item"
			data-variant={ props.variant }
			data-follow-source={ props.followSource }
		>
			{ props.site.name }
		</li>
	),
} ) );

describe( 'ReaderSitesList', () => {
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
		render( <ReaderSitesList sites={ [] } variant="compact" followSource="test" /> );

		expect( screen.getByRole( 'list' ) ).toHaveClass( 'is-compact-view' );
	} );

	test( 'renders no feed item when feeds array is empty', () => {
		render( <ReaderSitesList sites={ [] } variant="default" followSource="test" /> );

		expect( screen.queryByTestId( 'reader-site-item' ) ).not.toBeInTheDocument();
	} );

	test( 'renders one item per feed that has a feedUrl', () => {
		const feeds = [ createFeed(), createFeed( { feedUrl: undefined } ), createFeed() ];

		render( <ReaderSitesList sites={ feeds } variant="default" followSource="my-source" /> );

		const items = screen.getAllByTestId( 'reader-site-item' );
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

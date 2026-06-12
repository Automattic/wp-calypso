/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { ComponentProps } from 'react';
import {
	FeedRecommendation,
	useFeedRecommendationsQuery,
} from 'calypso/data/reader/use-feed-recommendations-query';
import { ReaderSitesList } from 'calypso/reader/sites-list';
import RecommendedBlogs from '../index';

jest.mock( 'calypso/data/reader/use-feed-recommendations-query', () => ( {
	useFeedRecommendationsQuery: jest.fn(),
} ) );

const mockUseFeedRecommendationsQuery = jest.mocked( useFeedRecommendationsQuery );

jest.mock( 'calypso/reader/sites-list', () => ( {
	ReaderSitesList: ( {
		sites,
		variant,
		siteIconSize,
		followSource,
	}: ComponentProps< typeof ReaderSitesList > ) => (
		<div
			data-testid="reader-sites-list"
			data-variant={ variant }
			data-site-icon-size={ siteIconSize }
			data-follow-source={ followSource }
		>
			{ sites.map( ( site ) => (
				<p key={ site.feedId }>{ site.name }</p>
			) ) }
		</div>
	),
} ) );

function createBlog( overrides: Partial< FeedRecommendation > = {} ): FeedRecommendation {
	const id = String( Math.random() );
	return {
		ID: id,
		name: `Blog ${ id }`,
		feedUrl: `https://example-${ id }.com/feed`,
		feedId: `feed-${ id }`,
		siteId: `site-${ id }`,
		...overrides,
	};
}

describe( 'RecommendedBlogs', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'renders spinner when loading', () => {
		mockUseFeedRecommendationsQuery.mockReturnValue( {
			isLoading: true,
			data: [],
			isFetched: false,
		} );

		render( <RecommendedBlogs userLogin="testuser" /> );

		expect( document.querySelector( '.wp-spinner-wrapper' ) ).toBeVisible();
		expect( screen.queryByTestId( 'reader-sites-list' ) ).not.toBeInTheDocument();
	} );

	test( 'renders ReaderSitesList when not loading', () => {
		mockUseFeedRecommendationsQuery.mockReturnValue( {
			isLoading: false,
			data: [ createBlog() ],
			isFetched: true,
		} );

		render( <RecommendedBlogs userLogin="testuser" /> );

		expect( screen.getByTestId( 'reader-sites-list' ) ).toBeVisible();
		expect( document.querySelector( '.wp-spinner-wrapper' ) ).not.toBeInTheDocument();
	} );

	test( 'passes compact variant and siteIconSize 30 to ReaderSitesList', () => {
		mockUseFeedRecommendationsQuery.mockReturnValue( {
			isLoading: false,
			data: [ createBlog() ],
			isFetched: true,
		} );

		render( <RecommendedBlogs userLogin="testuser" /> );

		const list = screen.getByTestId( 'reader-sites-list' );
		expect( list ).toHaveAttribute( 'data-variant', 'compact' );
		expect( list ).toHaveAttribute( 'data-site-icon-size', '30' );
		expect( list ).toHaveAttribute(
			'data-follow-source',
			'user-hovercard__recommended-sites-list'
		);
	} );

	test( 'limits displayed blogs to 3', () => {
		const blogs = Array.from( { length: 5 }, () => createBlog() );
		mockUseFeedRecommendationsQuery.mockReturnValue( {
			isLoading: false,
			data: blogs,
			isFetched: true,
		} );

		render( <RecommendedBlogs userLogin="testuser" /> );

		const items = screen.getByTestId( 'reader-sites-list' ).querySelectorAll( 'p' );
		expect( items ).toHaveLength( 3 );
	} );

	test( 'filters out blogs without feedUrl', () => {
		const blogs = [
			createBlog( { feedUrl: undefined } ),
			createBlog( { feedUrl: '' } ),
			createBlog( { name: 'Valid Blog' } ),
		];
		mockUseFeedRecommendationsQuery.mockReturnValue( {
			isLoading: false,
			data: blogs,
			isFetched: true,
		} );

		render( <RecommendedBlogs userLogin="testuser" /> );

		const items = screen.getByTestId( 'reader-sites-list' ).querySelectorAll( 'p' );
		expect( items ).toHaveLength( 1 );
		expect( screen.getByText( 'Valid Blog' ) ).toBeVisible();
	} );
} );

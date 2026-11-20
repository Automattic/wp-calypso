/**
 * @jest-environment jsdom
 */

import { getSiteSubscriptionsQueryKey, readTagsQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { createStore } from 'redux';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { SearchRecommendedBlogs } from '../recommended-blogs';
import type {
	RecommendedBlog,
	RecommendedBlogListKey,
} from 'calypso/reader/onboarding-rsm/recommended-blogs';

const mockLocale = jest.fn( () => 'en' );
const mockLists: Partial< Record< RecommendedBlogListKey, RecommendedBlog[] > > = {};

jest.mock( 'i18n-calypso', () => ( {
	...jest.requireActual( 'i18n-calypso' ),
	getLocaleSlug: () => mockLocale(),
} ) );

jest.mock( 'calypso/reader/onboarding-rsm/recommended-blogs', () => ( {
	...jest.requireActual( 'calypso/reader/onboarding-rsm/recommended-blogs' ),
	getRecommendedBlogs: ( key: RecommendedBlogListKey ) => mockLists[ key ] ?? [],
} ) );

const blog = ( id: number ): RecommendedBlog => ( {
	feed_ID: id,
	site_ID: 0,
	name: `Blog ${ id }`,
	site_URL: `https://blog-${ id }.example/`,
	feed_URL: `https://blog-${ id }.example/feed`,
	icon_URL: `https://blog-${ id }.example/icon.png`,
	description: `About blog ${ id }`,
} );

function renderRecommendations( {
	loggedIn = true,
	tags,
}: { loggedIn?: boolean; tags?: string[] } = {} ) {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	queryClient.setQueryData( getSiteSubscriptionsQueryKey(), {
		pageParams: [ 1 ],
		pages: [ { subscriptions: [], totalCount: 0, page: 1, number: 200 } ],
	} );
	if ( tags ) {
		queryClient.setQueryData( readTagsQuery().queryKey, {
			tags: tags.map( ( slug, index ) => ( { ID: index, slug, title: slug } ) ),
		} );
	}
	const store = createStore( () => ( { currentUser: { id: loggedIn ? 1 : null } } ) );
	return {
		queryClient,
		...renderWithProvider( <SearchRecommendedBlogs />, { queryClient, store } ),
	};
}

beforeEach( () => {
	mockLocale.mockReturnValue( 'en' );
	for ( const key of Object.keys( mockLists ) ) {
		delete mockLists[ key as RecommendedBlogListKey ];
	}
	mockLists.food = [ blog( 1 ) ];
	mockLists.music = [ blog( 2 ) ];
	mockLists[ 'most-subscribed' ] = [ blog( 3 ) ];
} );

afterEach( () => nock.cleanAll() );

describe( 'SearchRecommendedBlogs', () => {
	it( 'shows only supported followed interests in onboarding order', () => {
		renderRecommendations( { tags: [ 'music', 'knitting', 'food' ] } );

		expect( screen.getAllByRole( 'heading' ).map( ( heading ) => heading.textContent ) ).toEqual( [
			'Blogs to follow',
			'Food',
			'Music',
		] );
		expect( screen.getByRole( 'button', { name: 'Blog 1' } ) ).toBeVisible();
		expect( screen.queryByRole( 'heading', { name: 'Most subscribed' } ) ).not.toBeInTheDocument();
	} );

	it.each( [ { tags: [] }, { tags: [ 'knitting' ] } ] )(
		'uses Most subscribed when supported interests are absent: $tags',
		( { tags } ) => {
			renderRecommendations( { tags } );
			expect( screen.getByRole( 'heading', { name: 'Most subscribed' } ) ).toBeVisible();
		}
	);

	it( 'does not flash Most subscribed while followed tags load', async () => {
		const request = nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/read/tags' )
			.query( true )
			.delay( 60 )
			.reply( 200, { tags: [ { ID: 1, slug: 'food', title: 'Food' } ] } );
		renderRecommendations();
		expect( screen.queryByRole( 'heading', { name: 'Blogs to follow' } ) ).not.toBeInTheDocument();
		expect( await screen.findByRole( 'heading', { name: 'Food' } ) ).toBeVisible();
		expect( request.isDone() ).toBe( true );
		expect( screen.queryByRole( 'heading', { name: 'Most subscribed' } ) ).not.toBeInTheDocument();
	} );

	it( 'does not substitute Most subscribed when interests fail to load', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/read/tags' )
			.query( true )
			.reply( 500, { error: 'tags_failed' } );
		const { queryClient } = renderRecommendations();
		await waitFor( () =>
			expect( queryClient.getQueryState( readTagsQuery().queryKey )?.status ).toBe( 'error' )
		);
		expect( screen.queryByRole( 'heading', { name: 'Blogs to follow' } ) ).not.toBeInTheDocument();
	} );

	it( 'renders no section when no approved list applies', () => {
		delete mockLists[ 'most-subscribed' ];
		renderRecommendations( { tags: [] } );
		expect( screen.queryByRole( 'heading', { name: 'Blogs to follow' } ) ).not.toBeInTheDocument();
	} );

	it.each( [ 'fr', 'es' ] )(
		'does not request interests in a non-English locale: %s',
		( locale ) => {
			mockLocale.mockReturnValue( locale );
			const { queryClient } = renderRecommendations();
			expect( queryClient.getQueryState( readTagsQuery().queryKey ) ).toBeUndefined();
			expect(
				screen.queryByRole( 'heading', { name: 'Blogs to follow' } )
			).not.toBeInTheDocument();
		}
	);

	it( 'does not request personal interests when signed out', () => {
		const { queryClient } = renderRecommendations( { loggedIn: false } );
		expect( queryClient.getQueryState( readTagsQuery().queryKey ) ).toBeUndefined();
		expect( screen.queryByRole( 'heading', { name: 'Blogs to follow' } ) ).not.toBeInTheDocument();
	} );
} );

/**
 * @jest-environment jsdom
 */
import { getReadSiteRecommendationsInfiniteQueryKey } from '@automattic/api-queries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { getCachedStreamItems, getStreamInfiniteQueryKey } from 'calypso/reader/data/stream';
import { recordAction, recordTrackForPost } from 'calypso/reader/stats';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import RecommendedPosts from '../recommended-posts';

jest.mock( 'i18n-calypso', () => ( {
	translate: ( text ) => text,
	localize: ( Component ) => ( props ) => <Component { ...props } translate={ ( text ) => text } />,
} ) );

jest.mock( 'calypso/blocks/reader-related-card', () => ( {
	RelatedPostCard: ( { post } ) => <article>{ post?.title ?? 'Loading recommendation' }</article>,
} ) );

jest.mock( 'calypso/reader/stats', () => ( {
	recordAction: jest.fn(),
	recordTrackForPost: jest.fn(),
} ) );

jest.mock( 'calypso/state/notices/actions', () => ( {
	errorNotice: jest.fn( ( text ) => ( { type: 'ERROR_NOTICE', text } ) ),
	successNotice: jest.fn( ( text, options ) => ( { type: 'SUCCESS_NOTICE', text, options } ) ),
} ) );

const BASE = 'https://public-api.wordpress.com';

const makeWrapper = ( queryClient, store = createStore( ( state = {} ) => state ) ) => {
	return ( { children } ) => (
		<QueryClientProvider client={ queryClient }>
			<Provider store={ store }>{ children }</Provider>
		</QueryClientProvider>
	);
};

const streamQueryKey = () =>
	getStreamInfiniteQueryKey( {
		streamKey: 'recommendations_posts',
		feedId: null,
		localeSlug: null,
		startDate: null,
	} );

const recommendedSitesQueryKey = () =>
	getReadSiteRecommendationsInfiniteQueryKey( { seed: 7, number: 2 } );

describe( 'RecommendedPostsWithPosts', () => {
	afterEach( () => {
		nock.cleanAll();
		jest.clearAllMocks();
	} );

	it( 'fetches recommended posts when they are not in the canonical cache yet', async () => {
		nock( BASE ).get( '/rest/v1.1/read/sites/100/posts/1' ).query( true ).reply( 200, {
			ID: 1,
			site_ID: 100,
			global_ID: 'global-1',
			title: 'First recommendation',
			content: '<p>First recommendation body</p>',
		} );
		nock( BASE ).get( '/rest/v1.1/read/sites/100/posts/2' ).query( true ).reply( 200, {
			ID: 2,
			site_ID: 100,
			global_ID: 'global-2',
			title: 'Second recommendation',
			content: '<p>Second recommendation body</p>',
		} );

		render(
			<RecommendedPosts
				index={ 0 }
				recommendations={ [
					{ blogId: 100, postId: 1 },
					{ blogId: 100, postId: 2 },
				] }
			/>,
			{
				wrapper: makeWrapper(
					new QueryClient( { defaultOptions: { queries: { retry: false } } } )
				),
			}
		);

		await waitFor( () => {
			expect( screen.getByText( 'First recommendation' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Second recommendation' ) ).toBeInTheDocument();
		} );
		expect( nock.isDone() ).toBe( true );
	} );

	it( 'keeps recommendation slots stable while individual posts load', async () => {
		nock( BASE ).get( '/rest/v1.1/read/sites/100/posts/1' ).query( true ).delay( 50 ).reply( 200, {
			ID: 1,
			site_ID: 100,
			global_ID: 'global-1',
			title: 'First recommendation',
			content: '<p>First recommendation body</p>',
		} );
		nock( BASE ).get( '/rest/v1.1/read/sites/100/posts/2' ).query( true ).reply( 200, {
			ID: 2,
			site_ID: 100,
			global_ID: 'global-2',
			title: 'Second recommendation',
			content: '<p>Second recommendation body</p>',
		} );

		render(
			<RecommendedPosts
				index={ 0 }
				recommendations={ [
					{ blogId: 100, postId: 1 },
					{ blogId: 100, postId: 2 },
				] }
			/>,
			{
				wrapper: makeWrapper(
					new QueryClient( { defaultOptions: { queries: { retry: false } } } )
				),
			}
		);

		await waitFor( () =>
			expect( screen.getByText( 'Second recommendation' ) ).toBeInTheDocument()
		);
		expect( screen.getAllByRole( 'listitem' ) ).toHaveLength( 2 );
		expect( screen.getByText( 'Loading recommendation' ) ).toBeInTheDocument();
	} );

	it( 'dismisses the recommended post site with the React Query mutation and updates caches', async () => {
		nock( BASE ).get( '/rest/v1.1/read/sites/100/posts/1' ).query( true ).reply( 200, {
			ID: 1,
			site_ID: 100,
			global_ID: 'global-1',
			title: 'First recommendation',
			content: '<p>First recommendation body</p>',
		} );
		nock( BASE ).get( '/rest/v1.1/read/sites/200/posts/2' ).query( true ).reply( 200, {
			ID: 2,
			site_ID: 200,
			global_ID: 'global-2',
			title: 'Second recommendation',
			content: '<p>Second recommendation body</p>',
		} );
		nock( BASE ).post( '/rest/v1.1/me/dismiss/sites/100/new' ).reply( 200, {
			success: true,
		} );

		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		queryClient.setQueryData( streamQueryKey(), {
			pages: [
				{
					posts: [
						{ ID: 1, site_ID: 100, global_ID: 'global-1' },
						{ ID: 2, site_ID: 200, global_ID: 'global-2' },
					],
				},
			],
			pageParams: [ null ],
		} );
		queryClient.setQueryData( recommendedSitesQueryKey(), {
			pages: [
				{
					algorithm: 'algo',
					sites: [
						{ blog_id: 100, feed_id: 1000, ID: 100, name: 'First site', URL: 'https://one.test' },
						{ blog_id: 200, feed_id: 2000, ID: 200, name: 'Second site', URL: 'https://two.test' },
					],
				},
			],
			pageParams: [ 0 ],
		} );
		const store = createStore( ( state = {} ) => state );
		jest.spyOn( store, 'dispatch' );

		render(
			<RecommendedPosts
				index={ 0 }
				streamKey="recommendations_posts"
				recommendations={ [
					{ blogId: 100, postId: 1 },
					{ blogId: 200, postId: 2 },
				] }
			/>,
			{
				wrapper: makeWrapper( queryClient, store ),
			}
		);

		await waitFor( () => expect( screen.getByText( 'First recommendation' ) ).toBeInTheDocument() );
		store.dispatch.mockClear();

		fireEvent.click( screen.getAllByTitle( 'Dismiss this recommendation' )[ 0 ] );

		await waitFor( () => expect( nock.isDone() ).toBe( true ) );
		expect( recordTrackForPost ).toHaveBeenCalledWith(
			'calypso_reader_recommended_post_dismissed',
			expect.objectContaining( { ID: 1, site_ID: 100 } ),
			{
				recommendation_source: 'in-stream',
				ui_position: 0,
			}
		);
		expect( recordAction ).toHaveBeenCalledWith( 'in_stream_rec_dismiss' );
		expect( successNotice ).toHaveBeenCalledWith( "We won't recommend this site to you again.", {
			duration: 5000,
		} );
		expect( store.dispatch ).toHaveBeenCalledWith( {
			type: 'SUCCESS_NOTICE',
			text: "We won't recommend this site to you again.",
			options: { duration: 5000 },
		} );
		expect(
			getCachedStreamItems( queryClient, { streamKey: 'recommendations_posts' } ).map(
				( item ) => item.blogId
			)
		).toEqual( [ 200 ] );
		expect(
			queryClient
				.getQueryData( recommendedSitesQueryKey() )
				.pages.flatMap( ( page ) => page.sites.map( ( site ) => site.blog_id ) )
		).toEqual( [ 200 ] );
	} );

	it( 'dispatches an error notice when dismissing the recommended post site fails', async () => {
		nock( BASE ).get( '/rest/v1.1/read/sites/100/posts/1' ).query( true ).reply( 200, {
			ID: 1,
			site_ID: 100,
			global_ID: 'global-1',
			title: 'First recommendation',
			content: '<p>First recommendation body</p>',
		} );
		nock( BASE ).post( '/rest/v1.1/me/dismiss/sites/100/new' ).reply( 500, {
			error: 'dismiss_failed',
		} );

		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		const store = createStore( ( state = {} ) => state );
		jest.spyOn( store, 'dispatch' );

		render(
			<RecommendedPosts
				index={ 0 }
				streamKey="recommendations_posts"
				recommendations={ [ { blogId: 100, postId: 1 } ] }
			/>,
			{
				wrapper: makeWrapper( queryClient, store ),
			}
		);

		await waitFor( () => expect( screen.getByText( 'First recommendation' ) ).toBeInTheDocument() );
		store.dispatch.mockClear();

		fireEvent.click( screen.getByTitle( 'Dismiss this recommendation' ) );

		await waitFor( () => expect( errorNotice ).toHaveBeenCalled() );
		expect( errorNotice ).toHaveBeenCalledWith(
			'Sorry, there was a problem dismissing that site.'
		);
		expect( store.dispatch ).toHaveBeenCalledWith( {
			type: 'ERROR_NOTICE',
			text: 'Sorry, there was a problem dismissing that site.',
		} );
		expect( nock.isDone() ).toBe( true );
	} );
} );

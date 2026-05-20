/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
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

const BASE = 'https://public-api.wordpress.com';

const makeWrapper = ( queryClient ) => {
	const store = createStore( ( state = {} ) => state );
	return ( { children } ) => (
		<QueryClientProvider client={ queryClient }>
			<Provider store={ store }>{ children }</Provider>
		</QueryClientProvider>
	);
};

describe( 'RecommendedPostsWithPosts', () => {
	afterEach( () => {
		nock.cleanAll();
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
} );

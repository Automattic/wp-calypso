/**
 * @jest-environment jsdom
 */

import { getSiteSubscriptionsQueryKey } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { createStore } from 'redux';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { RecommendedBlogGroups } from '../index';
import type { SiteSubscriptionItem } from '@automattic/api-core';
import type { SiteSubscriptionsInfiniteData } from '@automattic/api-queries';
import type { RecommendedBlog } from 'calypso/reader/onboarding-rsm/recommended-blogs';

jest.mock( 'calypso/reader/onboarding-rsm/recommended-blogs/use-latest-post-date', () => ( {
	useLatestPostDate: () => null,
} ) );

const API = 'https://public-api.wordpress.com';
const blog = ( id: number ): RecommendedBlog => ( {
	feed_ID: id,
	site_ID: 0,
	name: `Blog ${ id }`,
	site_URL: `https://blog-${ id }.example/`,
	feed_URL: `https://blog-${ id }.example/feed`,
	icon_URL: `https://blog-${ id }.example/icon.png`,
	description: `About blog ${ id }`,
} );
const pills = ( id: number ) => screen.getAllByRole( 'button', { name: `Blog ${ id }` } );
const subscription = ( id: number ): SiteSubscriptionItem => ( {
	ID: String( id ),
	URL: blog( id ).site_URL,
	feed_URL: blog( id ).feed_URL,
	feed_ID: id,
	is_following: true,
} );
const followResponse = ( id: number ) => ( {
	subscribed: true,
	subscription: { ...subscription( id ), feed_ID: String( id ), blog_ID: '0' },
} );

function renderGroups( subscriptions: SiteSubscriptionItem[] = [] ) {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	queryClient.setQueryData< SiteSubscriptionsInfiniteData >( getSiteSubscriptionsQueryKey(), {
		pageParams: [ 1 ],
		pages: [ { subscriptions, totalCount: subscriptions.length, page: 1, number: 200 } ],
	} );
	const actions: { type: string; notice?: { status?: string } }[] = [];
	const store = createStore( ( state = { currentUser: { id: null } }, action ) => {
		actions.push( action );
		return state;
	} );
	const groups = [
		{ key: 'food' as const, title: 'Food', blogs: [ blog( 1 ), blog( 2 ) ] },
		{ key: 'music' as const, title: 'Music', blogs: [ blog( 1 ) ] },
	];
	renderWithProvider(
		<RecommendedBlogGroups mode="follow" groups={ groups } followSource="reader-search" />,
		{ queryClient, store }
	);
	return {
		actions,
		subscriptions: () =>
			queryClient
				.getQueryData< SiteSubscriptionsInfiniteData >( getSiteSubscriptionsQueryKey() )
				?.pages.flatMap( ( page ) => page.subscriptions ) ?? [],
	};
}

afterEach( () => nock.cleanAll() );

describe( 'Recommended blog follow actions', () => {
	it( 'locks every duplicate until a single follow settles and shares the followed state', async () => {
		const request = nock( API )
			.post( '/rest/v1.1/read/following/mine/new', {
				url: blog( 1 ).feed_URL,
				source: 'reader-search',
			} )
			.delay( 100 )
			.reply( 200, followResponse( 1 ) );
		renderGroups();
		const user = userEvent.setup();
		await user.click( pills( 1 )[ 0 ] );
		for ( const pill of pills( 1 ) ) {
			expect( pill ).toHaveAttribute( 'aria-busy', 'true' );
			expect( pill ).toHaveAttribute( 'aria-disabled', 'true' );
		}
		await user.click( pills( 1 )[ 1 ] );
		await waitFor( () => expect( pills( 1 )[ 0 ] ).not.toHaveAttribute( 'aria-busy' ) );
		expect( request.isDone() ).toBe( true );
		for ( const pill of pills( 1 ) ) {
			expect( pill ).toHaveAttribute( 'aria-pressed', 'true' );
		}
	} );

	it( 'unfollows an existing subscription and updates every duplicate', async () => {
		const request = nock( API )
			.post( '/rest/v1.1/read/following/mine/delete', {
				url: blog( 1 ).feed_URL,
				source: 'reader-search',
			} )
			.reply( 200, { subscribed: false } );
		renderGroups( [ subscription( 1 ) ] );
		const user = userEvent.setup();
		await user.click( pills( 1 )[ 1 ] );
		await waitFor( () => expect( pills( 1 )[ 0 ] ).not.toHaveAttribute( 'aria-busy' ) );
		expect( request.isDone() ).toBe( true );
		for ( const pill of pills( 1 ) ) {
			expect( pill ).toHaveAttribute( 'aria-pressed', 'false' );
		}
	} );

	it( 'preserves a different successful follow after a delayed failure, then permits retry', async () => {
		const order: number[] = [];
		const failure = nock( API )
			.post( '/rest/v1.1/read/following/mine/new', ( body ) => body.url === blog( 1 ).feed_URL )
			.delay( 100 )
			.reply( () => {
				order.push( 1 );
				return [ 500, { error: 'follow_failed' } ];
			} );
		const success = nock( API )
			.post( '/rest/v1.1/read/following/mine/new', ( body ) => body.url === blog( 2 ).feed_URL )
			.reply( () => {
				order.push( 2 );
				return [ 200, followResponse( 2 ) ];
			} );
		const result = renderGroups();
		const user = userEvent.setup();
		await user.click( pills( 1 )[ 0 ] );
		await user.click( pills( 2 )[ 0 ] );
		await waitFor( () => expect( pills( 2 )[ 0 ] ).not.toHaveAttribute( 'aria-busy' ) );
		expect( failure.isDone() && success.isDone() ).toBe( true );
		expect( order ).toEqual( [ 1, 2 ] );
		expect( result.subscriptions() ).toEqual( [
			expect.objectContaining( { feed_ID: 2, is_following: true } ),
		] );
		expect( pills( 1 )[ 0 ] ).toHaveAttribute( 'aria-pressed', 'false' );
		expect( result.actions ).toContainEqual(
			expect.objectContaining( {
				type: 'NOTICE_CREATE',
				notice: expect.objectContaining( { status: 'is-error' } ),
			} )
		);

		const retry = nock( API )
			.post( '/rest/v1.1/read/following/mine/new' )
			.reply( 200, followResponse( 1 ) );
		await user.click( pills( 1 )[ 0 ] );
		await waitFor( () => expect( pills( 1 )[ 0 ] ).not.toHaveAttribute( 'aria-busy' ) );
		expect( retry.isDone() ).toBe( true );
		expect( result.subscriptions() ).toEqual(
			expect.arrayContaining( [
				expect.objectContaining( { feed_ID: 1, is_following: true } ),
				expect.objectContaining( { feed_ID: 2, is_following: true } ),
			] )
		);
	} );
} );

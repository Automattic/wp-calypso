import { getSiteSubscriptionsQueryKey } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { getCachedIsFollowingPost } from '../cache';
import type { SiteSubscriptionItem } from '@automattic/api-core';

type Page = { subscriptions: Partial< SiteSubscriptionItem >[]; totalCount: number | null };

const makeClientWithPages = ( pages: Page[] ) => {
	const queryClient = new QueryClient();
	queryClient.setQueryData( getSiteSubscriptionsQueryKey(), {
		pages: pages.map( ( page, index ) => ( { ...page, page: index + 1, number: 100 } ) ),
		pageParams: pages.map( ( _, index ) => index + 1 ),
	} );
	return queryClient;
};

// A complete one-page list.
const makeClient = ( subscriptions?: Partial< SiteSubscriptionItem >[] ) =>
	subscriptions
		? makeClientWithPages( [ { subscriptions, totalCount: subscriptions.length } ] )
		: new QueryClient();

describe( 'getCachedIsFollowingPost', () => {
	it( 'returns undefined before the subscriptions load', () => {
		expect( getCachedIsFollowingPost( makeClient(), { site_ID: 1, feed_ID: 10 } ) ).toBeUndefined();
	} );

	it( 'returns undefined without a query client', () => {
		expect( getCachedIsFollowingPost( null, { site_ID: 1, feed_ID: 10 } ) ).toBeUndefined();
	} );

	it( 'returns true when the post’s blog is followed', () => {
		const queryClient = makeClient( [ { blog_ID: 1, feed_ID: 10, is_following: true } ] );

		expect( getCachedIsFollowingPost( queryClient, { site_ID: 1, feed_ID: 99 } ) ).toBe( true );
	} );

	it( 'returns true when an external post’s feed is followed', () => {
		const queryClient = makeClient( [ { blog_ID: 0, feed_ID: 10, is_following: true } ] );

		expect(
			getCachedIsFollowingPost( queryClient, { site_ID: 0, feed_ID: 10, is_external: true } )
		).toBe( true );
	} );

	it( 'returns false when the blog is not followed', () => {
		const queryClient = makeClient( [
			{ blog_ID: 1, feed_ID: 10, is_following: false },
			{ blog_ID: 2, feed_ID: 20, is_following: true },
		] );

		expect( getCachedIsFollowingPost( queryClient, { site_ID: 1, feed_ID: 10 } ) ).toBe( false );
	} );

	it( 'does not match an external post by its blog id', () => {
		const queryClient = makeClient( [ { blog_ID: 5, feed_ID: 20, is_following: true } ] );

		expect(
			getCachedIsFollowingPost( queryClient, { site_ID: 5, feed_ID: 10, is_external: true } )
		).toBe( false );
	} );

	describe( 'with part of the list cached', () => {
		const followed = { blog_ID: 1, feed_ID: 10, is_following: true };

		it( 'returns true for a followed blog that is already cached', () => {
			const queryClient = makeClientWithPages( [
				{ subscriptions: [ followed ], totalCount: 150 },
			] );

			expect( getCachedIsFollowingPost( queryClient, { site_ID: 1 } ) ).toBe( true );
		} );

		it( 'returns undefined for a blog not cached yet', () => {
			const queryClient = makeClientWithPages( [
				{ subscriptions: [ followed ], totalCount: 150 },
			] );

			expect( getCachedIsFollowingPost( queryClient, { site_ID: 2 } ) ).toBeUndefined();
		} );

		it( 'returns false once every page is cached', () => {
			const queryClient = makeClientWithPages( [
				{ subscriptions: [ followed ], totalCount: 150 },
				{ subscriptions: [], totalCount: 150 },
			] );

			expect( getCachedIsFollowingPost( queryClient, { site_ID: 2 } ) ).toBe( false );
		} );

		it( 'returns undefined past the 2,000-row cap', () => {
			const pages = Array.from( { length: 20 }, () => ( {
				subscriptions: [ followed ],
				totalCount: 2500,
			} ) );

			expect( getCachedIsFollowingPost( makeClientWithPages( pages ), { site_ID: 2 } ) ).toBe(
				undefined
			);
		} );

		it( 'without a total, returns false only after an empty last page', () => {
			const partial = makeClientWithPages( [ { subscriptions: [ followed ], totalCount: null } ] );
			const complete = makeClientWithPages( [
				{ subscriptions: [ followed ], totalCount: null },
				{ subscriptions: [], totalCount: null },
			] );

			expect( getCachedIsFollowingPost( partial, { site_ID: 2 } ) ).toBeUndefined();
			expect( getCachedIsFollowingPost( complete, { site_ID: 2 } ) ).toBe( false );
		} );
	} );

	it( 'returns undefined when the post has no blog or feed id', () => {
		const queryClient = makeClient( [ { blog_ID: 1, feed_ID: 10, is_following: true } ] );

		expect( getCachedIsFollowingPost( queryClient, { site_ID: 0, feed_ID: 0 } ) ).toBeUndefined();
	} );
} );

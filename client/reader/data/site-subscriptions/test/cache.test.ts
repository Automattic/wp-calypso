import { getSiteSubscriptionsQueryKey } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { getCachedIsFollowingPost } from '../cache';
import type { SiteSubscriptionItem } from '@automattic/api-core';

const makeClient = ( subscriptions?: Partial< SiteSubscriptionItem >[] ) => {
	const queryClient = new QueryClient();
	if ( subscriptions ) {
		queryClient.setQueryData( getSiteSubscriptionsQueryKey(), {
			pages: [ { subscriptions, totalCount: subscriptions.length, page: 1, number: 200 } ],
			pageParams: [ 1 ],
		} );
	}
	return queryClient;
};

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

	it( 'returns undefined when the post has no blog or feed id', () => {
		const queryClient = makeClient( [ { blog_ID: 1, feed_ID: 10, is_following: true } ] );

		expect( getCachedIsFollowingPost( queryClient, { site_ID: 0, feed_ID: 0 } ) ).toBeUndefined();
	} );
} );

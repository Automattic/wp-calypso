import nock from 'nock';
import {
	followSite,
	flushOnboardingWelcomeDigest,
	unfollowSite,
	updateSiteCommentEmailSubscription,
	updateSitePostEmailDeliveryFrequency,
	updateSitePostEmailSubscription,
	updateSitePostNotificationSubscription,
} from '../mutators';

const BASE = 'https://public-api.wordpress.com';

describe( 'read follows mutators', () => {
	afterEach( () => nock.cleanAll() );

	describe( 'followSite', () => {
		it( 'follows a URL with the legacy endpoint', async () => {
			const scope = nock( BASE )
				.post( '/rest/v1.1/read/following/mine/new', {
					source: 'calypso',
					url: 'https://example.com/feed/',
					email_id: 'email-123',
					blog_id: '456',
				} )
				.reply( 200, {
					subscribed: true,
					subscription: {
						ID: '123',
						URL: 'https://example.com/feed/',
					},
				} );

			const follow = await followSite( {
				feedUrl: 'https://example.com/feed/',
				source: 'calypso',
				emailId: 'email-123',
				blogId: '456',
			} );

			expect( scope.isDone() ).toBe( true );
			expect( follow.ID ).toBe( 123 );
		} );

		it( 'follows a subscription ID before falling back to URL', async () => {
			const scope = nock( BASE )
				.post( '/rest/v1.1/read/following/mine/new', {
					source: 'calypso',
					sub_id: '123',
				} )
				.reply( 200, {
					subscribed: true,
					subscription: {
						ID: '123',
						URL: 'https://example.com/feed/',
					},
				} );

			await followSite( {
				feedUrl: 'https://example.com/feed/',
				source: 'calypso',
				subscriptionId: '123',
			} );

			expect( scope.isDone() ).toBe( true );
		} );

		it( 'follows a URL when the numeric subscription ID is zero', async () => {
			const scope = nock( BASE )
				.post( '/rest/v1.1/read/following/mine/new', {
					source: 'calypso',
					url: 'https://example.com/feed/',
				} )
				.reply( 200, {
					subscribed: true,
					subscription: {
						ID: '123',
						URL: 'https://example.com/feed/',
					},
				} );

			await followSite( {
				feedUrl: 'https://example.com/feed/',
				source: 'calypso',
				subscriptionId: 0,
			} );

			expect( scope.isDone() ).toBe( true );
		} );

		it( 'follows a URL when the string subscription ID is zero', async () => {
			const scope = nock( BASE )
				.post( '/rest/v1.1/read/following/mine/new', {
					source: 'calypso',
					url: 'https://example.com/feed/',
				} )
				.reply( 200, {
					subscribed: true,
					subscription: {
						ID: '123',
						URL: 'https://example.com/feed/',
					},
				} );

			await followSite( {
				feedUrl: 'https://example.com/feed/',
				source: 'calypso',
				subscriptionId: '0',
			} );

			expect( scope.isDone() ).toBe( true );
		} );

		it( 'throws before requesting when no subscription ID or URL is provided', async () => {
			await expect( followSite( {} ) ).rejects.toThrow(
				'Subscription ID or URL is required to follow'
			);
		} );

		it( 'throws when the response does not confirm the follow', async () => {
			const scope = nock( BASE )
				.post( '/rest/v1.1/read/following/mine/new', {
					source: 'calypso',
					url: 'https://example.com/feed/',
				} )
				.reply( 200, {
					subscribed: false,
					info: { reason: 'already-deleted' },
				} );

			await expect(
				followSite( { feedUrl: 'https://example.com/feed/', source: 'calypso' } )
			).rejects.toMatchObject( {
				message: 'Follow request failed',
				info: { reason: 'already-deleted' },
			} );
			expect( scope.isDone() ).toBe( true );
		} );
	} );

	describe( 'unfollowSite', () => {
		it( 'unfollows a URL with the legacy endpoint', async () => {
			const scope = nock( BASE )
				.post( '/rest/v1.1/read/following/mine/delete', {
					source: 'calypso',
					url: 'https://example.com/feed/',
				} )
				.reply( 200, { subscribed: false } );

			const response = await unfollowSite( {
				feedUrl: 'https://example.com/feed/',
				source: 'calypso',
			} );

			expect( scope.isDone() ).toBe( true );
			expect( response.subscribed ).toBe( false );
		} );

		it( 'unfollows a subscription ID before falling back to URL', async () => {
			const scope = nock( BASE )
				.post( '/rest/v1.1/read/following/mine/delete', {
					source: 'calypso',
					sub_id: 123,
				} )
				.reply( 200, { subscribed: false } );

			await unfollowSite( {
				feedUrl: 'https://example.com/feed/',
				source: 'calypso',
				subscriptionId: 123,
			} );

			expect( scope.isDone() ).toBe( true );
		} );

		it( 'throws before requesting when no subscription ID or URL is provided', async () => {
			await expect( unfollowSite( { subscriptionId: 'invalid' } ) ).rejects.toThrow(
				'Subscription ID or URL is required to unfollow'
			);
		} );

		it( 'throws before requesting when the subscription ID is zero and no URL is provided', async () => {
			await expect( unfollowSite( { subscriptionId: 0 } ) ).rejects.toThrow(
				'Subscription ID or URL is required to unfollow'
			);
			expect( nock.pendingMocks() ).toEqual( [] );
		} );

		it( 'throws when the response is still subscribed', async () => {
			const scope = nock( BASE )
				.post( '/rest/v1.1/read/following/mine/delete', {
					source: 'calypso',
					url: 'https://example.com/feed/',
				} )
				.reply( 200, { subscribed: true } );

			await expect(
				unfollowSite( { feedUrl: 'https://example.com/feed/', source: 'calypso' } )
			).rejects.toThrow( 'Unfollow request did not unsubscribe' );
			expect( scope.isDone() ).toBe( true );
		} );

		it( 'throws when the response is missing subscribed status', async () => {
			const scope = nock( BASE )
				.post( '/rest/v1.1/read/following/mine/delete', {
					source: 'calypso',
					url: 'https://example.com/feed/',
				} )
				.reply( 200, {} );

			await expect(
				unfollowSite( { feedUrl: 'https://example.com/feed/', source: 'calypso' } )
			).rejects.toThrow( 'Unfollow request did not unsubscribe' );
			expect( scope.isDone() ).toBe( true );
		} );
	} );

	describe( 'delivery mutators', () => {
		it( 'updates post email subscriptions with REST v1.2', async () => {
			const scope = nock( BASE )
				.post( '/rest/v1.2/read/site/123/post_email_subscriptions/new', {
					delivery_frequency: 'daily',
				} )
				.reply( 200, { subscribed: true } );

			await updateSitePostEmailSubscription( {
				blogId: 123,
				sendPosts: true,
				deliveryFrequency: 'daily',
			} );

			expect( scope.isDone() ).toBe( true );
		} );

		it( 'throws when post email subscription response does not confirm the requested state', async () => {
			nock( BASE )
				.post( '/rest/v1.2/read/site/123/post_email_subscriptions/new', {
					delivery_frequency: 'daily',
				} )
				.reply( 200, { subscribed: false } );

			await expect(
				updateSitePostEmailSubscription( {
					blogId: 123,
					sendPosts: true,
					deliveryFrequency: 'daily',
				} )
			).rejects.toThrow( 'Post email subscription request failed' );
		} );

		it( 'rejects post email subscription updates without a post delivery flag', async () => {
			await expect( updateSitePostEmailSubscription( { blogId: 123 } ) ).rejects.toThrow(
				'sendPosts must be a boolean'
			);
			expect( nock.pendingMocks() ).toEqual( [] );
		} );

		it( 'updates comment email subscriptions with REST v1.2', async () => {
			const scope = nock( BASE )
				.post( '/rest/v1.2/read/site/123/comment_email_subscriptions/delete', {} )
				.reply( 200, { subscribed: false } );

			await updateSiteCommentEmailSubscription( { blogId: 123, sendComments: false } );

			expect( scope.isDone() ).toBe( true );
		} );

		it( 'throws when comment email subscription response does not confirm the requested state', async () => {
			nock( BASE )
				.post( '/rest/v1.2/read/site/123/comment_email_subscriptions/delete', {} )
				.reply( 200, { subscribed: true } );

			await expect(
				updateSiteCommentEmailSubscription( { blogId: 123, sendComments: false } )
			).rejects.toThrow( 'Comment email subscription request failed' );
		} );

		it( 'rejects comment email subscription updates without a comment delivery flag', async () => {
			await expect( updateSiteCommentEmailSubscription( { blogId: 123 } ) ).rejects.toThrow(
				'sendComments must be a boolean'
			);
			expect( nock.pendingMocks() ).toEqual( [] );
		} );

		it( 'updates post email delivery frequency with REST v1.2', async () => {
			const scope = nock( BASE )
				.post( '/rest/v1.2/read/site/123/post_email_subscriptions/update', {
					delivery_frequency: 'weekly',
				} )
				.reply( 200, { success: true } );

			await updateSitePostEmailDeliveryFrequency( {
				blogId: 123,
				deliveryFrequency: 'weekly',
			} );

			expect( scope.isDone() ).toBe( true );
		} );

		it( 'throws when post email delivery frequency response does not confirm success', async () => {
			nock( BASE )
				.post( '/rest/v1.2/read/site/123/post_email_subscriptions/update', {
					delivery_frequency: 'weekly',
				} )
				.reply( 200, { success: false } );

			await expect(
				updateSitePostEmailDeliveryFrequency( {
					blogId: 123,
					deliveryFrequency: 'weekly',
				} )
			).rejects.toThrow( 'Post email delivery frequency request failed' );
		} );

		it( 'rejects post email delivery frequency updates without a valid frequency', async () => {
			await expect( updateSitePostEmailDeliveryFrequency( { blogId: 123 } ) ).rejects.toThrow(
				'deliveryFrequency must be one of instantly, daily, or weekly'
			);
			expect( nock.pendingMocks() ).toEqual( [] );
		} );

		it( 'updates post notification subscriptions with the wpcom v2 namespace', async () => {
			const scope = nock( BASE )
				.post( '/wpcom/v2/read/sites/123/notification-subscriptions/new', {} )
				.reply( 200, { subscribed: true } );

			await updateSitePostNotificationSubscription( { blogId: 123, sendPosts: true } );

			expect( scope.isDone() ).toBe( true );
		} );

		it( 'throws when post notification subscription response does not confirm the requested state', async () => {
			nock( BASE )
				.post( '/wpcom/v2/read/sites/123/notification-subscriptions/new', {} )
				.reply( 200, { subscribed: false } );

			await expect(
				updateSitePostNotificationSubscription( { blogId: 123, sendPosts: true } )
			).rejects.toThrow( 'Post notification subscription request failed' );
		} );

		it( 'rejects post notification subscription updates without a post delivery flag', async () => {
			await expect( updateSitePostNotificationSubscription( { blogId: 123 } ) ).rejects.toThrow(
				'sendPosts must be a boolean'
			);
			expect( nock.pendingMocks() ).toEqual( [] );
		} );
	} );

	describe( 'flushOnboardingWelcomeDigest', () => {
		it( 'flushes the onboarding welcome digest with REST v1.2', async () => {
			const scope = nock( BASE )
				.post( '/rest/v1.2/read/onboarding/welcome-digest/flush', {} )
				.reply( 200, {
					success: true,
					sent: true,
					blog_count: 3,
					in_progress: false,
				} );

			const response = await flushOnboardingWelcomeDigest();

			expect( scope.isDone() ).toBe( true );
			expect( response ).toEqual( {
				success: true,
				sent: true,
				blog_count: 3,
				in_progress: false,
			} );
		} );

		it( 'accepts a delegated flush when another request is already in progress', async () => {
			const scope = nock( BASE )
				.post( '/rest/v1.2/read/onboarding/welcome-digest/flush', {} )
				.reply( 200, {
					success: true,
					sent: false,
					blog_count: 0,
					in_progress: true,
				} );

			const response = await flushOnboardingWelcomeDigest();

			expect( scope.isDone() ).toBe( true );
			expect( response ).toEqual( {
				success: true,
				sent: false,
				blog_count: 0,
				in_progress: true,
			} );
		} );

		it( 'throws when the response does not confirm success', async () => {
			nock( BASE ).post( '/rest/v1.2/read/onboarding/welcome-digest/flush', {} ).reply( 200, {
				success: false,
				sent: false,
				blog_count: 0,
			} );

			await expect( flushOnboardingWelcomeDigest() ).rejects.toThrow(
				'Onboarding welcome digest flush failed'
			);
		} );
	} );
} );

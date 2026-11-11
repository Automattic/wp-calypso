import {
	getReadShelfSourceKey,
	getSiteSubscriptionSourceKey,
	normalizeReadShelfSourceUrl,
} from '../source-keys';

describe( 'read shelf source keys', () => {
	it( 'normalizes source URLs consistently', () => {
		expect( normalizeReadShelfSourceUrl( ' HTTPS://Example.com/feed/// ' ) ).toBe(
			'https://example.com/feed'
		);
	} );

	it( 'keys read shelf sources by feed, blog, then normalized URL', () => {
		expect(
			getReadShelfSourceKey( { feedId: 123, blogId: 456, feedUrl: 'https://example.com' } )
		).toBe( 'feed:123' );
		expect(
			getReadShelfSourceKey( { feedId: null, blogId: 456, feedUrl: 'https://example.com' } )
		).toBe( 'blog:456' );
		expect(
			getReadShelfSourceKey( {
				feedId: null,
				blogId: null,
				feedUrl: ' HTTPS://Example.com/feed/ ',
			} )
		).toBe( 'url:https://example.com/feed' );
	} );

	it( 'keys numeric-string and number IDs identically', () => {
		expect( getReadShelfSourceKey( { feedId: '456', blogId: null, feedUrl: '' } ) ).toBe(
			getSiteSubscriptionSourceKey( { feed_ID: 456, blog_ID: null, feed_URL: '' } )
		);
		expect( getReadShelfSourceKey( { feedId: null, blogId: '789', feedUrl: '' } ) ).toBe(
			getSiteSubscriptionSourceKey( { feed_ID: null, blog_ID: 789, feed_URL: '' } )
		);
	} );

	it( 'treats falsy or non-numeric IDs as absent and falls through to the URL', () => {
		expect(
			getReadShelfSourceKey( { feedId: 0, blogId: '', feedUrl: 'https://example.com/feed' } )
		).toBe( 'url:https://example.com/feed' );
		expect(
			getSiteSubscriptionSourceKey( {
				feed_ID: 0,
				blog_ID: '',
				feed_URL: 'https://example.com/feed',
			} )
		).toBe( 'url:https://example.com/feed' );
	} );

	it( 'keys site subscriptions with the same precedence as read shelf sources', () => {
		expect(
			getSiteSubscriptionSourceKey( {
				feed_ID: 123,
				blog_ID: 456,
				feed_URL: 'https://example.com',
			} )
		).toBe( 'feed:123' );
		expect(
			getSiteSubscriptionSourceKey( {
				feed_ID: null,
				blog_ID: 456,
				feed_URL: 'https://example.com',
			} )
		).toBe( 'blog:456' );
		expect(
			getSiteSubscriptionSourceKey( {
				feed_ID: null,
				blog_ID: null,
				feed_URL: ' HTTPS://Example.com/feed/ ',
			} )
		).toBe( 'url:https://example.com/feed' );
	} );
} );

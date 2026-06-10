import {
	getReadSpaceSourceKey,
	getSiteSubscriptionSourceKey,
	normalizeReadSpaceSourceUrl,
} from '../source-keys';

describe( 'read space source keys', () => {
	it( 'normalizes source URLs consistently', () => {
		expect( normalizeReadSpaceSourceUrl( ' HTTPS://Example.com/feed/// ' ) ).toBe(
			'https://example.com/feed'
		);
	} );

	it( 'keys read space sources by feed, blog, then normalized URL', () => {
		expect(
			getReadSpaceSourceKey( { feedId: 123, blogId: 456, feedUrl: 'https://example.com' } )
		).toBe( 'feed:123' );
		expect(
			getReadSpaceSourceKey( { feedId: null, blogId: 456, feedUrl: 'https://example.com' } )
		).toBe( 'blog:456' );
		expect(
			getReadSpaceSourceKey( {
				feedId: null,
				blogId: null,
				feedUrl: ' HTTPS://Example.com/feed/ ',
			} )
		).toBe( 'url:https://example.com/feed' );
	} );

	it( 'keys site subscriptions with the same precedence as read space sources', () => {
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

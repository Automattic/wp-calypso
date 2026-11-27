import { keepRedirectInBrowser } from '../keep-redirect-in-browser';

describe( 'keepRedirectInBrowser', () => {
	test.each( [
		[
			'https://example.wordpress.com/2024/05/01/my-post/',
			'https://example.wordpress.com/2024/05/01/my-post/?open_in_browser=1',
		],
		[
			'https://example.wordpress.com/1999/12/31/my-post/',
			'https://example.wordpress.com/1999/12/31/my-post/?open_in_browser=1',
		],
		[
			'https://example.wordpress.com/2024/05/01/my-post/?replytocom=5#comment-55',
			'https://example.wordpress.com/2024/05/01/my-post/?replytocom=5&open_in_browser=1#comment-55',
		],
		[
			'http://example.wordpress.com/2024/05/01/my-post/',
			'http://example.wordpress.com/2024/05/01/my-post/?open_in_browser=1',
		],
		[
			'https://example.wordpress.com/tag/news/',
			'https://example.wordpress.com/tag/news/?open_in_browser=1',
		],
	] )( 'marks %s', ( url, expected ) => {
		expect( keepRedirectInBrowser( url ) ).toBe( expected );
	} );

	test.each( [
		[ 'a relative path', '/home' ],
		[ 'a WordPress.com path', 'https://wordpress.com/2024/05/01/my-post/' ],
		[ 'a mapped domain', 'https://example.com/2024/05/01/my-post/' ],
		[ 'a subdomain path the app does not claim', 'https://example.wordpress.com/wp-admin/' ],
		[ 'a category archive', 'https://example.wordpress.com/category/news/' ],
	] )( 'leaves %s unchanged', ( _, url ) => {
		expect( keepRedirectInBrowser( url ) ).toBe( url );
	} );
} );

import { getSiteUrlToAnalyze } from '../get-site-url-to-analyze';

describe( 'getSiteUrlToAnalyze', () => {
	it.each( [
		[ 'https://publication.substack.com/p/my-post', 'https://publication.substack.com' ],
		[ 'https://arun136657.substack.com/publish/post/155313808', 'https://arun136657.substack.com' ],
		[
			'https://publication.substack.com/p/my-post?utm_source=email#comments',
			'https://publication.substack.com',
		],
		[
			'https://publication.substack.com/publish/post/155313808?edit=true#section',
			'https://publication.substack.com',
		],
		[ 'http://publication.substack.com/p/my-post/', 'http://publication.substack.com' ],
		[ 'publication.substack.com/p/my-post', 'https://publication.substack.com' ],
		[ 'publication.substack.com/publish/post/155313808', 'https://publication.substack.com' ],
		[ 'HTTPS://My-Publication.SUBSTACK.COM/p/my-post', 'https://my-publication.substack.com' ],
	] )( 'analyzes %s using %s', ( url, expected ) => {
		expect( getSiteUrlToAnalyze( url ) ).toBe( expected );
	} );

	it.each( [
		'',
		'https://publication.substack.com',
		'https://publication.substack.com/',
		'publication.substack.com',
		'https://publication.substack.com/?utm_source=email#top',
		'https://publication.substack.com/about',
		'https://publication.substack.com/p/',
		'https://publication.substack.com/publish/post/',
		'https://example.com/blog/?tag=test#intro',
		'example.com/blog/',
		'https://newsletter.example.com/p/my-post',
		'https://substack.com/@publication/p/my-post',
		'https://www.substack.com/p/my-post',
		'https://open.substack.com/pub/publication/p/my-post?utm_source=share',
		'https://open.substack.com/p/my-post',
		'https://nested.publication.substack.com/p/my-post',
		'https://publication.substack.com.example.com/p/my-post',
		'https://not-substack.com/p/my-post',
		'https://example.com/p/my-post?from=https://publication.substack.com/p/other-post',
		'https://user@publication.substack.com/p/my-post',
		'//publication.substack.com/p/my-post',
		'ftp://publication.substack.com/p/my-post',
		'https://publication.substack.com:99999/p/my-post',
		'not a URL',
	] )( 'leaves %j unchanged', ( url ) => {
		expect( getSiteUrlToAnalyze( url ) ).toBe( url );
	} );
} );

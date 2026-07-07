import { getReaderSidebarSiteName } from '../index';

// Untitled sites come back from the API URL-shaped with a trailing slash,
// e.g. "example.wordpress.com/".
describe( 'getReaderSidebarSiteName', () => {
	test( 'shows the mapped custom domain when the name is the free subdomain (with trailing slash)', () => {
		expect(
			getReaderSidebarSiteName( {
				name: 'exampleblog.wordpress.com/',
				URL: 'https://example.com',
			} )
		).toBe( 'example.com' );
	} );

	test( 'handles a name with protocol and trailing slash', () => {
		expect(
			getReaderSidebarSiteName( {
				name: 'https://exampleblog.wordpress.com/',
				URL: 'https://example.org',
			} )
		).toBe( 'example.org' );
	} );

	test( 'shows the mapped custom domain when the site has no name at all', () => {
		expect( getReaderSidebarSiteName( { name: '', URL: 'https://example.net' } ) ).toBe(
			'example.net'
		);
	} );

	test( 'keeps a real site title untouched', () => {
		expect(
			getReaderSidebarSiteName( { name: 'Example Site Title', URL: 'https://example.com' } )
		).toBe( 'Example Site Title' );
	} );

	test( 'shows the clean subdomain (no trailing slash) when the site has no custom domain', () => {
		expect(
			getReaderSidebarSiteName( {
				name: 'exampleblog.wordpress.com/',
				URL: 'https://exampleblog.wordpress.com',
			} )
		).toBe( 'exampleblog.wordpress.com' );
	} );

	test( 'falls back to the raw name when there is no URL to derive a domain from', () => {
		expect( getReaderSidebarSiteName( { name: 'Example Site Title', URL: '' } ) ).toBe(
			'Example Site Title'
		);
	} );

	test( 'derives an r/subreddit label from the URL for an unresolved subreddit', () => {
		expect(
			getReaderSidebarSiteName( {
				name: '',
				URL: 'https://www.reddit.com/r/simracing/.rss',
			} )
		).toBe( 'r/simracing' );
	} );

	test( 'derives a u/user label from a Reddit user URL', () => {
		expect(
			getReaderSidebarSiteName( {
				name: '',
				URL: 'https://www.reddit.com/user/spez/.rss',
			} )
		).toBe( 'u/spez' );
	} );

	test( 'prefers the r/subreddit handle over the generic reddit.com domain when the title is missing', () => {
		expect(
			getReaderSidebarSiteName( {
				name: '',
				URL: 'https://www.reddit.com/r/simracing/',
			} )
		).toBe( 'r/simracing' );
	} );

	test( 'keeps the resolved title for a subreddit once it has one', () => {
		expect(
			getReaderSidebarSiteName( {
				name: 'SimRacing',
				URL: 'https://www.reddit.com/r/simracing/',
			} )
		).toBe( 'SimRacing' );
	} );

	test( 'does not treat a reddit.com look-alike host as Reddit', () => {
		expect(
			getReaderSidebarSiteName( {
				name: '',
				URL: 'https://fakereddit.com/r/simracing/',
			} )
		).toBe( 'fakereddit.com' );
	} );
} );

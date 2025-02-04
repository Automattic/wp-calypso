import { shouldReportOmitBlogId, hashPii } from '../utils';

describe( 'hashPii', () => {
	test( 'should return a valid sha256 string', () => {
		expect( hashPii( '1234' ) ).toEqual(
			// $ echo -n "1234" | sha256sum
			'03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'
		);
		expect( hashPii( 'arbitrary-value' ) ).toEqual(
			// $ echo -n "arbitrary-value" | sha256sum
			'3a47516f249c9b46170c634638b6cf625121ae39c3cb104716c40f87945f72b0'
		);
	} );
} );

describe( '#shouldReportOmitBlogId', () => {
	test( 'should allow blog_id reporting for correctly reported site-specific paths', () => {
		expect( shouldReportOmitBlogId( '/stats/day/:site' ) ).toBe( false );
		expect( shouldReportOmitBlogId( '/pages/:site' ) ).toBe( false );
		expect( shouldReportOmitBlogId( '/posts/:site' ) ).toBe( false );
		expect( shouldReportOmitBlogId( '/media/:site' ) ).toBe( false );
		expect( shouldReportOmitBlogId( '/comments/all/:site' ) ).toBe( false );
		expect( shouldReportOmitBlogId( '/plugins/:site' ) ).toBe( false );
		expect( shouldReportOmitBlogId( '/domains/manage/:site' ) ).toBe( false );
		expect( shouldReportOmitBlogId( '/settings/general/:site' ) ).toBe( false );
	} );
	test( 'should not allow blog_id reporting for general administration paths', () => {
		expect( shouldReportOmitBlogId( '/' ) ).toBe( true );
		expect( shouldReportOmitBlogId( '/me' ) ).toBe( true );
		expect( shouldReportOmitBlogId( '/help' ) ).toBe( true );
		expect( shouldReportOmitBlogId( '/reader' ) ).toBe( true );
		expect( shouldReportOmitBlogId( '/following' ) ).toBe( true );
		expect( shouldReportOmitBlogId( '/discover' ) ).toBe( true );
		expect( shouldReportOmitBlogId( '/activities' ) ).toBe( true );
		expect( shouldReportOmitBlogId( '/tag' ) ).toBe( true );
	} );
	test( 'always returns false when :site is in the path', () => {
		expect( shouldReportOmitBlogId( '/me/quickstart/:site/book' ) ).toBe( false );
		expect( shouldReportOmitBlogId( '/following/:site' ) ).toBe( false );
	} );
	test( 'always returns false when :site_id is in the path', () => {
		expect( shouldReportOmitBlogId( '/settings/security/:site_id' ) ).toBe( false );
		expect( shouldReportOmitBlogId( '/sites/:site_id/external-media-upload' ) ).toBe( false );
	} );
	test( 'always returns false when :siteSlug is in the path', () => {
		expect( shouldReportOmitBlogId( '/me/quickstart/:siteSlug/:appointmentId/cancel' ) ).toBe(
			false
		);
		expect( shouldReportOmitBlogId( '/me/quickstart/:siteslug' ) ).toBe( false );
	} );
	test( 'always returns false when :siteId is in the path', () => {
		expect( shouldReportOmitBlogId( '/jetpack/sso/:siteId?/:ssoNonce' ) ).toBe( false );
		expect( shouldReportOmitBlogId( '/jetpack/sso/:siteId' ) ).toBe( false );
		expect( shouldReportOmitBlogId( '/jetpack/sso/:siteid' ) ).toBe( false );
	} );
	test( 'always returns false when :blog_id is in the path', () => {
		expect( shouldReportOmitBlogId( '/reader/blogs/:blog_id' ) ).toBe( false );
		expect( shouldReportOmitBlogId( '/reader/blogs/:blog_id/posts' ) ).toBe( false );
	} );
	test( 'always returns false when :blogId is in the path', () => {
		expect( shouldReportOmitBlogId( '/reader/blogs/:blogId' ) ).toBe( false );
		expect( shouldReportOmitBlogId( '/reader/blogs/:blogid/posts' ) ).toBe( false );
		expect( shouldReportOmitBlogId( '/reader/blogs/:blogId/posts' ) ).toBe( false );
	} );
} );

/** @format */
/**
 * Internal dependencies
 */
import { shouldReportOmitBlogId } from '../utils';

describe( '#shouldReportOmitBlogId', () => {
	test( 'should allow blog_id reporting for site-specific paths', () => {
		expect( shouldReportOmitBlogId( '/stats/day/example.wordpress.com' ) ).toBe( false );
		expect( shouldReportOmitBlogId( '/pages/example.wordpress.com' ) ).toBe( false );
		expect( shouldReportOmitBlogId( '/posts/example.wordpress.com' ) ).toBe( false );
		expect( shouldReportOmitBlogId( '/media/example.wordpress.com' ) ).toBe( false );
		expect( shouldReportOmitBlogId( '/comments/all/example.wordpress.com' ) ).toBe( false );
		expect( shouldReportOmitBlogId( '/plugins/example.wordpress.com' ) ).toBe( false );
		expect( shouldReportOmitBlogId( '/domains/manage/example.wordpress.com' ) ).toBe( false );
		expect( shouldReportOmitBlogId( '/settings/general/example.wordpress.com' ) ).toBe( false );
	} );
	test( 'should not allow blog_id reporting for general administration paths', () => {
		expect( shouldReportOmitBlogId( '/' ) ).toBe( true );
		expect( shouldReportOmitBlogId( '/me' ) ).toBe( true );
		expect( shouldReportOmitBlogId( '/help' ) ).toBe( true );
		expect( shouldReportOmitBlogId( '/read' ) ).toBe( true );
		expect( shouldReportOmitBlogId( '/following' ) ).toBe( true );
		expect( shouldReportOmitBlogId( '/discover' ) ).toBe( true );
		expect( shouldReportOmitBlogId( '/activities' ) ).toBe( true );
		expect( shouldReportOmitBlogId( '/tag' ) ).toBe( true );
	} );
} );

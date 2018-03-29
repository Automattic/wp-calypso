/** @format */
/**
 * External dependencies
 */

import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { shouldReportOmitBlogId } from '../utils';

describe( '#shouldReportOmitBlogId', () => {
	test( 'should allow blog_id reporting for site-specific paths', () => {
		expect( shouldReportOmitBlogId( '/stats/day/example.wordpress.com' ) ).to.be.false;
		expect( shouldReportOmitBlogId( '/pages/example.wordpress.com' ) ).to.be.false;
		expect( shouldReportOmitBlogId( '/posts/example.wordpress.com' ) ).to.be.false;
		expect( shouldReportOmitBlogId( '/media/example.wordpress.com' ) ).to.be.false;
		expect( shouldReportOmitBlogId( '/comments/all/example.wordpress.com' ) ).to.be.false;
		expect( shouldReportOmitBlogId( '/plugins/example.wordpress.com' ) ).to.be.false;
		expect( shouldReportOmitBlogId( '/domains/manage/example.wordpress.com' ) ).to.be.false;
		expect( shouldReportOmitBlogId( '/settings/general/example.wordpress.com' ) ).to.be.false;
	} );
	test( 'should not allow blog_id reporting for general administration paths', () => {
		expect( shouldReportOmitBlogId( '/' ) ).to.be.true;
		expect( shouldReportOmitBlogId( '/me' ) ).to.be.true;
		expect( shouldReportOmitBlogId( '/help' ) ).to.be.true;
		expect( shouldReportOmitBlogId( '/read' ) ).to.be.true;
		expect( shouldReportOmitBlogId( '/following' ) ).to.be.true;
		expect( shouldReportOmitBlogId( '/discover' ) ).to.be.true;
		expect( shouldReportOmitBlogId( '/activities' ) ).to.be.true;
		expect( shouldReportOmitBlogId( '/tag' ) ).to.be.true;
	} );
} );

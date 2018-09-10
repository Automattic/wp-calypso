/**
 * @format
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import { pathRewriteMiddleware, urlRewriteMiddleware } from '../index';

const rootUrl = 'https://public-api.wordpress.com';
const testSiteSlug = 'example.wordpress.com';

const pathReturner = path => {
	let output;

	pathRewriteMiddleware( { path: path }, nextOutput => ( output = nextOutput ), testSiteSlug );

	return output.path;
};

it( 'Adds the site slug to the path', () => {
	[
		[ '/', '/' ],
		[ '/wp/v2/', `/sites/${ testSiteSlug }/` ],
		[
			'/wp/v2/users/?who=authors&per_page=10',
			`/sites/${ testSiteSlug }/users/?who=authors&per_page=10`,
		],
		[ '/wp/v2/types/post?context=edit', `/sites/${ testSiteSlug }/types/post?context=edit` ],
		[ '/wp/v2/taxonomies?context=edit', `/sites/${ testSiteSlug }/taxonomies?context=edit` ],
	].forEach( ( [ input, output ] ) => expect( pathReturner( input ) ).toEqual( output ) );
} );

const urlReturner = url => {
	let output;

	urlRewriteMiddleware( { url: url }, nextOutput => ( output = nextOutput ), testSiteSlug );

	return output.url;
};

it( 'Adds the site slug to the url', () => {
	[
		[ rootUrl, rootUrl ],
		[ `${ rootUrl }/wp/v2/`, `${ rootUrl }/sites/${ testSiteSlug }/` ],
		[
			`${ rootUrl }/wp/v2/users/?who=authors&per_page=10`,
			`${ rootUrl }/sites/${ testSiteSlug }/users/?who=authors&per_page=10`,
		],
		[
			`${ rootUrl }/wp/v2/types/post?context=edit`,
			`${ rootUrl }/sites/${ testSiteSlug }/types/post?context=edit`,
		],
		[
			`${ rootUrl }/wp/v2/taxonomies?context=edit`,
			`${ rootUrl }/sites/${ testSiteSlug }/taxonomies?context=edit`,
		],
	].forEach( ( [ input, output ] ) => expect( urlReturner( input ) ).toEqual( output ) );
} );

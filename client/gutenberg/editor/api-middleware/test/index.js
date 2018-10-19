/**
 * @format
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import { wpcomPathMappingMiddleware } from '../index';

const testSiteSlug = 'example.wordpress.com';

const optionsReturner = options => {
	let output;

	wpcomPathMappingMiddleware( options, nextOutput => ( output = nextOutput ), testSiteSlug );

	return output;
};

describe( 'wpcomPathMappingMiddleware', () => {
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
		].forEach( ( [ input, output ] ) =>
			expect( optionsReturner( { path: input } ).path ).toEqual( output )
		);
	} );

	it( 'Sets correct namespace based on path', () => {
		[
			[ '/', undefined ],
			[ '/wp/v2/', `wp/v2` ],
			[ '/wp/v2/users/?who=authors&per_page=10', 'wp/v2' ],
			[ '/wp/v2/types/post?context=edit', 'wp/v2' ],
			[ '/gutenberg/v1/block-renderer/core/latest-comments', 'gutenberg/v1' ],
			[ '/oembed/1.0/proxy?url=example.wordpress.com', 'oembed/1.0' ],
			[ '/oembed/110/proxy?url=example.wordpress.com', undefined ],
		].forEach( ( [ input, output ] ) =>
			expect( optionsReturner( { path: input } ).apiNamespace ).toEqual( output )
		);
	} );
} );

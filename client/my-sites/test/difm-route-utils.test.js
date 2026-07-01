import { isPathAllowedForDIFMPreSubmitContentCollection } from '../difm-route-utils';

describe( 'isPathAllowedForDIFMPreSubmitContentCollection', () => {
	test.each( [
		[ '/media/example.wordpress.com' ],
		[ '/media/images/example.wordpress.com' ],
		[ '/posts/example.wordpress.com' ],
		[ '/posts/my/example.wordpress.com' ],
		[ '/post/example.wordpress.com' ],
		[ '/pages/example.wordpress.com' ],
		[ '/page/example.wordpress.com' ],
		[ '/settings/taxonomies/category/example.wordpress.com' ],
		[ '/settings/taxonomies/post_tag/example.wordpress.com' ],
	] )( 'allows %s before website content submission', ( path ) => {
		expect( isPathAllowedForDIFMPreSubmitContentCollection( path, false ) ).toBe( true );
	} );

	test.each( [
		[ '/media/example.wordpress.com' ],
		[ '/posts/example.wordpress.com' ],
		[ '/pages/example.wordpress.com' ],
	] )( 'does not allow %s after website content submission', ( path ) => {
		expect( isPathAllowedForDIFMPreSubmitContentCollection( path, true ) ).toBe( false );
	} );

	it( 'keeps non-content paths locked before website content submission', () => {
		expect(
			isPathAllowedForDIFMPreSubmitContentCollection( '/stats/day/example.wordpress.com', false )
		).toBe( false );
	} );
} );

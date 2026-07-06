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

	test.each( [ [ undefined ], [ null ], [ true ], [ 0 ], [ 'false' ] ] )(
		'fails safe and keeps paths locked when the submitted flag is %p (only explicit false unlocks)',
		( flagValue ) => {
			expect(
				isPathAllowedForDIFMPreSubmitContentCollection( '/media/example.wordpress.com', flagValue )
			).toBe( false );
		}
	);

	it( 'fails safe when the submitted flag argument is missing', () => {
		expect( isPathAllowedForDIFMPreSubmitContentCollection( '/media/example.wordpress.com' ) ).toBe(
			false
		);
	} );

	test.each( [
		[ '/settings/taxonomies/some_custom_taxonomy/example.wordpress.com' ],
		[ '/settings/taxonomies' ],
		[ '/settings/taxonomies/example.wordpress.com' ],
	] )( 'does not allow unrelated taxonomy path %s', ( path ) => {
		expect( isPathAllowedForDIFMPreSubmitContentCollection( path, false ) ).toBe( false );
	} );
} );

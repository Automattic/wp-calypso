/**
 * @jest-environment jsdom
 */
import { isSeoSearch } from '..';

describe( 'isSeoSearch', () => {
	it( 'matches generic and feature SEO terms', () => {
		[ 'seo', 'SEO', 'xml sitemap', 'meta description', 'open graph', 'schema markup' ].forEach(
			( term ) => expect( isSeoSearch( term ) ).toBe( true )
		);
	} );

	it( 'matches common third-party SEO plugin names', () => {
		[ 'yoast', 'Yoast SEO', 'rank math', 'all in one seo', 'aioseo', 'the seo framework' ].forEach(
			( term ) => expect( isSeoSearch( term ) ).toBe( true )
		);
	} );

	it( 'does not match unrelated searches', () => {
		[ 'contact form', 'backup', 'woocommerce', 'gallery', 'security' ].forEach( ( term ) =>
			expect( isSeoSearch( term ) ).toBe( false )
		);
	} );

	it( 'handles empty or nullish input', () => {
		expect( isSeoSearch( '' ) ).toBe( false );
		expect( isSeoSearch( null ) ).toBe( false );
		expect( isSeoSearch( undefined ) ).toBe( false );
	} );
} );

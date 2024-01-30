import { uriTransformer } from '../uri-transformer';

describe( 'uriTransformer', () => {
	it( 'should return the same URL if it starts with # or /', () => {
		expect( uriTransformer( '#anchor' ) ).toBe( '#anchor' );
		expect( uriTransformer( '/relative/path' ) ).toBe( '/relative/path' );
	} );

	it( 'should return the same URL if it uses a valid protocol', () => {
		expect( uriTransformer( 'http://example.com' ) ).toBe( 'http://example.com' );
		expect( uriTransformer( 'https://example.com' ) ).toBe( 'https://example.com' );
		expect( uriTransformer( 'mailto:example@example.com' ) ).toBe( 'mailto:example@example.com' );
		expect( uriTransformer( 'tel:+1234567890' ) ).toBe( 'tel:+1234567890' );
		expect( uriTransformer( 'prompt:example' ) ).toBe( 'prompt:example' );
	} );

	it( 'should return the same URL if it has a colon after a question mark or hash', () => {
		expect( uriTransformer( 'http://example.com?param=value:other' ) ).toBe(
			'http://example.com?param=value:other'
		);
		expect( uriTransformer( 'http://example.com#hash:value' ) ).toBe(
			'http://example.com#hash:value'
		);
	} );

	it( 'should return "javascript:void(0)" if it uses an invalid protocol', () => {
		expect( uriTransformer( 'ftp://example.com' ) ).toBe( 'javascript:void(0)' );
		expect( uriTransformer( 'invalid://example.com' ) ).toBe( 'javascript:void(0)' );
	} );
} );

// eslint-disable-next-line jest/no-export
export default function runTests( determineUrlType ) {
	test( 'should detect the correct type for absolute URLs', () => {
		expect( determineUrlType( 'http://example.com/' ) ).toBe( 'ABSOLUTE' );
		expect( determineUrlType( 'http://www.example.com' ) ).toBe( 'ABSOLUTE' );
		expect( determineUrlType( 'http://example.com/bar' ) ).toBe( 'ABSOLUTE' );
		expect( determineUrlType( 'http://example.com/bar?baz=1' ) ).toBe( 'ABSOLUTE' );
		expect( determineUrlType( new URL( 'http://example.com' ) ) ).toBe( 'ABSOLUTE' );
		// From https://url.spec.whatwg.org/#urls
		expect( determineUrlType( 'https:example.org' ) ).toBe( 'ABSOLUTE' );
		expect( determineUrlType( 'https://////example.com///' ) ).toBe( 'ABSOLUTE' );
		expect( determineUrlType( 'https://example.com/././foo' ) ).toBe( 'ABSOLUTE' );
		expect( determineUrlType( 'hello:world' ) ).toBe( 'ABSOLUTE' );
		expect( determineUrlType( 'file:///C|/demo' ) ).toBe( 'ABSOLUTE' );
		expect( determineUrlType( 'file://loc%61lhost/' ) ).toBe( 'ABSOLUTE' );
		expect( determineUrlType( 'https://user:password@example.org/' ) ).toBe( 'ABSOLUTE' );
		expect( determineUrlType( 'https://example.org/foo bar' ) ).toBe( 'ABSOLUTE' );
		expect( determineUrlType( 'https://EXAMPLE.com/../x' ) ).toBe( 'ABSOLUTE' );
	} );

	test( 'should detect the correct type for protocol-relative URLs', () => {
		expect( determineUrlType( '//example.com/' ) ).toBe( 'SCHEME_RELATIVE' );
		expect( determineUrlType( '//www.example.com' ) ).toBe( 'SCHEME_RELATIVE' );
		expect( determineUrlType( '//example.com/bar' ) ).toBe( 'SCHEME_RELATIVE' );
		expect( determineUrlType( '//example.com/bar?baz=1' ) ).toBe( 'SCHEME_RELATIVE' );
	} );

	test( 'should detect the correct type for root-relative URLs', () => {
		expect( determineUrlType( '/' ) ).toBe( 'PATH_ABSOLUTE' );
		expect( determineUrlType( '/bar' ) ).toBe( 'PATH_ABSOLUTE' );
		expect( determineUrlType( '/bar?baz=1' ) ).toBe( 'PATH_ABSOLUTE' );
	} );

	test( 'should detect the correct type for path-relative URLs', () => {
		expect( determineUrlType( '' ) ).toBe( 'PATH_RELATIVE' );
		expect( determineUrlType( 'bar' ) ).toBe( 'PATH_RELATIVE' );
		expect( determineUrlType( 'bar?baz=1' ) ).toBe( 'PATH_RELATIVE' );
		expect( determineUrlType( 'bar#anchor' ) ).toBe( 'PATH_RELATIVE' );
		expect( determineUrlType( '?query=param' ) ).toBe( 'PATH_RELATIVE' );
		expect( determineUrlType( '#fragment' ) ).toBe( 'PATH_RELATIVE' );
	} );

	test( 'should detect the correct type for invalid URLs', () => {
		expect( determineUrlType( null ) ).toBe( 'INVALID' );
		expect( determineUrlType( 0 ) ).toBe( 'INVALID' );
		expect( determineUrlType( '///' ) ).toBe( 'INVALID' );
		// From https://url.spec.whatwg.org/#urls
		expect( determineUrlType( 'https://example.com:demo' ) ).toBe( 'INVALID' );
	} );
}

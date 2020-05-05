describe( 'safeImageUrl()', () => {
	let safeImageUrl;

	function commonTests() {
		test( 'should ignore a relative url', () => {
			expect( safeImageUrl( '/foo' ) ).toEqual( '/foo' );
		} );

		test( 'should ignore a data url', () => {
			const dataImageUrl =
				'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
			expect( safeImageUrl( dataImageUrl ) ).toEqual( dataImageUrl );
		} );

		test( 'should make a non-whitelisted protocol safe', () => {
			[ 'javascript:alert("foo")', 'data:application/json;base64,', 'about:config' ].forEach(
				( url ) => {
					expect( safeImageUrl( url ) ).toMatch( /^https:\/\/i[0-2]\.wp.com\// );
				}
			);
		} );

		test( 'should make a non-wpcom http url safe', () => {
			expect( safeImageUrl( 'http://example.com/foo' ) ).toEqual(
				'https://i1.wp.com/example.com/foo'
			);
		} );

		test( 'should make a non-wpcom https url safe', () => {
			expect( safeImageUrl( 'https://example.com/foo' ) ).toEqual(
				'https://i1.wp.com/example.com/foo?ssl=1'
			);
		} );

		test( 'should make wp-com like subdomain url safe', () => {
			expect( safeImageUrl( 'https://wordpress.com.example.com/foo' ) ).toEqual(
				'https://i0.wp.com/wordpress.com.example.com/foo?ssl=1'
			);
		} );

		test( 'should make safe variations of urls testing extremes of safe patterns', () => {
			expect(
				[
					'https://examplewordpress.com/foo',
					'https://wordpresscom/foo',
					'https://wordpress.com.example.com/foo',
				].map( safeImageUrl )
			).toEqual( [
				'https://i0.wp.com/examplewordpress.com/foo?ssl=1',
				'https://i0.wp.com/wordpresscom/foo?ssl=1',
				'https://i0.wp.com/wordpress.com.example.com/foo?ssl=1',
			] );
		} );

		test( 'should make a non-wpcom protocol relative url safe', () => {
			expect( safeImageUrl( '//example.com/foo' ) ).toEqual( 'https://i1.wp.com/example.com/foo' );
		} );

		test( 'should promote an http wpcom url to https', () => {
			expect( safeImageUrl( 'http://files.wordpress.com/' ) ).toEqual(
				'https://files.wordpress.com/'
			);
			expect( safeImageUrl( 'http://wordpress.com/' ) ).toEqual( 'https://wordpress.com/' );
		} );

		test( 'should leave https wpcom url alone', () => {
			expect( safeImageUrl( 'https://files.wordpress.com/' ) ).toEqual(
				'https://files.wordpress.com/'
			);
			expect( safeImageUrl( 'https://wordpress.com/' ) ).toEqual( 'https://wordpress.com/' );
			expect( safeImageUrl( 'https://blog-en.files.wordpress.com/' ) ).toEqual(
				'https://blog-en.files.wordpress.com/'
			);
		} );

		test( 'should promote an http gravatar url to https', () => {
			expect( safeImageUrl( 'http://files.gravatar.com/' ) ).toEqual(
				'https://files.gravatar.com/'
			);
			expect( safeImageUrl( 'http://gravatar.com/' ) ).toEqual( 'https://gravatar.com/' );
		} );

		test( 'should leave https gravatar url alone', () => {
			expect( safeImageUrl( 'https://files.gravatar.com/' ) ).toEqual(
				'https://files.gravatar.com/'
			);
			expect( safeImageUrl( 'https://gravatar.com/' ) ).toEqual( 'https://gravatar.com/' );
		} );

		test( 'should return null for urls with querystrings', () => {
			expect( safeImageUrl( 'https://example.com/foo?bar' ) ).toBeNull();
			expect( safeImageUrl( 'https://example.com/foo.jpg?bar' ) ).toBeNull();
			expect( safeImageUrl( 'https://example.com/foo.jpeg?bar' ) ).toBeNull();
			expect( safeImageUrl( 'https://example.com/foo.gif?bar' ) ).toBeNull();
			expect( safeImageUrl( 'https://example.com/foo.png?bar' ) ).toBeNull();
			expect( safeImageUrl( 'https://example.com/foo.png?width=90' ) ).toBeNull();
		} );

		test( 'should return null for SVG images', () => {
			expect( safeImageUrl( 'https://example.com/foo.svg' ) ).toBeNull();
			expect( safeImageUrl( 'https://example.com/foo.svg?ssl=1' ) ).toBeNull();
		} );
	}

	describe( 'browser', () => {
		beforeAll( () => {
			global.location = { origin: 'https://wordpress.com' };
			delete require.cache[ require.resolve( '../' ) ];
			safeImageUrl = require( '../' );
		} );

		afterAll( () => {
			delete global.location;
			delete require.cache[ require.resolve( '../' ) ];
		} );

		test( 'should ignore a blob url for current origin', () => {
			const originalUrl = 'blob:https://wordpress.com/ddd1d6b0-f31b-4937-ae9e-97f1d660cf71';
			expect( safeImageUrl( originalUrl ) ).toEqual( originalUrl );
		} );

		test( 'should make a blob url for other origin safe', () => {
			const originalUrl = 'blob:http://example.com/ddd1d6b0-f31b-4937-ae9e-97f1d660cf71';
			const expectedUrl =
				'https://i1.wp.com/http//example.com/ddd1d6b0-f31b-4937-ae9e-97f1d660cf71';
			expect( safeImageUrl( originalUrl ) ).toEqual( expectedUrl );
		} );

		commonTests();
	} );

	describe( 'node', () => {
		beforeAll( () => {
			safeImageUrl = require( '../' );
		} );

		test( 'should make a blob url safe', () => {
			const originalUrl = 'blob:http://example.com/ddd1d6b0-f31b-4937-ae9e-97f1d660cf71';
			const expectedUrl =
				'https://i1.wp.com/http//example.com/ddd1d6b0-f31b-4937-ae9e-97f1d660cf71';
			expect( safeImageUrl( originalUrl ) ).toEqual( expectedUrl );
		} );

		commonTests();
	} );
} );

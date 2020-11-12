/**
 * External dependencies
 */
import { expect } from 'chai';

describe( 'resizeImageUrl()', () => {
	const imageUrl =
		'https://testonesite2014.files.wordpress.com/2014/11/image5.jpg?w=1000&h=1000&resize=foo&fit=meh';

	let resizeImageUrl;
	beforeAll( () => {
		resizeImageUrl = require( '..' ).default;
	} );

	test( 'should return non-string URLs unmodified', () => {
		expect( resizeImageUrl() ).to.be.undefined;
		expect( resizeImageUrl( null ) ).to.be.null;
		expect( resizeImageUrl( 1 ) ).to.equal( 1 );
	} );

	test( 'should strip original query params (WP.com)', () => {
		const resizedUrl = resizeImageUrl( imageUrl );
		expect( resizedUrl ).to.equal(
			'https://testonesite2014.files.wordpress.com/2014/11/image5.jpg'
		);
	} );

	test( 'should strip original query params (Photon)', () => {
		const original = 'https://i0.wp.com/example.com/foo.png?fit=meh';
		const resizedUrl = resizeImageUrl( original );
		expect( resizedUrl ).to.equal( 'https://i0.wp.com/example.com/foo.png' );
	} );

	test( 'should not attempt to resize non-HTTP protocols', () => {
		const blobImageUrl =
			'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
		const resizedUrl = resizeImageUrl( blobImageUrl, { resize: '40,40' } );
		expect( resizedUrl ).to.equal( blobImageUrl );
	} );

	test( 'should allow arguments to be specified as strings', () => {
		const resizedUrl = resizeImageUrl( imageUrl, { w: '40' } );
		expect( resizedUrl ).to.equal(
			'https://testonesite2014.files.wordpress.com/2014/11/image5.jpg?w=40'
		);
	} );

	test( 'should preserve unrelated query arguments', () => {
		const gravatarUrl =
			'https://gravatar.com/avatar/00000000000000000000000000000000?d=https%3A%2F%2Fexample.com%2Favatar.jpg';
		const resizedUrl = resizeImageUrl( gravatarUrl, { s: '40' } );
		const expectedUrl =
			'https://gravatar.com/avatar/00000000000000000000000000000000?d=https%3A%2F%2Fexample.com%2Favatar.jpg&s=40';
		expect( resizedUrl ).to.equal( expectedUrl );
	} );

	describe( 'numeric width', () => {
		describe( 'wpcom', () => {
			test( 'should append width as ?w query argument', () => {
				const original = 'https://testonesite2014.files.wordpress.com/2014/11/image5.jpg';
				const resized = resizeImageUrl( original, 40 );
				const expected = 'https://testonesite2014.files.wordpress.com/2014/11/image5.jpg?w=40';
				expect( resized ).to.equal( expected );
			} );

			test( 'should append ?fit query argument if both width and height provided', () => {
				const original = 'https://testonesite2014.files.wordpress.com/2014/11/image5.jpg';
				const resized = resizeImageUrl( original, 40, 20 );
				const expected =
					'https://testonesite2014.files.wordpress.com/2014/11/image5.jpg?fit=40%2C20';
				expect( resized ).to.equal( expected );
			} );
		} );

		describe( 'photon', () => {
			test( 'should append width as ?w query argument', () => {
				const original = 'https://i0.wp.com/example.com/foo.png';
				const resized = resizeImageUrl( original, 40 );
				const expected = 'https://i0.wp.com/example.com/foo.png?w=40';
				expect( resized ).to.equal( expected );
			} );

			test( 'should append ?fit query argument if both width and height provided', () => {
				const original = 'https://i0.wp.com/example.com/foo.png';
				const resized = resizeImageUrl( original, 40, 20 );
				const expected = 'https://i0.wp.com/example.com/foo.png?fit=40%2C20';
				expect( resized ).to.equal( expected );
			} );
		} );

		describe( 'gravatar', () => {
			test( 'should append width as ?s query argument', () => {
				const original = 'https://gravatar.com/avatar/00000000000000000000000000000000';
				const resized = resizeImageUrl( original, 40 );
				const expected = 'https://gravatar.com/avatar/00000000000000000000000000000000?s=40';
				expect( resized ).to.equal( expected );
			} );

			test( 'should ignore height', () => {
				const original = 'https://gravatar.com/avatar/00000000000000000000000000000000';
				const resized = resizeImageUrl( original, 40, 20 );
				const expected = 'https://gravatar.com/avatar/00000000000000000000000000000000?s=40';
				expect( resized ).to.equal( expected );
			} );
		} );

		describe( 'external', () => {
			test( 'should return a Photonized (safe) resized image with width', () => {
				const original = 'https://example.com/foo.png';
				const expected = 'https://i0.wp.com/example.com/foo.png?ssl=1&w=40';
				expect( resizeImageUrl( original, 40 ) ).to.equal( expected );
				expect( resizeImageUrl( original, { w: 40 } ) ).to.equal( expected );
			} );

			test( 'should return a Photonized (safe) resized image with width and height', () => {
				const original = 'https://example.com/foo.png';
				const resized = resizeImageUrl( original, 40, 20 );
				const expected = 'https://i0.wp.com/example.com/foo.png?ssl=1&fit=40%2C20';
				expect( resized ).to.equal( expected );
			} );

			test( 'returns null for URLs with query string', () => {
				const original = 'https://example.com/foo.png?bar=baz';
				const resized = resizeImageUrl( original, 40, 20 );
				expect( resized ).to.be.null;
			} );

			test( 'should treat external wp-content urls as external', () => {
				const original = 'https://blacktacho.com/wp-content/uploads/2018/10/Divo07.jpg';
				const resized = resizeImageUrl( original, 450 );
				expect( resized ).to.equal(
					'https://i2.wp.com/blacktacho.com/wp-content/uploads/2018/10/Divo07.jpg?ssl=1&w=450'
				);
			} );
		} );
	} );

	describe( 'standard pixel density', () => {
		test( 'should append resize argument', () => {
			const resizedUrl = resizeImageUrl( imageUrl, { resize: '40,40' } );
			expect( resizedUrl ).to.equal(
				'https://testonesite2014.files.wordpress.com/2014/11/image5.jpg?resize=40%2C40'
			);
		} );

		test( 'should append fit argument', () => {
			const resizedUrl = resizeImageUrl( imageUrl, { fit: '40,40' } );
			expect( resizedUrl ).to.equal(
				'https://testonesite2014.files.wordpress.com/2014/11/image5.jpg?fit=40%2C40'
			);
		} );

		test( 'should append w argument', () => {
			const resizedUrl = resizeImageUrl( imageUrl, { w: 40 } );
			expect( resizedUrl ).to.equal(
				'https://testonesite2014.files.wordpress.com/2014/11/image5.jpg?w=40'
			);
		} );

		test( 'should append s argument', () => {
			const resizedUrl = resizeImageUrl( imageUrl, { s: 200 } );
			expect( resizedUrl ).to.equal(
				'https://testonesite2014.files.wordpress.com/2014/11/image5.jpg?s=200'
			);
		} );
	} );

	describe( 'high pixel density', () => {
		beforeAll( () => {
			global.window = { devicePixelRatio: 2 };
			// We need to reset module under test to recompute image scale factor
			jest.resetModules();
			resizeImageUrl = require( '..' ).default;
		} );

		afterAll( () => {
			global.window = undefined;
			// We need to reset module under test to recompute image scale factor
			jest.resetModules();
			resizeImageUrl = require( '..' ).default;
		} );

		test( 'should append resize argument', () => {
			const resizedUrl = resizeImageUrl( imageUrl, { resize: '40,40' } );
			expect( resizedUrl ).to.equal(
				'https://testonesite2014.files.wordpress.com/2014/11/image5.jpg?resize=80%2C80'
			);
		} );

		test( 'should append fit argument', () => {
			const resizedUrl = resizeImageUrl( imageUrl, { fit: '40,40' } );
			expect( resizedUrl ).to.equal(
				'https://testonesite2014.files.wordpress.com/2014/11/image5.jpg?fit=80%2C80'
			);
		} );

		test( 'should append w argument', () => {
			const resizedUrl = resizeImageUrl( imageUrl, { w: 40 } );
			expect( resizedUrl ).to.equal(
				'https://testonesite2014.files.wordpress.com/2014/11/image5.jpg?w=80'
			);
		} );

		test( 'should append s argument', () => {
			const resizedUrl = resizeImageUrl( imageUrl, { s: 200 } );
			expect( resizedUrl ).to.equal(
				'https://testonesite2014.files.wordpress.com/2014/11/image5.jpg?s=400'
			);
		} );
	} );
} );

/**
 * External dependencies
 */
import { expect } from 'chai';

describe( 'resizeImageUrl()', () => {
	const imageUrl = 'https://testonesite2014.files.wordpress.com/2014/11/image5.jpg?w=1000&h=1000&resize=foo&fit=meh';

	let resizeImageUrl;
	before( () => {
		resizeImageUrl = require( '..' );
	} );

	it( 'should return non-string URLs unmodified', () => {
		expect( resizeImageUrl() ).to.be.undefined;
		expect( resizeImageUrl( null ) ).to.be.null;
		expect( resizeImageUrl( 1 ) ).to.equal( 1 );
	} );

	it( 'should strip original query params', () => {
		const resizedUrl = resizeImageUrl( imageUrl );
		expect( resizedUrl ).to.equal( 'https://testonesite2014.files.wordpress.com/2014/11/image5.jpg' );
	} );

	it( 'should not attempt to resize non-HTTP protocols', () => {
		const blobImageUrl = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
		const resizedUrl = resizeImageUrl( blobImageUrl, { resize: '40,40' } );
		expect( resizedUrl ).to.equal( blobImageUrl );
	} );

	it( 'should allow arguments to be specified as strings', () => {
		const resizedUrl = resizeImageUrl( imageUrl, { w: '40' } );
		expect( resizedUrl ).to.equal( 'https://testonesite2014.files.wordpress.com/2014/11/image5.jpg?w=40' );
	} );

	it( 'should preserve unrelated query arguments', () => {
		const gravatarUrl = 'https://gravatar.com/avatar/00000000000000000000000000000000?d=https%3A%2F%2Fexample.com%2Favatar.jpg';
		const resizedUrl = resizeImageUrl( gravatarUrl, { s: '40' } );
		const expectedUrl = 'https://gravatar.com/avatar/00000000000000000000000000000000?d=https%3A%2F%2Fexample.com%2Favatar.jpg&s=40';
		expect( resizedUrl ).to.equal( expectedUrl );
	} );

	context( 'numeric width', () => {
		context( 'wpcom', () => {
			it( 'should append width as ?w query argument', () => {
				const original = 'https://testonesite2014.files.wordpress.com/2014/11/image5.jpg';
				const resized = resizeImageUrl( original, 40 );
				const expected = 'https://testonesite2014.files.wordpress.com/2014/11/image5.jpg?w=40';
				expect( resized ).to.equal( expected );
			} );

			it( 'should append ?fit query argument if both width and height provided', () => {
				const original = 'https://testonesite2014.files.wordpress.com/2014/11/image5.jpg';
				const resized = resizeImageUrl( original, 40, 20 );
				const expected = 'https://testonesite2014.files.wordpress.com/2014/11/image5.jpg?fit=40%2C20';
				expect( resized ).to.equal( expected );
			} );
		} );

		context( 'photon', () => {
			it( 'should append width as ?w query argument', () => {
				const original = 'https://i0.wp.com/example.com/foo.png';
				const resized = resizeImageUrl( original, 40 );
				const expected = 'https://i0.wp.com/example.com/foo.png?w=40';
				expect( resized ).to.equal( expected );
			} );

			it( 'should append ?fit query argument if both width and height provided', () => {
				const original = 'https://i0.wp.com/example.com/foo.png';
				const resized = resizeImageUrl( original, 40, 20 );
				const expected = 'https://i0.wp.com/example.com/foo.png?fit=40%2C20';
				expect( resized ).to.equal( expected );
			} );
		} );

		context( 'gravatar', () => {
			it( 'should append width as ?s query argument', () => {
				const original = 'https://gravatar.com/avatar/00000000000000000000000000000000';
				const resized = resizeImageUrl( original, 40 );
				const expected = 'https://gravatar.com/avatar/00000000000000000000000000000000?s=40';
				expect( resized ).to.equal( expected );
			} );

			it( 'should ignore height', () => {
				const original = 'https://gravatar.com/avatar/00000000000000000000000000000000';
				const resized = resizeImageUrl( original, 40, 20 );
				const expected = 'https://gravatar.com/avatar/00000000000000000000000000000000?s=40';
				expect( resized ).to.equal( expected );
			} );
		} );

		context( 'external', () => {
			it( 'should return a Photonized (safe) resized image with width', () => {
				const original = 'https://example.com/foo.png';
				const resized = resizeImageUrl( original, 40 );
				const expected = 'https://i0.wp.com/example.com/foo.png?ssl=1&w=40';
				expect( resized ).to.equal( expected );
			} );

			it( 'should return a Photonized (safe) resized image with width and height', () => {
				const original = 'https://example.com/foo.png';
				const resized = resizeImageUrl( original, 40, 20 );
				const expected = 'https://i0.wp.com/example.com/foo.png?ssl=1&fit=40%2C20';
				expect( resized ).to.equal( expected );
			} );
		} );
	} );

	context( 'standard pixel density', () => {
		it( 'should append resize argument', () => {
			const resizedUrl = resizeImageUrl( imageUrl, { resize: '40,40' } );
			expect( resizedUrl ).to.equal( 'https://testonesite2014.files.wordpress.com/2014/11/image5.jpg?resize=40%2C40' );
		} );

		it( 'should append fit argument', () => {
			const resizedUrl = resizeImageUrl( imageUrl, { fit: '40,40' } );
			expect( resizedUrl ).to.equal( 'https://testonesite2014.files.wordpress.com/2014/11/image5.jpg?fit=40%2C40' );
		} );

		it( 'should append w argument', () => {
			const resizedUrl = resizeImageUrl( imageUrl, { w: 40 } );
			expect( resizedUrl ).to.equal( 'https://testonesite2014.files.wordpress.com/2014/11/image5.jpg?w=40' );
		} );

		it( 'should append s argument', () => {
			const resizedUrl = resizeImageUrl( imageUrl, { s: 200 } );
			expect( resizedUrl ).to.equal( 'https://testonesite2014.files.wordpress.com/2014/11/image5.jpg?s=200' );
		} );
	} );

	context( 'high pixel density', () => {
		before( () => {
			global.window = { devicePixelRatio: 2 };
			jest.resetModules();
			resizeImageUrl = require( '..' );
		} );

		after( () => {
			global.window = undefined;
			jest.resetModules();
			resizeImageUrl = require( '..' );
		} );

		it( 'should append resize argument', () => {
			const resizedUrl = resizeImageUrl( imageUrl, { resize: '40,40' } );
			expect( resizedUrl ).to.equal( 'https://testonesite2014.files.wordpress.com/2014/11/image5.jpg?resize=80%2C80' );
		} );

		it( 'should append fit argument', () => {
			const resizedUrl = resizeImageUrl( imageUrl, { fit: '40,40' } );
			expect( resizedUrl ).to.equal( 'https://testonesite2014.files.wordpress.com/2014/11/image5.jpg?fit=80%2C80' );
		} );

		it( 'should append w argument', () => {
			const resizedUrl = resizeImageUrl( imageUrl, { w: 40 } );
			expect( resizedUrl ).to.equal( 'https://testonesite2014.files.wordpress.com/2014/11/image5.jpg?w=80' );
		} );

		it( 'should append s argument', () => {
			const resizedUrl = resizeImageUrl( imageUrl, { s: 200 } );
			expect( resizedUrl ).to.equal( 'https://testonesite2014.files.wordpress.com/2014/11/image5.jpg?s=400' );
		} );
	} );
} );

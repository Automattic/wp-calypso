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
			delete require.cache[ require.resolve( '..' ) ];
			resizeImageUrl = require( '..' );
		} );

		after( () => {
			delete global.window;
			delete require.cache[ require.resolve( '..' ) ];
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

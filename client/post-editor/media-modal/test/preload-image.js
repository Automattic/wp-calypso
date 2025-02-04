/**
 * @jest-environment jsdom
 */
import preloadImage from '../preload-image';

describe( '#preloadImage()', () => {
	let image;

	beforeAll( () => {
		image = jest.spyOn( global.window, 'Image' );
	} );

	beforeEach( () => {
		preloadImage.cache.clear();
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	test( 'should load an image', () => {
		const src = 'https://wordpress.com/example.jpg';

		preloadImage( src );

		expect( image ).toHaveBeenCalledTimes( 1 );
		expect( image.mock.results[ 0 ].value.src ).toEqual( src );
	} );

	test( 'should only load an image once per `src`', () => {
		preloadImage( 'https://wordpress.com/example.jpg' );
		preloadImage( 'https://wordpress.com/example.jpg' );

		expect( image ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'should load an image per unique `src`', () => {
		preloadImage( 'https://wordpress.com/example1.jpg' );
		preloadImage( 'https://wordpress.com/example2.jpg' );

		expect( image ).toHaveBeenCalledTimes( 2 );
	} );
} );

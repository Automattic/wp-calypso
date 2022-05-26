/**
 * @jest-environment jsdom
 */
import scrollTo from '../';

describe( 'scroll-to', () => {
	beforeAll( () => {
		jest.spyOn( window, 'scrollTo' ).mockImplementation();
	} );

	test( 'window position x', () => {
		return new Promise( ( done ) => {
			scrollTo( {
				x: 500,
				y: 300,
				duration: 1,
				onComplete: () => {
					expect( window.scrollTo ).toHaveBeenCalledWith( 500, 300 );
					done();
				},
			} );
		} );
	} );
	test( 'window position y', () => {
		return new Promise( ( done ) => {
			scrollTo( {
				x: 0,
				y: 100,
				duration: 1,
				onComplete: () => {
					expect( window.scrollTo ).toHaveBeenCalledWith( 0, 100 );
					done();
				},
			} );
		} );
	} );
} );

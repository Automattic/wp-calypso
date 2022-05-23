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
					expect( window.scrollTo.mock.lastCall[ 0 ] ).toEqual( 500 );
					expect( window.scrollTo.mock.lastCall[ 1 ] ).toEqual( 300 );
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
					expect( window.scrollTo.mock.lastCall[ 0 ] ).toEqual( 0 );
					expect( window.scrollTo.mock.lastCall[ 1 ] ).toEqual( 100 );
					done();
				},
			} );
		} );
	} );
} );

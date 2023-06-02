import localStoragePolyfill from '..';

describe( 'localStorage', () => {
	describe( 'when window.localStorage does not exist', () => {
		const window = {};

		beforeAll( () => {
			localStoragePolyfill( window );
		} );

		test( 'should create a window.localStorage instance', () => {
			expect( window.localStorage ).toBeTruthy();
		} );

		test( 'should correctly store and retrieve data', () => {
			window.localStorage.setItem( 'foo', 'bar' );
			expect( window.localStorage.getItem( 'foo' ) ).toEqual( 'bar' );
			expect( window.localStorage.length ).toEqual( 1 );
		} );
	} );

	describe( 'when window.localStorage is not working correctly', () => {
		const window = {
			localStorage: {},
		};

		beforeAll( () => {
			localStoragePolyfill( window );
		} );

		test( 'should overwrite broken or missing methods', () => {
			expect( window.localStorage.setItem ).toBeTruthy();
			expect( window.localStorage.getItem ).toBeTruthy();
			expect( window.localStorage.removeItem ).toBeTruthy();
			expect( window.localStorage.clear ).toBeTruthy();
		} );

		test( 'should correctly store and retrieve data', () => {
			window.localStorage.setItem( 'foo', 'bar' );
			expect( window.localStorage.getItem( 'foo' ) ).toEqual( 'bar' );
			expect( window.localStorage.length ).toEqual( 1 );
		} );
	} );
} );

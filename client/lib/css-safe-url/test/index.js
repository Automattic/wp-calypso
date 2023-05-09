import cssSafeUrl from '../';

describe( 'css-safe-url', () => {
	test( 'should escape parens', () => {
		expect( cssSafeUrl( 'http://foo.com/()/' ) ).toEqual( 'http://foo.com/\\(\\)/' );
	} );
} );

import cssSafeUrl from '../';

describe( 'css-safe-url', () => {
	test( 'should escape parens and backslashes', () => {
		expect( cssSafeUrl( 'http://foo.com/()\\/' ) ).toEqual( 'http://foo.com/\\(\\)\\\\/' );
	} );
} );

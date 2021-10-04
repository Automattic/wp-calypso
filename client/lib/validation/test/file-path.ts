import { filePathValidator } from '..';

describe( 'filePathValidator', () => {
	test( 'should validate a basic path', () => {
		expect( filePathValidator( '/abc' ) ).toBeNull();
	} );

	test( 'should validate a path to root', () => {
		expect( filePathValidator( '/' ) ).toBeNull();
	} );

	test( 'should reject a path with no slashes', () => {
		expect( filePathValidator( 'abc' ) ).not.toBeNull();
	} );

	test( 'should reject a path with backslashes', () => {
		expect( filePathValidator( '\\abc' ) ).toHaveProperty(
			'message',
			'Use forward slashes, "/", in path.'
		);
	} );

	test( 'should validate a deep path', () => {
		expect( filePathValidator( '/abc/def/xyz/' ) ).toBeNull();
	} );

	test( 'should validate a path with a url like element', () => {
		expect( filePathValidator( '/abc/def.com/xyz/' ) ).toBeNull();
	} );

	// NOTE: We've seen support tickets with exactly this issue
	test.each( [ [ '//' ], [ '/abc//def' ], [ '/abc//' ], [ '///' ], [ '/a///b/c' ] ] )(
		'should reject a path with two or more adjacent slashes',
		( path ) => {
			expect( filePathValidator( path ) ).toHaveProperty(
				'message',
				'Use only single slashes, "/", in path.'
			);
		}
	);
} );

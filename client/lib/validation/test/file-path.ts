import { filePathValidator } from '..';

describe( 'filePathValidator', () => {
	test( 'should validate a basic path', () => {
		expect( filePathValidator( '/abc' ) ).toBeNull();
	} );

	test( 'should reject a path with no slashes', () => {
		expect( filePathValidator( 'abc' ) ).not.toBeNull();
	} );

	test( 'should reject a path with backslashes', () => {
		expect( filePathValidator( '\\abc' ) ).toHaveProperty(
			'message',
			'Use Forward Slashes, "/", in path.'
		);
	} );

	test( 'should validate a deep path', () => {
		expect( filePathValidator( '/abc/def/xyz/' ) ).toBeNull();
	} );

	// NOTE: We've seen support tickets with exactly this issue
	test.each( [ [ '//' ], [ '/abc//def' ], [ '/abc//' ], [ '///' ], [ '/a///b/c' ] ] )(
		'should reject a path with two or more adjacent slashes',
		( path ) => {
			expect( filePathValidator( path ) ).not.toBeNull();
		}
	);
} );

import { isVersionGreater } from '..';

describe( 'isVersionGreater', () => {
	it( 'should return true if the first version is greater than the second version', () => {
		expect( isVersionGreater( '1.2.3', '1.2.2' ) ).toBe( true );
		expect( isVersionGreater( '2.0.0', '1.9.9' ) ).toBe( true );
		expect( isVersionGreater( '1.0.0', '0.9.9' ) ).toBe( true );

		expect( isVersionGreater( '1.0.3', '1.0' ) ).toBe( false );
	} );

	it( 'should return false if the first version is less than the second version', () => {
		expect( isVersionGreater( '1.2.2', '1.2.3' ) ).toBe( false );
		expect( isVersionGreater( '1.9.9', '2.0.0' ) ).toBe( false );
		expect( isVersionGreater( '0.9.9', '1.0.0' ) ).toBe( false );

		expect( isVersionGreater( '1.0.2', '1.1.0' ) ).toBe( false );
		expect( isVersionGreater( '1.0', '1.0.3' ) ).toBe( false );
	} );

	it( 'should return false if the versions are equal', () => {
		expect( isVersionGreater( '1.2.3', '1.2.3' ) ).toBe( false );
	} );

	it( 'should return false if any of the versions is invalid', () => {
		expect( isVersionGreater( '1.2.3', null ) ).toBe( false );
		expect( isVersionGreater( null, '1.2.3' ) ).toBe( false );
		expect( isVersionGreater( '', '1.2.3' ) ).toBe( false );
		expect( isVersionGreater( '1.2.3', '' ) ).toBe( false );
	} );
} );

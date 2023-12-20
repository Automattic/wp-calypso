import { isSubdomain } from 'calypso/lib/domains';

describe( 'isSubdomain', () => {
	test( "should return false if there's no domain", () => {
		expect( isSubdomain( '' ) ).toEqual( false );
	} );

	test( 'should return the correct value for domains', () => {
		expect( isSubdomain( 'example.com' ) ).toEqual( false );
		expect( isSubdomain( 'example.com.br' ) ).toEqual( false );
		expect( isSubdomain( 'example.co.uk' ) ).toEqual( false );
		expect( isSubdomain( 'example.co.in' ) ).toEqual( false );
	} );

	test( 'should return the correct value for subdomains', () => {
		expect( isSubdomain( 'test.example.com' ) ).toEqual( true );
		expect( isSubdomain( 'www.example.com' ) ).toEqual( true );
		expect( isSubdomain( 'sub2.sub1.example.com' ) ).toEqual( true );
		expect( isSubdomain( 'sub3.sub2.sub1.example.co.uk' ) ).toEqual( true );
		expect( isSubdomain( 'sub.example.co.uk' ) ).toEqual( true );
		expect( isSubdomain( 'example.com.uk' ) ).toEqual( true );
		expect( isSubdomain( 'example.fr.uk' ) ).toEqual( true );
	} );
} );

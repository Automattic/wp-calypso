import { getRootDomain } from 'calypso/lib/domains/utils/get-root-domain';

describe( 'getRootDomain', () => {
	test( 'should return an empty string if domain is missing', () => {
		expect( getRootDomain( '' ) ).toEqual( '' );
	} );

	test( 'should return the correct root domain for a domain', () => {
		expect( getRootDomain( 'example.com' ) ).toEqual( 'example.com' );
	} );

	test( 'should return the correct root domain for a domain with a multi-level tld', () => {
		expect( getRootDomain( 'example.com.br' ) ).toEqual( 'example.com.br' );
	} );

	test( 'should return the correct root domain for a subdomain', () => {
		expect( getRootDomain( 'www.example.com' ) ).toEqual( 'example.com' );
	} );

	test( 'should return the correct root domain for a subdomain with a multi-level tld', () => {
		expect( getRootDomain( 'www.example.com.br' ) ).toEqual( 'example.com.br' );
		expect( getRootDomain( 'sub3.sub2.rafael-sub1.example.com.br' ) ).toEqual( 'example.com.br' );
	} );
} );

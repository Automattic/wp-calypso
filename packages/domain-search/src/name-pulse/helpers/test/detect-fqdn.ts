import { detectFqdn } from '..';

describe( 'detectFqdn', () => {
	it( 'detects a single-level TLD, case-insensitively', () => {
		expect( detectFqdn( 'Coffee.COM' ) ).toEqual( {
			isFqdn: true,
			baseName: 'coffee',
			tld: 'com',
			fullDomain: 'coffee.com',
		} );
	} );

	it( 'detects a multi-level TLD before the single-level fallback', () => {
		expect( detectFqdn( 'coffee.co.uk' ) ).toMatchObject( {
			isFqdn: true,
			baseName: 'coffee',
			tld: 'co.uk',
			fullDomain: 'coffee.co.uk',
		} );
	} );

	it( 'returns the sanitized base for input without a dot', () => {
		expect( detectFqdn( 'Coffee Shop' ) ).toEqual( {
			isFqdn: false,
			baseName: 'coffeeshop',
			tld: '',
			fullDomain: '',
		} );
	} );

	it( 'rejects unknown TLDs', () => {
		expect( detectFqdn( 'coffee.notatld' ).isFqdn ).toBe( false );
	} );

	it( 'rejects a base name shorter than two characters after sanitisation', () => {
		expect( detectFqdn( '---.com' ) ).toEqual( {
			isFqdn: false,
			baseName: '',
			tld: '',
			fullDomain: '',
		} );
		expect( detectFqdn( 'a.com' ).isFqdn ).toBe( false );
	} );

	it( 'rejects a bare TLD', () => {
		expect( detectFqdn( 'co.uk' ).isFqdn ).toBe( false );
	} );

	it( 'sanitises the base label of an FQDN', () => {
		expect( detectFqdn( 'Coffee Shop.com' ).fullDomain ).toBe( 'coffeeshop.com' );
		expect( detectFqdn( 'my.coffee.com' ).fullDomain ).toBe( 'mycoffee.com' );
	} );
} );

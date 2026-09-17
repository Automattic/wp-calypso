import { detectFqdn } from '..';

const TLDS = [ 'blog', 'com', 'net', 'org' ];

describe( 'detectFqdn', () => {
	it( 'detects a single-level TLD, case-insensitively', () => {
		expect( detectFqdn( 'Coffee.COM', TLDS ) ).toEqual( {
			isFqdn: true,
			baseName: 'coffee',
			tld: 'com',
			fullDomain: 'coffee.com',
		} );
	} );

	it( 'detects a multi-level TLD before the single-level fallback', () => {
		expect( detectFqdn( 'coffee.co.uk', TLDS ) ).toMatchObject( {
			isFqdn: true,
			baseName: 'coffee',
			tld: 'co.uk',
			fullDomain: 'coffee.co.uk',
		} );
	} );

	it( 'rejects TLDs that are not in the list', () => {
		expect( detectFqdn( 'coffee.notatld', TLDS ).isFqdn ).toBe( false );
		expect( detectFqdn( 'coffee.com', [ 'blog' ] ).isFqdn ).toBe( false );
	} );

	it( 'rejects a base name shorter than two characters after sanitisation', () => {
		expect( detectFqdn( '---.com', TLDS ) ).toEqual( {
			isFqdn: false,
			baseName: '',
			tld: '',
			fullDomain: '',
		} );
		expect( detectFqdn( 'a.com', TLDS ).isFqdn ).toBe( false );
	} );

	it( 'rejects a bare TLD', () => {
		expect( detectFqdn( 'co.uk', TLDS ).isFqdn ).toBe( false );
	} );

	it( 'sanitises the base label of an FQDN', () => {
		expect( detectFqdn( 'Coffee Shop.com', TLDS ).fullDomain ).toBe( 'coffeeshop.com' );
		expect( detectFqdn( 'my.coffee.com', TLDS ).fullDomain ).toBe( 'mycoffee.com' );
	} );
} );

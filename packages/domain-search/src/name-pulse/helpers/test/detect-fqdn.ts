import { detectFqdn } from '..';

const TLDS = [ 'blog', 'com', 'net', 'org' ];

describe( 'detectFqdn', () => {
	it( 'detects single- and multi-level TLDs, case-insensitively', () => {
		expect( detectFqdn( 'Coffee.COM', TLDS ) ).toEqual( {
			isFqdn: true,
			baseName: 'coffee',
			tld: 'com',
			fullDomain: 'coffee.com',
		} );
		expect( detectFqdn( 'coffee.co.uk', TLDS ) ).toMatchObject( {
			isFqdn: true,
			baseName: 'coffee',
			tld: 'co.uk',
			fullDomain: 'coffee.co.uk',
		} );
	} );

	it( 'rejects a bare TLD and a TLD that is not in the list', () => {
		expect( detectFqdn( 'co.uk', TLDS ).isFqdn ).toBe( false );
		expect( detectFqdn( '.com', TLDS ).baseName ).toBe( '' );
		expect( detectFqdn( 'com', TLDS ).baseName ).toBe( 'com' );
		expect( detectFqdn( 'coffee.notatld', TLDS ).isFqdn ).toBe( false );
	} );

	it( 'joins the labels of input with an unrecognised ending into one name', () => {
		expect( detectFqdn( 'icecream.d', TLDS ) ).toEqual( {
			isFqdn: false,
			baseName: 'icecreamd',
			tld: '',
			fullDomain: '',
			unknownEnding: 'd',
		} );
		expect( detectFqdn( 'icecream.co.u', TLDS ) ).toMatchObject( {
			baseName: 'icecreamcou',
			unknownEnding: 'u',
		} );
	} );

	it( 'judges no ending before the TLD list has arrived', () => {
		expect( detectFqdn( 'icecream.d', [] ).unknownEnding ).toBeUndefined();
		expect( detectFqdn( 'icecream.net', [] ).unknownEnding ).toBeUndefined();
	} );

	it( 'ignores empty labels and characters a domain cannot hold', () => {
		expect( detectFqdn( 'coffee.com.', TLDS ) ).toMatchObject( { fullDomain: 'coffee.com' } );
		expect( detectFqdn( 'coffee..com', TLDS ) ).toMatchObject( { fullDomain: 'coffee.com' } );
		expect( detectFqdn( 'ice_cream.com', TLDS ) ).toMatchObject( { fullDomain: 'icecream.com' } );
		expect( detectFqdn( 'coffee.', TLDS ) ).toEqual( {
			isFqdn: false,
			baseName: 'coffee',
			tld: '',
			fullDomain: '',
		} );
	} );

	it( 'searches the root domain of a subdomain', () => {
		expect( detectFqdn( 'shop.icecream.com', TLDS ) ).toEqual( {
			isFqdn: true,
			baseName: 'icecream',
			tld: 'com',
			fullDomain: 'icecream.com',
			subdomain: 'shop',
		} );
		expect( detectFqdn( 'a.shop.icecream.co.uk', TLDS ) ).toMatchObject( {
			fullDomain: 'icecream.co.uk',
			subdomain: 'a.shop',
		} );
	} );

	it( 'reports a free WordPress.com subdomain and keeps its label', () => {
		expect( detectFqdn( 'mysite.wordpress.com', TLDS ) ).toEqual( {
			isFqdn: false,
			baseName: 'mysite',
			tld: '',
			fullDomain: '',
			isFreeSubdomain: true,
		} );
	} );

	it( 'reports a free .blog subdomain', () => {
		expect( detectFqdn( 'mysite.tech.blog', TLDS ) ).toMatchObject( {
			isFqdn: false,
			baseName: 'mysite',
			isFreeSubdomain: true,
		} );
	} );

	it( 'treats wordpress.com itself as an ordinary FQDN, leaving the verdict to the backend', () => {
		expect( detectFqdn( 'wordpress.com', TLDS ) ).toEqual( {
			isFqdn: true,
			baseName: 'wordpress',
			tld: 'com',
			fullDomain: 'wordpress.com',
		} );
	} );

	it( 'leaves a plain FQDN and a plain name without details', () => {
		expect( detectFqdn( 'coffee.co.uk', TLDS ) ).toEqual( {
			isFqdn: true,
			baseName: 'coffee',
			tld: 'co.uk',
			fullDomain: 'coffee.co.uk',
		} );
		expect( detectFqdn( 'coffee', TLDS ) ).toEqual( {
			isFqdn: false,
			baseName: 'coffee',
			tld: '',
			fullDomain: '',
		} );
	} );
} );

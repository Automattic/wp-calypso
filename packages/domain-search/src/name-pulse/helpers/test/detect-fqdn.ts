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
		expect( detectFqdn( 'coffee.notatld', TLDS ).isFqdn ).toBe( false );
	} );

	it( 'reports an unrecognised ending and falls back to the label before it', () => {
		expect( detectFqdn( 'icecream.d', TLDS ) ).toEqual( {
			isFqdn: false,
			baseName: 'icecream',
			tld: '',
			fullDomain: '',
			issue: { type: 'unknown-tld', ending: 'd' },
		} );
	} );

	it( 'judges no ending before the TLD list has arrived', () => {
		expect( detectFqdn( 'icecream.d', [] ).issue ).toBeUndefined();
		expect( detectFqdn( 'icecream.net', [] ).issue ).toBeUndefined();
	} );

	it( 'searches the root domain of a subdomain', () => {
		expect( detectFqdn( 'shop.icecream.com', TLDS ) ).toEqual( {
			isFqdn: true,
			baseName: 'icecream',
			tld: 'com',
			fullDomain: 'icecream.com',
			issue: { type: 'subdomain', rootDomain: 'icecream.com' },
		} );
	} );

	it( 'reports a free WordPress.com subdomain and keeps its label', () => {
		expect( detectFqdn( 'mysite.wordpress.com', TLDS ) ).toEqual( {
			isFqdn: false,
			baseName: 'mysite',
			tld: '',
			fullDomain: '',
			issue: { type: 'free-subdomain' },
		} );
	} );

	it( 'reports a free .blog subdomain', () => {
		expect( detectFqdn( 'mysite.tech.blog', TLDS ) ).toMatchObject( {
			isFqdn: false,
			baseName: 'mysite',
			issue: { type: 'free-subdomain' },
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

	it( 'leaves a plain FQDN and a plain name free of issues', () => {
		expect( detectFqdn( 'coffee.co.uk', TLDS ).issue ).toBeUndefined();
		expect( detectFqdn( 'coffee', TLDS ).issue ).toBeUndefined();
	} );
} );

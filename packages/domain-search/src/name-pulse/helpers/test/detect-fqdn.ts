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
} );

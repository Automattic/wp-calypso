import { isCustomDomainEmail } from '../email-utils';

describe( 'isCustomDomainEmail', () => {
	test( 'returns false for well-known free providers', () => {
		expect( isCustomDomainEmail( 'jane@gmail.com' ) ).toBe( false );
		expect( isCustomDomainEmail( 'jane@outlook.com' ) ).toBe( false );
		expect( isCustomDomainEmail( 'jane@icloud.com' ) ).toBe( false );
		expect( isCustomDomainEmail( 'jane@proton.me' ) ).toBe( false );
	} );

	test( 'is case-insensitive on the domain', () => {
		expect( isCustomDomainEmail( 'jane@GMAIL.COM' ) ).toBe( false );
	} );

	test( 'returns true for custom domains', () => {
		expect( isCustomDomainEmail( 'jane@mycustomdomain.com' ) ).toBe( true );
		expect( isCustomDomainEmail( 'jane@example.org' ) ).toBe( true );
	} );

	test( 'treats a subdomain of a free provider as custom', () => {
		expect( isCustomDomainEmail( 'jane@mail.gmail.com' ) ).toBe( true );
	} );

	test( 'returns false when there is no parseable domain', () => {
		expect( isCustomDomainEmail( 'jane' ) ).toBe( false );
		expect( isCustomDomainEmail( 'jane@' ) ).toBe( false );
		expect( isCustomDomainEmail( '' ) ).toBe( false );
	} );
} );

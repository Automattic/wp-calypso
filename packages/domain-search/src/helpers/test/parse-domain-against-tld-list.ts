import { parseDomainAgainstTldList } from '..';

describe( 'parseDomainAgainstTldList', () => {
	const tldList = [ 'co.in', 'co.uk' ];

	test( 'should return an empty string if domain fragment is missing', () => {
		expect( parseDomainAgainstTldList( '', tldList ) ).toEqual( '' );
	} );

	test( 'should return an empty string if the TLD is not a known one', () => {
		expect( parseDomainAgainstTldList( 'example.co.yz', tldList ) ).toEqual( '' );
	} );

	test( 'should return domain fragment if it exists in the list of known TLDs', () => {
		expect( parseDomainAgainstTldList( 'co.uk', tldList ) ).toEqual( 'co.uk' );
	} );

	test( 'should return the right multi-level TLD with a subdomain', () => {
		expect( parseDomainAgainstTldList( 'example.co.uk', tldList ) ).toEqual( 'co.uk' );
	} );

	test( 'should return the right multi-level TLD with a sub-subdomain', () => {
		expect( parseDomainAgainstTldList( 'test.example.co.uk', tldList ) ).toEqual( 'co.uk' );
	} );
} );

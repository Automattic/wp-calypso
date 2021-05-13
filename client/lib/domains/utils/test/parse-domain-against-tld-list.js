/**
 * Internal dependencies
 */
import { parseDomainAgainstTldList } from '../';

describe( 'parseDomainAgainstTldList', () => {
	const tldList = {
		'co.in': 1,
		'co.uk': 1,
	};

	test( 'should return an empty string if domain fragment is missing', () => {
		expect( parseDomainAgainstTldList( '', tldList ) ).toEqual( '' );
	} );

	test( 'should return an empty string if the tld is not a known one', () => {
		expect( parseDomainAgainstTldList( 'example.co.yz', tldList ) ).toEqual( '' );
	} );

	test( 'should return domain fragment if it exists in the list of known tlds', () => {
		expect( parseDomainAgainstTldList( 'co.uk', tldList ) ).toEqual( 'co.uk' );
	} );

	test( 'should return the right multi-level tld with a subdomain', () => {
		expect( parseDomainAgainstTldList( 'example.co.uk', tldList ) ).toEqual( 'co.uk' );
	} );

	test( 'should return the right multi-level tld with a sub-subdomain', () => {
		expect( parseDomainAgainstTldList( 'test.example.co.uk', tldList ) ).toEqual( 'co.uk' );
	} );
} );

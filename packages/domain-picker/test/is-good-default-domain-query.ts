/**
 * Internal dependencies
 */
import { isGoodDefaultDomainQuery } from '../src/utils';

describe( 'isValidDomainQuery', () => {
	it( 'rejects empty queries', () => {
		expect( isGoodDefaultDomainQuery( '' ) ).toBe( false );
	} );

	it( 'accepts an English domain name', () => {
		expect( isGoodDefaultDomainQuery( 'example.com' ) ).toBe( true );
	} );

	it( 'accepts an uppercase English domain name', () => {
		expect( isGoodDefaultDomainQuery( 'EXAMPLE.COM' ) ).toBe( true );
	} );

	it( 'accepts a query with only letters that have diacritics that the server will strip', () => {
		expect( isGoodDefaultDomainQuery( 'Ďîàçŕïţíćś' ) ).toBe( true );
	} );

	it( 'accepts all "latin" characters with one letter having a diacritic', () => {
		expect( isGoodDefaultDomainQuery( 'tohutō' ) ).toBe( true );
	} );

	it( 'rejects query with all Arabic characters', () => {
		expect( isGoodDefaultDomainQuery( 'الأبجدية' ) ).toBe( false );
	} );

	it( 'accepts a query with half latin and half Arabic characters', () => {
		expect( isGoodDefaultDomainQuery( 'half english and half عربى' ) ).toBe( true );
	} );

	it( 'rejects emoji', () => {
		expect( isGoodDefaultDomainQuery( '🐢' ) ).toBe( false );
	} );
} );

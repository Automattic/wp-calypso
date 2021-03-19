/**
 * Internal dependencies
 */
import { isGoodDefaultDomainQuery } from '../';

describe( 'isGoodDefaultDomainQuery', () => {
	it( 'should reject empty queries', () => {
		expect( isGoodDefaultDomainQuery( '' ) ).toBe( false );
	} );

	it( 'should accept an English domain name', () => {
		expect( isGoodDefaultDomainQuery( 'example.com' ) ).toBe( true );
	} );

	it( 'should accept an uppercase English domain name', () => {
		expect( isGoodDefaultDomainQuery( 'EXAMPLE.COM' ) ).toBe( true );
	} );

	it( 'should accept a query with only letters that have diacritics that the server will strip', () => {
		expect( isGoodDefaultDomainQuery( 'Ďîàçŕïţíćś' ) ).toBe( true );
	} );

	it( 'should accept all "latin" characters with one letter having a diacritic', () => {
		expect( isGoodDefaultDomainQuery( 'tohutō' ) ).toBe( true );
	} );

	it( 'should reject query with all Arabic characters', () => {
		expect( isGoodDefaultDomainQuery( 'الأبجدية' ) ).toBe( false );
	} );

	it( 'should accept a query with half latin and half Arabic characters', () => {
		expect( isGoodDefaultDomainQuery( 'half english and half عربى' ) ).toBe( true );
	} );

	it( 'should rejects emojis', () => {
		expect( isGoodDefaultDomainQuery( '🐢' ) ).toBe( false );
	} );

	it( 'should reject queries composed only of special characters', () => {
		expect( isGoodDefaultDomainQuery( '<?!==="@$%' ) ).toBe( false );
	} );

	it( 'should accept queries composed partially of special characters', () => {
		expect( isGoodDefaultDomainQuery( '<?!===latin"@$%' ) ).toBe( true );
	} );
} );

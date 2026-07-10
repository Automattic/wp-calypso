/**
 * @jest-environment jsdom
 */
import { getContactFormFields } from '../contact-form-fields';
import type { CountryListItem } from '../custom-form-fieldsets/types';

const asyncValidator = async () => ( { success: true as const } );

// Mirrors the shape returned by the supported-countries endpoint: the popular
// countries are repeated at the top of the list and an empty-code separator sits
// between them and the full alphabetical list.
const countryList = [
	{ code: 'US', name: 'United States' },
	{ code: 'FR', name: 'France' },
	{ code: '', name: '' },
	{ code: 'AF', name: 'Afghanistan' },
	{ code: 'FR', name: 'France' },
	{ code: 'US', name: 'United States' },
] as CountryListItem[];

describe( 'getContactFormFields country field', () => {
	const getCountryField = () => {
		const fields = getContactFormFields( countryList, [], 'US', asyncValidator );
		const field = fields.find( ( f ) => f.id === 'countryCode' );
		if ( ! field ) {
			throw new Error( 'countryCode field not found' );
		}
		return field;
	};

	it( 'excludes the empty-code separator entry', () => {
		const values = ( getCountryField().elements ?? [] ).map( ( e ) => e.value );
		expect( values ).not.toContain( '' );
	} );

	it( 'lists each country code only once', () => {
		const values = ( getCountryField().elements ?? [] ).map( ( e ) => e.value );
		expect( values ).toEqual( [ ...new Set( values ) ] );
		expect( values ).toEqual( [ 'US', 'FR', 'AF' ] );
	} );
} );

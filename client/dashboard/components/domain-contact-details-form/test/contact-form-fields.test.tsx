/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { useMemo, useState } from 'react';
import { render } from '../../../test-utils';
import { getContactFormFields } from '../contact-form-fields';
import type { AsyncValidator } from '../contact-validation-utils';
import type { CountryListItem } from '../custom-form-fieldsets/types';
import type { DomainContactDetails } from '@automattic/api-core';

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

// ComboboxControl scrolls the highlighted option into view; jsdom doesn't implement it.
Element.prototype.scrollIntoView = jest.fn();

// +1 is shared by the Bahamas, the US and Canada. The Bahamas is first so it is
// the plain-first-match fallback; the address country disambiguates the seed.
const SMS_COUNTRY_CODES = [
	{ code: 'BS', country_name: 'Bahamas', name: 'Bahamas (+1)', numeric_code: '+1' },
	{ code: 'US', country_name: 'United States', name: 'United States (+1)', numeric_code: '+1' },
	{ code: 'CA', country_name: 'Canada', name: 'Canada (+1)', numeric_code: '+1' },
];

const alwaysValid: AsyncValidator = () => Promise.resolve( { success: true, messages: {} } );

/**
 * Renders the phone field's Edit control the way DataForm would. The address
 * country lives on the form item (`data.countryCode`), and the optional button
 * changes it from within the provider-wrapped tree (the test renderer's rerender
 * would not re-wrap the element in the QueryClientProvider). The phone Edit is a
 * stable component, so changing the address re-renders it without remounting —
 * exactly what the real memoized form does.
 */
function PhoneField( { addressButtons = [] }: { addressButtons?: string[] } ) {
	// The address country passed here is unused by the phone field (it reads the
	// item's countryCode); it only feeds the other, unrendered address fields.
	const phoneField = useMemo(
		() =>
			getContactFormFields( [], [], '', alwaysValid ).find( ( field ) => field.id === 'phone' )!,
		[]
	);
	const Edit = phoneField.Edit as React.ComponentType< {
		field: typeof phoneField & { getValue: ( args: { item: DomainContactDetails } ) => string };
		data: DomainContactDetails;
		onChange: ( edits: Partial< DomainContactDetails > ) => void;
	} >;

	const [ data, setData ] = useState(
		() => ( { phone: '+1.5551234', countryCode: 'US' } ) as DomainContactDetails
	);

	return (
		<>
			{ addressButtons.map( ( code ) => (
				<button
					key={ code }
					onClick={ () => setData( ( prev ) => ( { ...prev, countryCode: code } ) ) }
				>
					{ `address ${ code }` }
				</button>
			) ) }
			<Edit
				field={ { ...phoneField, getValue: ( { item } ) => item.phone ?? '' } }
				data={ data }
				onChange={ ( edits ) => setData( ( prev ) => ( { ...prev, ...edits } ) ) }
			/>
		</>
	);
}

async function pickCountry( user: ReturnType< typeof userEvent.setup >, optionName: string ) {
	await user.click( screen.getByRole( 'combobox', { name: 'Country code' } ) );
	await user.click( await screen.findByRole( 'option', { name: optionName } ) );
}

describe( 'contact form phone field', () => {
	beforeEach( () => {
		nock( 'https://public-api.wordpress.com:443' )
			.get( '/rest/v1.1/meta/sms-country-codes/' )
			.reply( 200, SMS_COUNTRY_CODES )
			.persist();
	} );

	afterEach( () => {
		nock.cleanAll();
	} );

	test( 'seeds the country from the address on load and keeps a manual pick', async () => {
		const user = userEvent.setup();

		// The +1 number seeds to the US address country, not the first +1 entry.
		render( <PhoneField /> );

		const countryCode = await screen.findByRole( 'combobox', { name: 'Country code' } );
		await waitFor( () => expect( countryCode ).toHaveValue( 'United States (+1)' ) );

		// Pick Canada — another +1 country — and confirm it sticks.
		await pickCountry( user, 'Canada (+1)' );
		await waitFor( () => expect( countryCode ).toHaveValue( 'Canada (+1)' ) );
	} );

	test( 'does not change the phone country when the address country changes', async () => {
		const user = userEvent.setup();

		render( <PhoneField addressButtons={ [ 'DE', 'US' ] } /> );

		// Re-query the combobox each time in case a re-render replaces the node.
		const combo = () => screen.getByRole( 'combobox', { name: 'Country code' } );

		await screen.findByRole( 'combobox', { name: 'Country code' } );
		await waitFor( () => expect( combo() ).toHaveValue( 'United States (+1)' ) );

		// Changing the address country must not move the phone country, even
		// before the contact has explicitly picked one.
		await user.click( screen.getByRole( 'button', { name: 'address DE' } ) );
		await waitFor( () => expect( combo() ).toHaveValue( 'United States (+1)' ) );

		// An explicit pick wins...
		await pickCountry( user, 'Canada (+1)' );
		await waitFor( () => expect( combo() ).toHaveValue( 'Canada (+1)' ) );

		// ...and a later address change still does not move it.
		await user.click( screen.getByRole( 'button', { name: 'address US' } ) );
		await waitFor( () => expect( combo() ).toHaveValue( 'Canada (+1)' ) );
	} );
} );

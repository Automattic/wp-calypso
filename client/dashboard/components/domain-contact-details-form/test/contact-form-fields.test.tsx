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
// the plain-first-match fallback; the address country disambiguates the default.
const SMS_COUNTRY_CODES = [
	{ code: 'BS', country_name: 'Bahamas', name: 'Bahamas (+1)', numeric_code: '+1' },
	{ code: 'US', country_name: 'United States', name: 'United States (+1)', numeric_code: '+1' },
	{ code: 'CA', country_name: 'Canada', name: 'Canada (+1)', numeric_code: '+1' },
];

const alwaysValid: AsyncValidator = () => Promise.resolve( { success: true, messages: {} } );

/**
 * Renders the phone field's Edit control the way DataForm would, with the
 * contact's address country held in state (the real form memoizes the fields on
 * it, so the phone Edit keeps a stable identity while the address is unchanged
 * and remounts when it changes). The optional button changes the address
 * country from within the provider-wrapped tree, since the test renderer's
 * rerender does not re-wrap the element in the QueryClientProvider.
 */
function PhoneField( {
	initialAddressCountry,
	nextAddressCountry,
}: {
	initialAddressCountry: string;
	nextAddressCountry?: string;
} ) {
	const [ addressCountry, setAddressCountry ] = useState( initialAddressCountry );
	const phoneField = useMemo(
		() =>
			getContactFormFields( [], [], addressCountry, alwaysValid ).find(
				( field ) => field.id === 'phone'
			)!,
		[ addressCountry ]
	);
	const Edit = phoneField.Edit as React.ComponentType< {
		field: typeof phoneField & { getValue: ( args: { item: DomainContactDetails } ) => string };
		data: DomainContactDetails;
		onChange: ( edits: Partial< DomainContactDetails > ) => void;
	} >;

	const [ data, setData ] = useState( { phone: '+1.5551234' } as DomainContactDetails );

	return (
		<>
			{ nextAddressCountry && (
				<button onClick={ () => setAddressCountry( nextAddressCountry ) }>change address</button>
			) }
			<Edit
				field={ { ...phoneField, getValue: ( { item } ) => item.phone ?? '' } }
				data={ data }
				onChange={ ( edits ) => setData( ( prev ) => ( { ...prev, ...edits } ) ) }
			/>
		</>
	);
}

async function pickCountry( user: ReturnType< typeof userEvent.setup >, optionName: string ) {
	const countryCode = screen.getByRole( 'combobox', { name: 'Country code' } );
	await user.click( countryCode );
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

	test( 'keeps a manually picked country that shares its dialing code with the address country', async () => {
		const user = userEvent.setup();

		// Address country is the US, so the +1 phone defaults to United States.
		render( <PhoneField initialAddressCountry="US" /> );

		const countryCode = await screen.findByRole( 'combobox', { name: 'Country code' } );
		await waitFor( () => expect( countryCode ).toHaveValue( 'United States (+1)' ) );

		// Pick Canada — another +1 country that is not the address country — and
		// confirm it sticks instead of snapping back to the US address country.
		await pickCountry( user, 'Canada (+1)' );
		await waitFor( () => expect( countryCode ).toHaveValue( 'Canada (+1)' ) );
	} );

	test( 'a manual pick after an address change re-seeds and then sticks again', async () => {
		const user = userEvent.setup();

		render( <PhoneField initialAddressCountry="US" nextAddressCountry="DE" /> );

		// Re-query the combobox on each check: the address change remounts the
		// field, so a reference captured earlier would point at a detached node.
		const combo = () => screen.getByRole( 'combobox', { name: 'Country code' } );

		await screen.findByRole( 'combobox', { name: 'Country code' } );
		await waitFor( () => expect( combo() ).toHaveValue( 'United States (+1)' ) );

		await pickCountry( user, 'Canada (+1)' );
		await waitFor( () => expect( combo() ).toHaveValue( 'Canada (+1)' ) );

		// Changing the address country remounts the field and re-seeds the
		// default. The stored dialing code is still +1, so with no matching
		// address entry it falls back to the first +1 country (the Bahamas).
		await user.click( screen.getByRole( 'button', { name: 'change address' } ) );
		await waitFor( () => expect( combo() ).toHaveValue( 'Bahamas (+1)' ) );

		// A fresh manual pick after the reset is captured and sticks.
		await pickCountry( user, 'Canada (+1)' );
		await waitFor( () => expect( combo() ).toHaveValue( 'Canada (+1)' ) );
	} );
} );

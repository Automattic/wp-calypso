/**
 * @jest-environment jsdom
 */

import { checkoutTheme } from '@automattic/composite-checkout';
import { ThemeProvider } from '@emotion/react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { ManagedContactDetailsFormFields } from '../managed-contact-details-form-fields';

jest.mock( 'calypso/components/data/query-countries/domains', () => () => null );
jest.mock( 'calypso/components/data/query-country-states', () => () => null );
jest.mock( 'calypso/components/forms/form-phone-media-input', () => () => null );

const countriesList = [
	{ code: 'GB', name: 'United Kingdom', has_postal_codes: true },
	{ code: 'CA', name: 'Canada', has_postal_codes: true },
	{ code: 'US', name: 'United States', has_postal_codes: true },
];

function renderForm( contactDetails = {} ) {
	const onContactDetailsChange = jest.fn();

	function Form() {
		const [ details, setDetails ] = useState( {
			...ManagedContactDetailsFormFields.defaultProps.contactDetails,
			countryCode: 'GB',
			email: 'test@example.com',
			...contactDetails,
		} );

		return (
			<ManagedContactDetailsFormFields
				contactDetails={ details }
				contactDetailsErrors={ {} }
				onContactDetailsChange={ ( updatedDetails ) => {
					onContactDetailsChange( updatedDetails );
					setDetails( updatedDetails );
				} }
				countryCode={ details.countryCode }
				countriesList={ countriesList }
				hasCountryStates={ false }
				userEmail="test@example.com"
				translate={ ( text ) => text }
			/>
		);
	}

	renderWithProvider(
		<ThemeProvider theme={ checkoutTheme }>
			<Form />
		</ThemeProvider>
	);
	return { user: userEvent.setup(), onContactDetailsChange };
}

describe( 'ManagedContactDetailsFormFields', () => {
	it.each( [
		[ 'GB', 'sw1a1aa', 'SW1A 1AA' ],
		[ 'GB', ' sw1a 1aa ', 'SW1A 1AA' ],
		[ 'GB', 'SW1A 1AA', 'SW1A 1AA' ],
		[ 'CA', 'k1a0b1', 'K1A 0B1' ],
		[ 'CA', ' k1a 0b1 ', 'K1A 0B1' ],
		[ 'US', '123456789', '12345-6789' ],
		[ 'US', '90210', '90210' ],
		[ 'GB', '', '' ],
		[ 'GB', '   ', '' ],
	] )( 'formats %s postal code "%s" as "%s" on blur', async ( countryCode, input, expected ) => {
		const { user, onContactDetailsChange } = renderForm( { countryCode } );
		const postalCode = screen.getByRole( 'textbox', { name: /postal code|zip code/i } );

		await user.click( postalCode );
		if ( input ) {
			await user.type( postalCode, input );
		}
		onContactDetailsChange.mockClear();
		await user.tab();

		expect( postalCode ).toHaveValue( expected );
		expect( onContactDetailsChange ).toHaveBeenCalledTimes( 1 );
		expect( onContactDetailsChange ).toHaveBeenLastCalledWith(
			expect.objectContaining( { postalCode: expected, countryCode } )
		);
	} );

	it( 'keeps the formatted postal code when trimming another contact field', async () => {
		const { user, onContactDetailsChange } = renderForm( {
			postalCode: 'sw1a1aa',
			city: ' London ',
			firstName: 'Ada',
			extra: { uk: { registrant_type: 'IND' } },
		} );

		await user.click( screen.getByRole( 'textbox', { name: /^city$/i } ) );
		await user.tab();

		expect( screen.getByRole( 'textbox', { name: /postal code/i } ) ).toHaveValue( 'SW1A 1AA' );
		expect( screen.getByRole( 'textbox', { name: /^city$/i } ) ).toHaveValue( 'London' );
		expect( onContactDetailsChange ).toHaveBeenCalledTimes( 1 );
		expect( onContactDetailsChange ).toHaveBeenLastCalledWith(
			expect.objectContaining( {
				postalCode: 'SW1A 1AA',
				city: 'London',
				firstName: 'Ada',
				extra: { uk: { registrant_type: 'IND' } },
			} )
		);
	} );
} );

/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import PhoneInput from 'calypso/components/phone-input';
import type { CountryListItem } from '@automattic/wpcom-checkout';
import type { PhoneInputValue } from 'calypso/components/phone-input';

const countriesList: CountryListItem[] = [
	{ code: 'US', name: 'United States', has_postal_codes: true, vat_supported: false },
	{ code: 'AL', name: 'Albania', has_postal_codes: true, vat_supported: false },
	{ code: 'BR', name: 'Brazil', has_postal_codes: true, vat_supported: false },
];

function TestPhoneInput( {
	enableStickyCountry,
	initialCountryCode = 'US',
}: {
	enableStickyCountry?: boolean;
	initialCountryCode?: string;
} ) {
	const [ value, setValue ] = useState< PhoneInputValue >( {
		phoneNumber: '',
		countryCode: initialCountryCode,
	} );
	return (
		<>
			<PhoneInput
				countriesList={ countriesList }
				enableStickyCountry={ enableStickyCountry }
				onChange={ setValue }
				value={ value }
			/>
			<span data-testid="country-code">{ value.countryCode }</span>
			<span data-testid="phone-number">{ value.phoneNumber }</span>
		</>
	);
}

describe( 'PhoneInput', () => {
	it( 'guesses the country from a dialing code typed by the user', async () => {
		const user = userEvent.setup();
		render( <TestPhoneInput enableStickyCountry={ false } /> );

		await user.type( screen.getByRole( 'textbox' ), '+355691234567' );

		expect( screen.getByTestId( 'country-code' ) ).toHaveTextContent( 'AL' );
		expect( screen.getByTestId( 'phone-number' ) ).toHaveTextContent( '+355 69 123 4567' );
	} );

	it( 'does not overwrite a typed dialing code with the selected country dialing code', async () => {
		const user = userEvent.setup();
		render( <TestPhoneInput enableStickyCountry={ false } initialCountryCode="BR" /> );

		await user.type( screen.getByRole( 'textbox' ), '+12345678901' );

		expect( screen.getByTestId( 'country-code' ) ).toHaveTextContent( 'US' );
		expect( screen.getByTestId( 'phone-number' ) ).not.toHaveTextContent( '+55' );
	} );

	it( 'keeps the selected country when sticky country is enabled', async () => {
		const user = userEvent.setup();
		render( <TestPhoneInput enableStickyCountry /> );

		await user.type( screen.getByRole( 'textbox' ), '+355691234567' );

		expect( screen.getByTestId( 'country-code' ) ).toHaveTextContent( 'US' );
	} );
} );

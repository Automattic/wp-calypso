/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import PhoneNumberInput, { type SecuritySMSNumber } from '../index';

// ComboboxControl scrolls the highlighted option into view; jsdom doesn't implement it.
Element.prototype.scrollIntoView = jest.fn();

const SMS_COUNTRY_CODES = [
	{ code: 'US', country_name: 'United States', name: 'United States (+1)', numeric_code: '+1' },
	{ code: 'DE', country_name: 'Germany', name: 'Germany (+49)', numeric_code: '+49' },
];

const emptyData: SecuritySMSNumber = {
	phoneNumber: '',
	countryCode: '',
	countryNumericCode: '',
};

describe( '<PhoneNumberInput>', () => {
	test( 'lets the user filter the country code list by typing and reports the selection', async () => {
		nock( 'https://public-api.wordpress.com:443' )
			.get( '/rest/v1.1/meta/sms-country-codes/' )
			.reply( 200, SMS_COUNTRY_CODES );
		const user = userEvent.setup();
		const onChange = jest.fn();

		render( <PhoneNumberInput data={ emptyData } onChange={ onChange } /> );

		const countryCode = await screen.findByRole( 'combobox', { name: 'Country code' } );
		await user.type( countryCode, 'Germany' );

		// Typing filters out the non-matching country, leaving only the match selectable.
		expect(
			screen.queryByRole( 'option', { name: 'United States (+1)' } )
		).not.toBeInTheDocument();
		await user.click( screen.getByRole( 'option', { name: 'Germany (+49)' } ) );

		expect( onChange ).toHaveBeenCalledWith(
			expect.objectContaining( { countryCode: 'DE', countryNumericCode: '+49' } )
		);
	} );
} );

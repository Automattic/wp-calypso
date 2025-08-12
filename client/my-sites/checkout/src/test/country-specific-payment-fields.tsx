/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { renderWithProvider as render } from 'calypso/test-helpers/testing-library';
import { CountrySpecificPaymentFieldsUnstyled as CountrySpecificPaymentFields } from '../components/country-specific-payment-fields';
import type { CountrySpecificPaymentFieldsProps } from '../components/country-specific-payment-fields';

const defaultProps: CountrySpecificPaymentFieldsProps = {
	countryCode: 'BR',
	countriesList: [
		{
			code: 'BR',
			name: 'Brazil',
			has_postal_codes: true,
			vat_supported: false,
		},
	],
	getErrorMessages: jest.fn().mockReturnValue( [] ),
	getFieldValue: jest.fn().mockReturnValue( '' ),
	handleFieldChange: jest.fn(),
};

describe( '<CountrySpecificPaymentFields />', () => {
	test( 'should call this.props.handleFieldChange when updating field', async () => {
		const user = userEvent.setup();

		const WrappedCountrySpecificPaymentFields = ( props ) => {
			const [ fields, setFields ] = useState( {} );

			props.getFieldValue.mockImplementation( ( name ) => {
				return fields[ name ] ?? '';
			} );

			props.handleFieldChange.mockImplementation( ( name, value ) => {
				setFields( { ...fields, [ name ]: value } );
			} );

			return <CountrySpecificPaymentFields { ...props } />;
		};

		render( <WrappedCountrySpecificPaymentFields { ...defaultProps } /> );

		const box = screen.getByRole( 'textbox', { name: /taxpayer identification number/i } );
		await user.type( box, 'spam' );

		expect( defaultProps.handleFieldChange ).toHaveBeenCalledWith( 'document', 'spam' );
	} );

	test( 'should disable fields', () => {
		const { rerender } = render( <CountrySpecificPaymentFields { ...defaultProps } /> );

		const fields = screen.getAllByRole( 'textbox' );
		fields.forEach( ( field ) => expect( field ).not.toBeDisabled() );

		rerender( <CountrySpecificPaymentFields { ...defaultProps } disableFields /> );
		fields.forEach( ( field ) => expect( field ).toBeDisabled() );
	} );
} );

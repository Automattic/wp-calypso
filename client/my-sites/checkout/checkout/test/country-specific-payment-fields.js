/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { renderWithProvider as render } from 'calypso/test-helpers/testing-library';
import { CountrySpecificPaymentFields } from '../country-specific-payment-fields';

const defaultProps = {
	countryCode: 'BR',
	countriesList: [
		{
			code: 'BR',
			name: 'Brazil',
		},
	],
	getErrorMessage: jest.fn(),
	getFieldValue: jest.fn(),
	handleFieldChange: jest.fn(),
	fieldClassName: 'country-brazil',
	translate: ( string ) => string,
};

describe( '<CountrySpecificPaymentFields />', () => {
	test( 'should call this.props.handleFieldChange when updating field', async () => {
		const user = userEvent.setup();

		const WrappedCountrySpecificPaymentFields = ( props ) => {
			const [ fields, setFields ] = useState( {} );

			props.getFieldValue.mockImplementation( ( name ) => {
				return fields[ name ];
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

		const [ input ] = screen.getAllByRole( 'textbox' );
		expect( input ).not.toBeDisabled();

		rerender( <CountrySpecificPaymentFields { ...defaultProps } disableFields /> );
		expect( input ).toBeDisabled();
	} );
} );

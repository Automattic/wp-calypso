/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { FormPhoneInput } from '../';

const countriesList = [
	{
		code: 'US',
		name: 'United States (+1)',
		numeric_code: '+1',
		country_name: 'United States',
	},
	{
		code: 'AR',
		name: 'Argentina (+54)',
		numeric_code: '+54',
		country_name: 'Argentina',
	},
];

describe( 'FormPhoneInput', () => {
	const localizeProps = { translate: ( string ) => string };

	describe( 'getValue()', () => {
		test( 'should set country from props', () => {
			render(
				<FormPhoneInput
					countriesList={ countriesList }
					initialCountryCode={ countriesList[ 1 ].code }
					{ ...localizeProps }
				/>
			);

			const option = screen.getByRole( 'option', { selected: true } );

			expect( option.textContent ).toBe( countriesList[ 1 ].name );
		} );

		test( 'should set country to first element when not specified', () => {
			render( <FormPhoneInput countriesList={ countriesList } { ...localizeProps } /> );

			const option = screen.getByRole( 'option', { selected: true } );

			expect( option.textContent ).toBe( countriesList[ 0 ].name );
		} );

		test( 'should update country on change', () => {
			const onChange = jest.fn();
			const { container } = render(
				<FormPhoneInput
					onChange={ onChange }
					countriesList={ countriesList }
					{ ...localizeProps }
				/>
			);

			const [ select ] = container.getElementsByClassName( 'form-country-select' );

			fireEvent.change( select, { target: { value: countriesList[ 1 ].code } } );

			expect( onChange ).toHaveBeenCalledWith(
				expect.objectContaining( { countryData: countriesList[ 1 ] } )
			);
		} );

		test( 'should have no country with empty countryList', () => {
			render( <FormPhoneInput countriesList={ [] } { ...localizeProps } /> );

			const option = screen.getByRole( 'option', { selected: true } );

			expect( option.textContent ).toBe( 'Loading…' );
		} );
	} );
} );

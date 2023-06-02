/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { FormCountrySelect } from 'calypso/components/forms/form-country-select';

describe( 'FormCountrySelect', () => {
	const translate = ( string ) => string;

	test( 'should render a select box with a placeholder when the country list provided is empty', () => {
		const { container } = render(
			<FormCountrySelect countriesList={ [] } translate={ translate } />
		);
		const options = container.getElementsByTagName( 'option' );

		expect( options ).toHaveLength( 1 );
		expect( options[ 0 ].textContent ).toEqual( 'Loading…' );
	} );

	test( 'should render a select box with options matching the country list provided', () => {
		const { container } = render(
			<FormCountrySelect
				countriesList={ [
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
				] }
				translate={ translate }
			/>
		);

		const options = container.getElementsByTagName( 'option' );

		expect( options ).toHaveLength( 2 );
		expect( options[ 0 ].value ).toEqual( 'US' );
		expect( options[ 0 ].textContent ).toEqual( 'United States (+1)' );
	} );
} );

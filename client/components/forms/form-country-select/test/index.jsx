/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { identity } from 'lodash';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { FormCountrySelect } from 'calypso/components/forms/form-country-select';

describe( 'FormCountrySelect', () => {
	test( 'should render a select box with a placeholder when the country list provided is empty', () => {
		const select = shallow( <FormCountrySelect countriesList={ [] } translate={ identity } /> );

		const options = select.find( 'option' );

		expect( options ).to.have.length( 1 );

		const option = options.first();

		expect( option.equals( <option>Loading…</option> ) ).to.be.true;
	} );

	test( 'should render a select box with options matching the country list provided', () => {
		const select = shallow(
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
				translate={ identity }
			/>
		);

		const options = select.find( 'option' );

		expect( options ).to.have.length( 2 );

		const option = options.first();

		expect(
			option.equals(
				<option value="US" disabled={ false }>
					United States (+1)
				</option>
			)
		).to.be.true;
	} );
} );

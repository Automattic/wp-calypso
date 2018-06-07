/** @format */

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
import CountriesList from 'components/forms/form-country-select/test/mocks/mock-countries-list';
import { FormCountrySelect } from 'components/forms/form-country-select';

describe( 'FormCountrySelect', () => {
	let countriesList;

	beforeEach( () => {
		countriesList = new CountriesList();
	} );

	test( 'should render a select box with a placeholder when the country list provided is empty', () => {
		const select = shallow( <FormCountrySelect countriesList={ countriesList } translate={ identity } /> );

		const options = select.find( 'option' );
		expect( options ).to.have.length( 1 );

		const option = options.first();
		expect( option.text() ).to.equal( 'Loading…' );
	} );

	test( 'should render a select box with options matching the country list provided', () => {
		countriesList.fetch();

		const select = shallow( <FormCountrySelect countriesList={ countriesList } translate={ identity } /> );

		const options = select.find( 'option' );
		expect( options ).to.have.length( 2 );

		const option = options.first();
		expect( option.text() ).to.equal( 'United States (+1)' );
	} );

	test( 'should react to country list changes and rerender', () => {
		countriesList.fetch();

		const component = <FormCountrySelect countriesList={ countriesList } translate={ identity } />;

		// Let's clear the list after the component was rendered
		countriesList.clear();

		const select = shallow( component );

		const options = select.find( 'option' );
		expect( options ).to.have.length( 1 );

		const option = options.first();
		expect( option.text() ).to.equal( 'Loading…' );
	} );
} );

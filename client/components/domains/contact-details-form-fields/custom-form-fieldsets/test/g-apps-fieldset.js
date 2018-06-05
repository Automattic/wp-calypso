/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import { GAppsFieldset } from '../g-apps-fieldset';

jest.mock( 'i18n-calypso', () => ( {
	localize: x => x,
	translate: x => x,
} ) );

// Gets rid of warnings such as 'UnhandledPromiseRejectionWarning: Error: No available storage method found.'
jest.mock( 'lib/user', () => () => {} );

describe( 'Google Apps Address Fieldset', () => {
	const defaultProps = {
		countriesList: [],
		getFieldProps: name => ( { value: '', name } ),
	};

	test( 'should render correctly with default props', () => {
		const wrapper = shallow( <GAppsFieldset { ...defaultProps } /> );

		expect( wrapper.find( '.g-apps-fieldset' ) ).to.have.length( 1 );
	} );

	test( 'should render only Input and CountrySelect components', () => {
		const wrapper = shallow( <GAppsFieldset { ...defaultProps } /> );

		const children = wrapper.children();

		expect( children ).to.have.length( 3 );
		expect( children.find( '[name="country-code"]' ) ).to.have.length( 1 );
		expect( children.find( '[name="postal-code"]' ) ).to.have.length( 1 );
	} );
} );

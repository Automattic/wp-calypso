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
import GAppsFieldset from '../g-apps-fieldset';

jest.mock( 'i18n-calypso', () => ( {
	localize: x => x,
} ) );

describe( 'Google Apps Address Fieldset', () => {
	const defaultProps = {
		countriesList: [ 'ES' ],
		getFieldProps: name => ( { value: '', name } ),
	};

	test( 'should render correctly with default props', () => {
		const wrapper = shallow( <GAppsFieldset { ...defaultProps } /> );
		expect( wrapper.find( '.g-apps-fieldset' ) ).to.have.length( 1 );
	} );

	test( 'should render only Input and CountrySelect components', () => {
		const wrapper = shallow( <GAppsFieldset { ...defaultProps } /> );
		expect( wrapper.children() ).to.have.length( 2 );
		expect( wrapper.find( '[name="country-code"]' ) ).to.have.length( 1 );
		expect( wrapper.find( '[name="postal-code"]' ) ).to.have.length( 1 );
	} );
} );

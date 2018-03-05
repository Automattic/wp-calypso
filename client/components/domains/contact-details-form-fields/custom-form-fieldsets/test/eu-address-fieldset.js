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
import EuAddressFieldset from '../eu-address-fieldset';

jest.mock( 'i18n-calypso', () => ( {
	localize: x => x,
} ) );

describe( 'EU Address Fieldset', () => {
	const defaultProps = {
		getFieldProps: name => ( { name, value: '' } ),
	};

	test( 'should render correctly with default props', () => {
		const wrapper = shallow( <EuAddressFieldset { ...defaultProps } /> );
		expect( wrapper.find( '.eu-address-fieldset' ) ).to.have.length( 1 );
	} );

	test( 'should render expected input components', () => {
		const wrapper = shallow( <EuAddressFieldset { ...defaultProps } /> );
		expect( wrapper.find( '[name="city"]' ) ).to.have.length( 1 );
		expect( wrapper.find( '[name="postal-code"]' ) ).to.have.length( 1 );
	} );

	test( 'should not render a state select components', () => {
		const wrapper = shallow( <EuAddressFieldset { ...defaultProps } /> );
		expect( wrapper.find( '[name="state"]' ) ).to.have.length( 0 );
	} );
} );

/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import UkAddressFieldset from '../uk-address-fieldset';

jest.mock( 'i18n-calypso', () => ( {
	localize: x => x,
	translate: x => x,
} ) );

// Gets rid of warnings such as 'UnhandledPromiseRejectionWarning: Error: No available storage method found.'
jest.mock( 'lib/user', () => () => {} );

describe( 'UK Address Fieldset', () => {
	const defaultProps = {
		getFieldProps: name => ( { name, value: '' } ),
	};

	test( 'should render correctly with default props', () => {
		const wrapper = shallow( <UkAddressFieldset { ...defaultProps } /> );
		expect( wrapper.find( '.uk-address-fieldset' ) ).toHaveLength( 1 );
	} );

	test( 'should render expected input components', () => {
		const wrapper = shallow( <UkAddressFieldset { ...defaultProps } /> );
		expect( wrapper.find( '[name="city"]' ) ).toHaveLength( 1 );
		expect( wrapper.find( '[name="postal-code"]' ) ).toHaveLength( 1 );
	} );

	test( 'should not render a state select components', () => {
		const wrapper = shallow( <UkAddressFieldset { ...defaultProps } /> );
		expect( wrapper.find( '[name="state"]' ) ).toHaveLength( 0 );
	} );
} );

/**
 * @jest-environment jsdom
 */

import { expect } from 'chai';
import { shallow } from 'enzyme';
import UkAddressFieldset from '../uk-address-fieldset';

jest.mock( 'i18n-calypso', () => ( {
	localize: ( x ) => x,
	translate: ( x ) => x,
} ) );

describe( 'UK Address Fieldset', () => {
	const defaultProps = {
		getFieldProps: ( name ) => ( { name, value: '' } ),
		translate: ( string ) => string,
	};

	const propsWithoutPostalCode = {
		...defaultProps,
		arePostalCodesSupported: false,
	};

	test( 'should render correctly with default props', () => {
		const wrapper = shallow( <UkAddressFieldset { ...defaultProps } /> );
		expect( wrapper.find( '.uk-address-fieldset' ) ).to.have.length( 1 );
	} );

	test( 'should render expected input components', () => {
		const wrapper = shallow( <UkAddressFieldset { ...defaultProps } /> );
		expect( wrapper.find( '[name="city"]' ) ).to.have.length( 1 );
		expect( wrapper.find( '[name="postal-code"]' ) ).to.have.length( 1 );
	} );

	test( 'should not render a state select components', () => {
		const wrapper = shallow( <UkAddressFieldset { ...defaultProps } /> );
		expect( wrapper.find( '[name="state"]' ) ).to.have.length( 0 );
	} );

	test( 'should render all expected input components but postal code', () => {
		const wrapper = shallow( <UkAddressFieldset { ...propsWithoutPostalCode } /> );
		expect( wrapper.find( '[name="city"]' ) ).to.have.length( 1 );
		expect( wrapper.find( '[name="postal-code"]' ) ).to.have.length( 0 );
	} );
} );

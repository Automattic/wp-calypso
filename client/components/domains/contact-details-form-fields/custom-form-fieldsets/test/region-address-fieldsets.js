/**
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
import { RegionAddressFieldsets } from '../region-address-fieldsets';
import {
	CHECKOUT_EU_ADDRESS_FORMAT_COUNTRY_CODES,
	CHECKOUT_UK_ADDRESS_FORMAT_COUNTRY_CODES,
} from '../constants';

jest.mock( 'i18n-calypso', () => ( {
	localize: ( x ) => x,
	translate: ( x ) => x,
} ) );

// Gets rid of warnings such as 'UnhandledPromiseRejectionWarning: Error: No available storage method found.'
jest.mock( 'lib/user', () => () => {} );

describe( 'Region Address Fieldsets', () => {
	const defaultProps = {
		getFieldProps: ( name ) => ( {
			value: '',
			name,
		} ),
		hasCountryStates: false,
	};

	const propsWithStates = {
		getFieldProps: ( name ) => ( {
			value: '',
			name,
		} ),
		hasCountryStates: true,
	};

	test( 'should render `<UsAddressFieldset />` with default props', () => {
		const wrapper = shallow( <RegionAddressFieldsets { ...defaultProps } /> );
		expect( wrapper.find( 'UsAddressFieldset' ) ).to.have.length( 1 );
		expect( wrapper.find( '[name="address-1"]' ) ).to.have.length( 1 );
		expect( wrapper.find( '[name="address-2"]' ) ).to.have.length( 1 );
	} );

	test( 'should render `<UkAddressFieldset />` with a UK region countryCode', () => {
		const wrapper = shallow(
			<RegionAddressFieldsets
				{ ...defaultProps }
				countryCode={ CHECKOUT_UK_ADDRESS_FORMAT_COUNTRY_CODES[ 0 ] }
			/>
		);
		expect( wrapper.find( 'UkAddressFieldset' ) ).to.have.length( 1 );
	} );

	test( 'should render `<EuAddressFieldset />` with an EU region countryCode', () => {
		const wrapper = shallow(
			<RegionAddressFieldsets
				{ ...defaultProps }
				countryCode={ CHECKOUT_EU_ADDRESS_FORMAT_COUNTRY_CODES[ 0 ] }
			/>
		);
		expect( wrapper.find( 'EuAddressFieldset' ) ).to.have.length( 1 );
	} );

	test( 'should render `<UsAddressFieldset />` with an EU region country that has states', () => {
		const wrapper = shallow(
			<RegionAddressFieldsets
				{ ...propsWithStates }
				countryCode={ CHECKOUT_EU_ADDRESS_FORMAT_COUNTRY_CODES[ 0 ] }
			/>
		);
		expect( wrapper.find( 'UsAddressFieldset' ) ).to.have.length( 1 );
		expect( wrapper.find( 'EuAddressFieldset' ) ).to.have.length( 0 );
	} );

	test( 'should render `<UsAddressFieldset />` with a UK region country that has states', () => {
		const wrapper = shallow(
			<RegionAddressFieldsets
				{ ...propsWithStates }
				countryCode={ CHECKOUT_UK_ADDRESS_FORMAT_COUNTRY_CODES[ 0 ] }
			/>
		);
		expect( wrapper.find( 'UsAddressFieldset' ) ).to.have.length( 1 );
		expect( wrapper.find( 'UkAddressFieldset' ) ).to.have.length( 0 );
	} );
} );

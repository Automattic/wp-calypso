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
import RegionAddressFieldsets from '../region-address-fieldsets';
import {
	CHECKOUT_EU_ADDRESS_FORMAT_COUNTRY_CODES,
	CHECKOUT_UK_ADDRESS_FORMAT_COUNTRY_CODES,
} from '../constants';

jest.mock( 'i18n-calypso', () => ( {
	localize: x => x,
} ) );

describe( 'Region Address Fieldsets', () => {
	const defaultProps = {
		getFieldProps: name => ( { value: '', name } ),
	};

	test( 'should render `<UsAddressFieldset />` with default props', () => {
		const wrapper = shallow( <RegionAddressFieldsets { ...defaultProps } /> );
		expect( wrapper.find( 'UsAddressFieldset' ) ).to.have.length( 1 );
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
} );

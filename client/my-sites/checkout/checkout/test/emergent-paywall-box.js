/**
 * @format
 * @jest-environment jsdom
 */
/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';
import { identity } from 'lodash';

/**
 * Internal dependencies
 */

import { EmergentPaywallBox } from '../emergent-paywall-box';

/*
jest.mock( 'lib/wp', () => ( {
	undocumented: () => ( {
		transactions: () => {},
		emergentPaywallConfiguration: () => {},
		me: () => ( {
			transactions: () => {},
			emergentPaywallConfiguration: () => {},
		} ),
	} ),
} ) );
*/

const defaultProps = {
	cart: {},
	transaction: {},
	translate: identity,
	userCountryCode: 'IN',
};

describe( '<EmergentPaywallBox />', () => {
	test( 'should render', () => {
		const wrapper = shallow( <EmergentPaywallBox { ...defaultProps } /> );
		expect( wrapper ).toMatchSnapshot();
	} );

	test( 'should display iframe and form when we assign iframe properties', () => {
		const wrapper = shallow( <EmergentPaywallBox { ...defaultProps } /> );
		expect( wrapper.find( '.iframe-loaded' ) ).toHaveLength( 0 );
		wrapper.setState( {
			hasConfigLoaded: true,
			paywall_url: 'http://bork.it',
			signature: 'signature',
			payload: 'payload',
		} );
		expect( wrapper.find( '.iframe-loaded' ) ).toHaveLength( 1 );
		expect( wrapper.find( 'input[name="payload"]' ).props().value ).toEqual( 'payload' );
		expect( wrapper.find( 'input[name="signature"]' ).props().value ).toEqual( 'signature' );
		expect( wrapper.find( 'form' ).props().action ).toEqual( 'http://bork.it' );
	} );
} );

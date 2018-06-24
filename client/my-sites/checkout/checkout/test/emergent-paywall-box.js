/**
 * @format
 * @jest-environment jsdom
 */
/**
 * External dependencies
 */
import React from 'react';
import { shallow, mount } from 'enzyme';
import { identity } from 'lodash';

/**
 * Internal dependencies
 */

import { EmergentPaywallBox } from '../emergent-paywall-box';

// Gets rid of warnings such as 'UnhandledPromiseRejectionWarning: Error: No available storage method found.'
jest.mock( 'lib/user', () => () => {} );

const defaultProps = {
	cart: {
		products: [],
	},
	transaction: {},
	iframeConfig: {},
	iframeConfigRequestState: '',
	fetchIframeConfig: jest.fn(),
	showErrorNotice: jest.fn(),
	removeNotice: jest.fn(),
	translate: identity,
	userCountryCode: 'IN',
};

describe( '<EmergentPaywallBox />', () => {
	test( 'should render', () => {
		const wrapper = shallow( <EmergentPaywallBox { ...defaultProps } /> );
		expect( wrapper ).toMatchSnapshot();
	} );

	test( 'should display iframe and form when we assign iframe properties', () => {
		const wrapper = mount( <EmergentPaywallBox { ...defaultProps } /> );
		expect( wrapper.find( '.iframe-loaded' ) ).toHaveLength( 0 );
		wrapper.setProps( {
			iframeConfig: {
				paywall_url: 'http://bork.it',
				signature: 'signature',
				payload: 'payload',
			},
			iframeConfigRequestState: 'success',
		} );
		expect( wrapper.find( '.iframe-loaded' ) ).toHaveLength( 1 );
		expect( wrapper.find( 'input[name="payload"]' ).props().value ).toEqual( 'payload' );
		expect( wrapper.find( 'input[name="signature"]' ).props().value ).toEqual( 'signature' );
		expect( wrapper.find( 'form' ).props().action ).toEqual( 'http://bork.it' );
	} );
} );

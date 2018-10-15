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
		products: [ 1 ],
		total_cost: 1,
	},
	transaction: {},
	selectedSite: {},
	iframeConfig: {
		chargeId: '',
		payload: '',
		paywallUrl: '',
		signature: '',
	},
	isIframeRequesting: false,
	iframeRequestFailed: false,
	iframeRequestSuccess: false,
	orderId: null,
	orderErrorMessage: '',
	isOrderRequesting: false,
	orderRequestFailed: false,
	orderRequestSuccess: false,
	fetchIframeConfig: jest.fn(),
	fetchOrder: jest.fn(),
	onOrderCreated: jest.fn(),
	showErrorNotice: jest.fn(),
	removeNotice: jest.fn(),
	translate: identity,
	userCountryCode: 'IN',
};

describe( '<EmergentPaywallBox />', () => {
	afterEach( () => {
		defaultProps.fetchIframeConfig.mockReset();
		defaultProps.fetchOrder.mockReset();
		defaultProps.onOrderCreated.mockReset();
		defaultProps.showErrorNotice.mockReset();
	} );

	test( 'should render', () => {
		const wrapper = shallow( <EmergentPaywallBox { ...defaultProps } /> );
		expect( wrapper ).toMatchSnapshot();
	} );

	test( 'should display iframe and form when we assign iframe properties', () => {
		const wrapper = mount( <EmergentPaywallBox { ...defaultProps } /> );
		expect( wrapper.find( '.iframe-loaded' ) ).toHaveLength( 0 );
		wrapper.setProps( {
			iframeConfig: {
				chargeId: 'chargeId',
				payload: 'payload',
				paywallUrl: 'http://bork.it',
				signature: 'signature',
			},
			iframeRequestSuccess: true,
		} );
		expect( wrapper.find( '.is-iframe-loaded' ) ).toHaveLength( 1 );
		expect( wrapper.find( 'input[name="payload"]' ).props().value ).toEqual( 'payload' );
		expect( wrapper.find( 'input[name="signature"]' ).props().value ).toEqual( 'signature' );
		expect( wrapper.find( 'form' ).props().action ).toEqual( 'http://bork.it' );
	} );

	test( 'should fetch a new iframe config when the cart price changes', () => {
		const wrapper = mount( <EmergentPaywallBox { ...defaultProps } /> );
		wrapper.setProps( {
			iframeRequestSuccess: true,
		} );
		expect( defaultProps.fetchIframeConfig ).toHaveBeenCalledTimes( 1 );
		wrapper.setProps( {
			cart: {
				products: [ 1 ],
				total_cost: 2,
			},
		} );
		expect( defaultProps.fetchIframeConfig ).toHaveBeenCalledTimes( 2 );
	} );

	test( 'should fetch a new iframe config when the product count changes', () => {
		const wrapper = mount( <EmergentPaywallBox { ...defaultProps } /> );
		wrapper.setProps( {
			iframeRequestSuccess: true,
		} );
		expect( defaultProps.fetchIframeConfig ).toHaveBeenCalledTimes( 1 );
		wrapper.setProps( {
			cart: {
				products: [ 1, 2 ],
				total_cost: 1,
			},
		} );
		expect( defaultProps.fetchIframeConfig ).toHaveBeenCalledTimes( 2 );
	} );

	test( 'should fetch order when iframe returns purchase status as `submitted`', () => {
		const wrapper = mount( <EmergentPaywallBox { ...defaultProps } /> );
		wrapper.setProps( {
			iframeRequestSuccess: true,
		} );
		wrapper.instance().handlePurchaseStatusMessage( { submitted: true } );
		expect( defaultProps.fetchOrder ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'should call onOrderCreated when order is successfull', () => {
		const wrapper = mount( <EmergentPaywallBox { ...defaultProps } /> );
		wrapper.setProps( {
			iframeRequestSuccess: true,
			orderId: 1,
			orderRequestSuccess: true,
		} );
		wrapper.instance().handlePurchaseStatusMessage( { success: true } );
		expect( defaultProps.onOrderCreated ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'should show an error notice and re-fetch the iframe config when the iframe request fails ', () => {
		const wrapper = mount( <EmergentPaywallBox { ...defaultProps } /> );
		wrapper.setProps( {
			iframeRequestFailed: true,
		} );
		expect( defaultProps.showErrorNotice ).toHaveBeenCalledTimes( 1 );
		expect( defaultProps.fetchIframeConfig ).toHaveBeenCalledTimes( 2 );
	} );

	test( 'should show an error notice and re-fetch the iframe config when the order request fails ', () => {
		const wrapper = mount( <EmergentPaywallBox { ...defaultProps } /> );
		wrapper.setProps( {
			orderRequestFailed: true,
		} );
		expect( defaultProps.showErrorNotice ).toHaveBeenCalledTimes( 1 );
		expect( defaultProps.fetchIframeConfig ).toHaveBeenCalledTimes( 2 );
	} );
} );

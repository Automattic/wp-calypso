/**
 * @format
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
import { Checkout } from '../checkout';

jest.mock( 'lib/countries-list', () => ( {} ) );
jest.mock( 'lib/user', () => ( {} ) );
jest.mock( 'lib/upgrades/actions', () => ( {
	resetTransaction: jest.fn(),
} ) );
jest.mock( 'lib/signup/step-actions', () => ( {} ) );
jest.mock( 'lib/analytics', () => ( {
	tracks: {
		recordEvent: jest.fn(),
	},
} ) );
jest.mock( 'lib/analytics/ad-tracking', () => ( {
	recordViewCheckout: jest.fn(),
} ) );
jest.mock( 'lib/store-transactions', () => ( {
	hasDomainDetails: jest.fn(),
} ) );
jest.mock( 'page', () => ( {
	redirect: jest.fn(),
} ) );
jest.mock( 'lib/abtest', () => ( {
	abtest() {},
	getABTestVariation() {},
} ) );
jest.mock( 'lib/abtest/active-tests', () => ( {} ) );
jest.mock( 'lib/cart-values', () => ( {
	cartItems: {
		getAll: jest.fn( false ),
		hasFreeTrial: jest.fn( false ),
		hasGoogleApps: jest.fn( false ),
		hasDomainRegistration: jest.fn( false ),
		hasRenewalItem: jest.fn( false ),
		hasOnlyRenewalItems: jest.fn( false ),
		hasTransferProduct: jest.fn( false ),
	},
	isPaymentMethodEnabled: jest.fn( false ),
	paymentMethodName: jest.fn( false ),
} ) );

describe( 'Checkout', () => {
	const defaultProps = {
		cards: [],
		cart: {
			products: [],
		},
		translate: identity,
		loadTrackingTool: identity,
		recordApplePayStatus: identity,
		transaction: {
			step: {},
		},
	};

	beforeAll( () => {
		global.window = {
			scrollTo: identity,
			document: {
				documentElement: {},
			},
		};
	} );

	test( 'should render and not blow up', () => {
		const checkout = shallow( <Checkout { ...defaultProps } /> );
		expect( checkout.find( '.checkout' ) ).toHaveLength( 1 );
	} );

	test( 'should set state.cartSettled to false', () => {
		let checkout;

		checkout = shallow( <Checkout { ...defaultProps } cart={ { hasLoadedFromServer: false } } /> );
		expect( checkout.state().cartSettled ).toBe( false );

		checkout = shallow( <Checkout { ...defaultProps } cart={ { hasLoadedFromServer: true } } /> );
		expect( checkout.state().cartSettled ).toBe( false );
	} );

	test( 'should set state.cartSettled to true after cart has loaded', () => {
		const checkout = shallow(
			<Checkout { ...defaultProps } cart={ { hasLoadedFromServer: false } } />
		);
		expect( checkout.state().cartSettled ).toBe( false );

		checkout.setProps( { cart: { hasLoadedFromServer: true } } );
		expect( checkout.state().cartSettled ).toBe( true );
	} );

	test( 'should keep state.cartSettled as true even after cart reloads', () => {
		const checkout = shallow(
			<Checkout { ...defaultProps } cart={ { hasLoadedFromServer: false } } />
		);
		expect( checkout.state().cartSettled ).toBe( false );

		checkout.setProps( { cart: { hasLoadedFromServer: true } } );
		expect( checkout.state().cartSettled ).toBe( true );

		checkout.setProps( { cart: { hasLoadedFromServer: false } } );
		expect( checkout.state().cartSettled ).toBe( true );
	} );
} );

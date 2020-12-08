/**
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
import { PayButton } from '../pay-button';
import { BEFORE_SUBMIT } from 'calypso/lib/store-transactions/step-types';

jest.mock( 'lib/cart-values', () => ( {
	cartItems: {
		hasOnlyFreeTrial: jest.fn( false ),
		hasRenewalItem: jest.fn( false ),
	},
	isPaidForFullyInCredits: jest.fn( false ),
} ) );

describe( 'PaymentBox', () => {
	const defaultProps = {
		cart: {
			total_cost_display: 125,
		},
		transactionStep: {
			name: BEFORE_SUBMIT,
			error: null,
			data: {},
		},
		translate: identity,
	};

	test( 'should render', () => {
		const wrapper = shallow( <PayButton { ...defaultProps } /> );
		expect( wrapper.find( '.pay-button' ) ).toHaveLength( 1 );
	} );

	test( 'should not be busy by default', () => {
		const wrapper = shallow( <PayButton { ...defaultProps } /> );
		expect( wrapper.find( '.pay-button' ) ).toHaveLength( 1 );
		expect( wrapper.find( 'Button' ).props().busy ).toBe( false );
	} );

	test( 'should be busy if cart has pending server updates', () => {
		const wrapper = shallow(
			<PayButton { ...defaultProps } cart={ { hasPendingServerUpdates: true } } />
		);
		expect( wrapper.find( 'Button' ).props().busy ).toBe( true );
	} );
} );

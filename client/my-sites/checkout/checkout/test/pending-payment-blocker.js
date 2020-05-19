/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { PendingPaymentBlocker } from '../pending-payment-blocker';

const defaultProps = { translate: ( x ) => x };

describe( 'PendingPaymentBlocker', () => {
	test( 'renders a PaymentBox', () => {
		const wrapper = shallow( <PendingPaymentBlocker { ...defaultProps } /> );
		expect( wrapper.find( 'Localized(PaymentBox)' ) ).toHaveLength( 1 );
	} );

	test( 'contact support button', () => {
		const wrapper = shallow( <PendingPaymentBlocker { ...defaultProps } /> );
		expect( wrapper.find( 'Button[primary=false][href="/help/contact"]' ) ).toHaveLength( 1 );
	} );

	test( 'view pending button', () => {
		const wrapper = shallow( <PendingPaymentBlocker { ...defaultProps } /> );
		expect( wrapper.find( 'Button[primary=true][href="/me/purchases/pending"]' ) ).toHaveLength(
			1
		);
	} );
} );

/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';
import config from 'config';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import { PendingPaymentNotice } from '../pending-payment-notice';

// Gets rid of warnings such as 'UnhandledPromiseRejectionWarning: Error: No available storage method found.'
jest.mock( 'lib/user', () => () => {} );

const props = { translate: x => x };

describe( 'PendingPaymentNotice#flag-enabled', () => {
	test( 'renders null without cart', () => {
		const wrapper = shallow( <PendingPaymentNotice { ...props } /> );
		expect( wrapper.getElement() ).toBe( null );
	} );

	test( 'renders null while loading the cart', () => {
		const cart = { hasLoadedFromServer: false, hasPendingServerUpdates: false };

		const wrapper = shallow( <PendingPaymentNotice { ...props } cart={ cart } /> );

		expect( wrapper.getElement() ).toBe( null );
	} );

	test( 'renders null when there are no pending payments', () => {
		const cart = { has_pending_payment: false };

		const wrapper = shallow( <PendingPaymentNotice { ...props } cart={ cart } /> );

		expect( wrapper.getElement() ).toBe( null );
	} );

	test( 'renders when there are pending payments', () => {
		const cart = { has_pending_payment: true };

		const wrapper = shallow( <PendingPaymentNotice { ...props } cart={ cart } /> );

		expect( wrapper.getElement() ).not.toBe( null );
		expect( wrapper.find( Notice ) ).toHaveLength( 1 );
		expect( wrapper.find( NoticeAction ) ).toHaveLength( 1 );
	} );
} );

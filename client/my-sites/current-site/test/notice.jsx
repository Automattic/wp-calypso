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
import { SiteNotice } from '../notice';

// Gets rid of warnings such as 'UnhandledPromiseRejectionWarning: Error: No available storage method found.'
jest.mock( 'lib/user', () => () => {} );
jest.mock( 'config', () => {
	const mock = () => 'development';
	mock.isEnabled = jest.fn();
	return mock;
} );

const props = { translate: x => x, site: { ID: '' } };

describe( 'SiteNotice#pendingPaymentNotice', () => {
	test( 'renders null behind feature flag', () => {
		config.isEnabled.mockImplementation( () => false );

		const wrapper = shallow( <SiteNotice { ...props } /> );

		expect( wrapper.find( 'Localized(PendingPaymentNotice)' ) ).toHaveLength( 0 );
		expect( wrapper.instance().pendingPaymentNotice() ).toBe( null );
	} );

	test( 'renders PendingPaymentNotice when enabled', () => {
		config.isEnabled.mockImplementation( flag => flag === 'async-payments' );

		const wrapper = shallow( <SiteNotice { ...props } /> );

		expect( wrapper.find( 'Localized(PendingPaymentNotice)' ) ).toHaveLength( 1 );
	} );
} );

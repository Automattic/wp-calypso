/**
 * @jest-environment jsdom
 */

import config from '@automattic/calypso-config';
import { screen } from '@testing-library/react';
import { render } from '../../../../test-utils';
import ConfirmCheckbox from '../confirm-checkbox';
import type { Purchase } from '@automattic/api-core';

jest.mock( '@automattic/calypso-config', () => {
	const fn = jest.fn( () => '' );
	return Object.assign( fn, {
		__esModule: true,
		default: fn,
		isEnabled: jest.fn( () => false ),
	} );
} );

const mockedIsEnabled = config.isEnabled as jest.MockedFunction< typeof config.isEnabled >;

function makePurchase( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		ID: 123,
		product_name: 'WordPress.com Business',
		product_slug: 'business-bundle',
		is_plan: true,
		is_domain_registration: false,
		is_jetpack_plan_or_product: false,
		blog_id: 1,
		site_slug: 'example.wordpress.com',
		...overrides,
	} as Purchase;
}

const noop = () => {};
const defaultProps = {
	displayVariant: 'cancel' as const,
	state: {
		cancelBundledDomain: false,
		confirmCancelBundledDomain: false,
		surveyShown: false,
		customerConfirmedUnderstanding: false,
		atomicRevertConfirmed: false,
		isLoading: false,
		domainConfirmationConfirmed: false,
		showDomainOptionsStep: false,
		questionOneOrder: [],
	},
	onDomainConfirmationChange: noop,
	onCustomerConfirmedUnderstandingChange: noop,
	onCustomerConfirmedUnderstandingAtomicPlanRevert: noop,
};

describe( '<ConfirmCheckbox />', () => {
	beforeEach( () => {
		mockedIsEnabled.mockImplementation( () => false );
	} );

	test( '"Contact us" renders as a button (not a support link) when split-cancel-remove flag is off', () => {
		mockedIsEnabled.mockImplementation( () => false );

		render( <ConfirmCheckbox { ...defaultProps } purchase={ makePurchase() } /> );

		const contactLink = screen.getByRole( 'button', { name: /contact us/i } );
		expect( contactLink ).toBeVisible();
		// It should NOT be an anchor pointing to external support
		expect( contactLink.tagName ).not.toBe( 'A' );
	} );

	test( '"Contact us" renders as a button (not a support link) when split-cancel-remove flag is on', () => {
		mockedIsEnabled.mockImplementation( ( flag ) => flag === 'purchases/split-cancel-remove' );

		render( <ConfirmCheckbox { ...defaultProps } purchase={ makePurchase() } /> );

		const contactLink = screen.getByRole( 'button', { name: /contact us/i } );
		expect( contactLink ).toBeVisible();
		expect( contactLink.tagName ).not.toBe( 'A' );
	} );
} );

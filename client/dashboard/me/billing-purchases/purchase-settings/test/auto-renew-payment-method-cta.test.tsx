/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import { render } from '../../../../test-utils';
import { ManageSubscriptionCard } from '../index';
import type { Purchase } from '@automattic/api-core';

// The rendering wrapper's default user has ID 1, so a purchase owned by user 1
// belongs to the current user.
function makePurchase( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		ID: 1,
		user_id: 1,
		product_name: 'WordPress.com Personal',
		product_slug: 'personal-bundle',
		site_slug: 'example.com',
		is_plan: true,
		is_auto_renew_enabled: false,
		is_rechargeable: false,
		can_disable_auto_renew: false,
		can_reenable_auto_renewal: false,
		subscription_status: 'active',
		expiry_status: 'manual-renew',
		expiry_date: '2027-01-01',
		...overrides,
	} as Purchase;
}

describe( 'auto-renew without a payment method', () => {
	test( 'auto-renew off and un-reenableable offers an add payment method CTA instead of a dead toggle', () => {
		render( <ManageSubscriptionCard purchase={ makePurchase() } /> );

		expect( screen.getByText( 'Auto-renew needs a payment method.' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Add payment method' } ) ).toBeVisible();
		expect(
			screen.queryByRole( 'checkbox', { name: 'Enable auto-renew' } )
		).not.toBeInTheDocument();
	} );

	test( 'auto-renew on without a rechargeable payment method keeps its existing CTA', () => {
		render(
			<ManageSubscriptionCard
				purchase={ makePurchase( {
					is_auto_renew_enabled: true,
					expiry_status: 'auto-renewing',
				} ) }
			/>
		);

		expect( screen.getByText( 'Auto-renew needs a payment method.' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Add payment method' } ) ).toBeVisible();
	} );

	test( 'an in-app purchase gets no CTA, since its payment method lives in the app store', () => {
		render(
			<ManageSubscriptionCard
				purchase={ makePurchase( { is_auto_renew_enabled: true, is_iap_purchase: true } ) }
			/>
		);

		expect( screen.queryByText( 'Auto-renew needs a payment method.' ) ).not.toBeInTheDocument();
		expect(
			screen.queryByRole( 'button', { name: 'Add payment method' } )
		).not.toBeInTheDocument();
	} );

	test( 'a re-enableable purchase keeps the toggle, so the CTA does not take over', () => {
		render(
			<ManageSubscriptionCard
				purchase={ makePurchase( { can_reenable_auto_renewal: true, is_rechargeable: true } ) }
			/>
		);

		expect( screen.getByRole( 'checkbox', { name: 'Enable auto-renew' } ) ).toBeVisible();
		expect( screen.queryByText( 'Auto-renew needs a payment method.' ) ).not.toBeInTheDocument();
	} );
} );

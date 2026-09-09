/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import { render } from '../../../../test-utils';
import { ManageSubscriptionCard, StorageUpgradeActionButton } from '../index';
import type { Purchase } from '@automattic/api-core';

// A partner-provisioned ("Jetpack Start") subscription. The eligibility flags
// below deliberately say yes to every action that has no server-side flag of its
// own, so only `is_partner_managed` can be what suppresses them.
//
// The upgrade, renew, cancel, and remove actions are not covered here: the
// backend reports `is_upgradable`, `can_explicit_renew`, `is_cancelable`, and
// `is_removable` as false for these subscriptions, so they need no client gate.
// Cancel is the exception, since its visibility is driven by auto-renew state
// instead — see cancel-or-remove-action-button.test.tsx.
//
// The rendering wrapper's default user has ID 1, so a purchase owned by user 1
// belongs to the current user.
function makePartnerPurchase( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		ID: 1,
		user_id: 1,
		product_name: 'Jetpack Security Daily',
		product_slug: 'jetpack_security_t1_yearly',
		site_slug: 'example.com',
		is_plan: true,
		is_jetpack_plan_or_product: true,
		is_jetpack_backup_t1: true,
		is_auto_renew_enabled: true,
		is_rechargeable: false,
		subscription_status: 'active',
		expiry_status: 'auto-renewing',
		expiry_date: '2027-01-01',
		is_partner_managed: true,
		is_host_managed: true,
		partner_name: 'Bluehost',
		partner_type: 'hosting_provider',
		...overrides,
	} as Purchase;
}

describe( 'partner-managed purchase actions', () => {
	test( 'the storage upgrade action is hidden for a storage-eligible product', () => {
		const { container } = render(
			<StorageUpgradeActionButton purchase={ makePartnerPurchase() } />
		);
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'the manage subscription card is hidden, so no auto-renew or payment method controls', () => {
		const { container } = render( <ManageSubscriptionCard purchase={ makePartnerPurchase() } /> );
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'an agency-managed purchase also loses them, since the agency does the buying', () => {
		const purchase = makePartnerPurchase( {
			is_host_managed: false,
			partner_name: 'Some Agency',
			partner_type: 'a4a_agency',
		} );

		const { container } = render(
			<>
				<StorageUpgradeActionButton purchase={ purchase } />
				<ManageSubscriptionCard purchase={ purchase } />
			</>
		);
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'a purchase WordPress.com bills keeps its actions', () => {
		// Covers both an ordinary purchase and an A4A store purchase: the backend
		// reports `is_partner_managed` as false for each.
		const purchase = makePartnerPurchase( {
			is_partner_managed: false,
			is_host_managed: false,
		} );

		render(
			<>
				<StorageUpgradeActionButton purchase={ purchase } />
				<ManageSubscriptionCard purchase={ purchase } />
			</>
		);

		expect( screen.getByRole( 'button', { name: 'Upgrade storage' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Add payment method' } ) ).toBeVisible();
	} );
} );

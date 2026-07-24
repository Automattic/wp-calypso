/**
 * @jest-environment jsdom
 */

import { JetpackPlans, type Purchase } from '@automattic/api-core';
import { screen } from '@testing-library/react';
import { render } from '../../../../test-utils';
import { StorageUpgradeActionButton } from '../index';

// The rendering wrapper's default user has ID 1, so a purchase owned by user 1
// belongs to the current user.
function makePurchase( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		ID: 1,
		user_id: 1,
		product_name: 'Jetpack Backup',
		product_slug: 'jetpack_backup_t1_yearly',
		site_slug: 'example.com',
		is_jetpack_backup_t1: true,
		is_jetpack_plan_or_product: true,
		subscription_status: 'active',
		expiry_status: 'auto-renewing',
		...overrides,
	} as Purchase;
}

describe( '<StorageUpgradeActionButton />', () => {
	test( 'renders the storage upgrade action for an owned Backup T1 product', () => {
		render( <StorageUpgradeActionButton purchase={ makePurchase() } /> );
		expect( screen.getByRole( 'button', { name: 'Upgrade storage' } ) ).toBeVisible();
	} );

	test( 'renders the storage upgrade action for a Security T1 plan', () => {
		render(
			<StorageUpgradeActionButton
				purchase={ makePurchase( {
					product_slug: JetpackPlans.PLAN_JETPACK_SECURITY_T1_YEARLY,
					is_jetpack_backup_t1: false,
				} ) }
			/>
		);
		expect( screen.getByRole( 'button', { name: 'Upgrade storage' } ) ).toBeVisible();
	} );

	test( 'renders nothing when the current user does not own the purchase', () => {
		const { container } = render(
			<StorageUpgradeActionButton purchase={ makePurchase( { user_id: 2 } ) } />
		);
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'renders nothing for a product that is not storage-eligible', () => {
		const { container } = render(
			<StorageUpgradeActionButton
				purchase={ makePurchase( {
					product_slug: 'business-bundle',
					is_jetpack_backup_t1: false,
				} ) }
			/>
		);
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'renders nothing for an expired purchase', () => {
		const { container } = render(
			<StorageUpgradeActionButton
				purchase={ makePurchase( { expiry_status: 'expired', subscription_status: 'active' } ) }
			/>
		);
		expect( container ).toBeEmptyDOMElement();
	} );
} );

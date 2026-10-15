/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import { render } from '../../../../test-utils';
import { ProductChangeActionItem } from '../index';
import type { Purchase } from '@automattic/api-core';

// The rendering wrapper's default user has ID 1, so a purchase owned by user 1
// belongs to the current user.
function makePlan( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		ID: 1,
		user_id: 1,
		product_name: 'WordPress.com Personal',
		product_slug: 'personal-bundle',
		site_slug: 'example.com',
		is_plan: true,
		is_upgradable: true,
		is_jetpack_plan_or_product: false,
		is_plan_type_downgradable: false,
		is_trial_plan: false,
		is_woo_hosted_product: false,
		subscription_status: 'active',
		expiry_status: 'auto-renewing',
		...overrides,
	} as Purchase;
}

describe( '<ProductChangeActionItem />', () => {
	test( 'offers to change plan when the plan can be downgraded', () => {
		render(
			<ProductChangeActionItem purchase={ makePlan( { is_plan_type_downgradable: true } ) } />
		);
		expect( screen.getByText( 'Change plan' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'View plans' } ) ).toBeVisible();
	} );

	test( 'offers to upgrade when the plan has nothing below it', () => {
		render( <ProductChangeActionItem purchase={ makePlan() } /> );
		expect( screen.getByText( 'Upgrade plan' ) ).toBeVisible();
		expect( screen.queryByText( 'Change plan' ) ).not.toBeInTheDocument();
		// Terse, because no "Upgrade storage" action sits alongside it.
		expect( screen.getByRole( 'button', { name: 'Upgrade' } ) ).toBeVisible();
	} );

	test( 'names what it upgrades when the storage action is alongside it', () => {
		render(
			<ProductChangeActionItem
				purchase={ makePlan( {
					is_plan: false,
					product_slug: 'jetpack_backup_t1_yearly',
					is_jetpack_backup_t1: true,
					is_jetpack_plan_or_product: true,
				} ) }
			/>
		);
		expect( screen.getByRole( 'button', { name: 'Upgrade subscription' } ) ).toBeVisible();
	} );

	test( 'still offers a way to pick a different plan once expired', () => {
		render(
			<ProductChangeActionItem
				purchase={ makePlan( {
					expiry_status: 'expired',
					subscription_status: 'active',
					is_past_expiry_date: true,
				} ) }
			/>
		);
		expect( screen.getByText( 'Upgrade plan' ) ).toBeVisible();
	} );

	test( 'renders nothing when the current user does not own the purchase', () => {
		const { container } = render(
			<ProductChangeActionItem purchase={ makePlan( { user_id: 2 } ) } />
		);
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'renders nothing when the plan is not upgradable', () => {
		const { container } = render(
			<ProductChangeActionItem purchase={ makePlan( { is_upgradable: false } ) } />
		);
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'offers an upgrade-only action for a Jetpack plan', () => {
		render(
			<ProductChangeActionItem purchase={ makePlan( { is_jetpack_plan_or_product: true } ) } />
		);
		// A plan, so it says so — but it cannot downgrade.
		expect( screen.getByText( 'Upgrade plan' ) ).toBeVisible();
		expect( screen.queryByText( 'Change plan' ) ).not.toBeInTheDocument();
	} );

	test( 'offers an upgrade-only action for a non-plan product', () => {
		render( <ProductChangeActionItem purchase={ makePlan( { is_plan: false } ) } /> );
		expect( screen.getByText( 'Upgrade subscription' ) ).toBeVisible();
		expect( screen.queryByText( 'Change plan' ) ).not.toBeInTheDocument();
	} );

	test( 'renders nothing for a non-plan product that cannot be upgraded', () => {
		const { container } = render(
			<ProductChangeActionItem purchase={ makePlan( { is_plan: false, is_upgradable: false } ) } />
		);
		expect( container ).toBeEmptyDOMElement();
	} );
} );

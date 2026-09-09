/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../test-utils';
import { PurchaseHeaderActions } from '../index';
import type { Purchase } from '@automattic/api-core';

// The rendering wrapper's default user has ID 1, so a purchase owned by user 1
// belongs to the current user.
function makeDomain( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		ID: 1,
		user_id: 1,
		product_name: 'example.com',
		product_slug: 'domain_reg',
		site_slug: 'example.com',
		meta: 'example.com',
		is_domain: true,
		is_plan: false,
		is_upgradable: false,
		is_jetpack_plan_or_product: false,
		is_plan_type_downgradable: false,
		is_trial_plan: false,
		is_woo_hosted_product: false,
		can_explicit_renew: true,
		subscription_status: 'active',
		expiry_status: 'manual-renew',
		...overrides,
	} as Purchase;
}

// A plan that can both be upgraded and renewed, so it has two header actions.
function makePlan( overrides: Partial< Purchase > = {} ): Purchase {
	return makeDomain( {
		product_name: 'WordPress.com Personal',
		product_slug: 'personal-bundle',
		meta: undefined,
		is_domain: false,
		is_plan: true,
		is_upgradable: true,
		...overrides,
	} );
}

describe( '<PurchaseHeaderActions />', () => {
	test( 'promotes a lone action to a primary button rather than burying it in the menu', () => {
		render( <PurchaseHeaderActions purchase={ makeDomain() } planExpiryNoticeShowing={ false } /> );

		expect( screen.getByRole( 'link', { name: 'Renew' } ) ).toHaveClass( 'is-primary' );
		expect( screen.queryByRole( 'button', { name: 'Quick actions' } ) ).not.toBeInTheDocument();
	} );

	test( 'promotes the first of several actions and overflows the rest', async () => {
		render( <PurchaseHeaderActions purchase={ makePlan() } planExpiryNoticeShowing={ false } /> );

		expect( screen.getByRole( 'link', { name: 'Upgrade' } ) ).toHaveClass( 'is-primary' );

		await userEvent.click( screen.getByRole( 'button', { name: 'Quick actions' } ) );

		expect( screen.getByRole( 'menuitem', { name: 'Renew' } ) ).toBeVisible();
		// The promoted action is not repeated in the menu.
		expect( screen.queryByRole( 'menuitem', { name: 'Upgrade' } ) ).not.toBeInTheDocument();
	} );

	test( 'stands down to the menu while the plan-expiry notice owns the call to action', () => {
		render( <PurchaseHeaderActions purchase={ makeDomain() } planExpiryNoticeShowing /> );

		expect( screen.queryByRole( 'link', { name: 'Renew' } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Quick actions' } ) ).toBeVisible();
	} );

	test( 'offers nothing to someone who does not own the purchase', () => {
		render(
			<PurchaseHeaderActions
				purchase={ makeDomain( { user_id: 2 } ) }
				planExpiryNoticeShowing={ false }
			/>
		);

		expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();
	} );
} );

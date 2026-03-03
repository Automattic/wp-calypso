/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import { render } from '../../../../test-utils';
import { PurchaseSettingsActions } from '../index';
import type { Purchase } from '@automattic/api-core';

function createPurchase( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		ID: 1,
		user_id: 1,
		product_slug: 'business-bundle',
		product_name: 'WordPress.com Business',
		product_type: 'bundle',
		expiry_status: 'auto-renewing',
		subscription_status: 'active',
		is_upgradable: false,
		is_cancelable: false,
		is_removable: false,
		is_renewable: false,
		is_rechargeable: true,
		is_refundable: false,
		can_explicit_renew: false,
		can_disable_auto_renew: true,
		is_auto_renew_enabled: true,
		is_plan: true,
		is_domain: false,
		is_jetpack_plan_or_product: false,
		meta: '',
		domain: 'example.wordpress.com',
		site_slug: 'example.wordpress.com',
		...overrides,
	} as Purchase;
}

describe( '<PurchaseSettingsActions>', () => {
	test( 'shows upgrade button for a normal upgradable purchase', () => {
		const purchase = createPurchase( { is_upgradable: true } );
		render( <PurchaseSettingsActions purchase={ purchase } /> );

		expect( screen.getByRole( 'button', { name: 'Upgrade' } ) ).toBeVisible();
	} );

	test( 'hides upgrade button for an A4A billing dragon purchase', () => {
		const purchase = createPurchase( {
			is_upgradable: true,
			meta: 'is-a4a',
			domain: 'siteless.a4a.com',
		} );
		render( <PurchaseSettingsActions purchase={ purchase } /> );

		expect( screen.queryByRole( 'button', { name: 'Upgrade' } ) ).not.toBeInTheDocument();
	} );

	test( 'shows re-subscribe button for a normal expired purchase', () => {
		const purchase = createPurchase( {
			expiry_status: 'expired',
			subscription_status: 'expired',
		} );
		render( <PurchaseSettingsActions purchase={ purchase } /> );

		expect( screen.getByRole( 'button', { name: 'Pick another plan' } ) ).toBeVisible();
	} );

	test( 'hides re-subscribe button for an expired A4A billing dragon purchase', () => {
		const purchase = createPurchase( {
			expiry_status: 'expired',
			subscription_status: 'expired',
			meta: 'is-a4a',
			domain: 'siteless.a4a.com',
		} );
		render( <PurchaseSettingsActions purchase={ purchase } /> );

		expect( screen.queryByRole( 'button', { name: 'Pick another plan' } ) ).not.toBeInTheDocument();
		expect(
			screen.queryByRole( 'button', { name: 'Pick another product' } )
		).not.toBeInTheDocument();
	} );
} );

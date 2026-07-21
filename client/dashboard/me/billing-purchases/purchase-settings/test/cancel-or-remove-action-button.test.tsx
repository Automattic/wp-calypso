/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import { render } from '../../../../test-utils';
import { CancelOrRemoveActionButton } from '../index';
import type { Purchase } from '@automattic/api-core';

// The rendering wrapper's default user has ID 1, so a purchase owned by user 1
// belongs to the current user.
function makePurchase( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		ID: 1,
		user_id: 1,
		product_name: 'WordPress.com Business',
		product_slug: 'business-bundle',
		is_plan: true,
		subscription_status: 'active',
		expiry_status: 'auto-renewing',
		expiry_date: '2027-01-01',
		is_auto_renew_enabled: true,
		refund_amount: 0,
		...overrides,
	} as Purchase;
}

describe( '<CancelOrRemoveActionButton />', () => {
	test( 'renders nothing when the current user does not own the purchase', () => {
		const { container } = render(
			<CancelOrRemoveActionButton purchase={ makePurchase( { user_id: 2 } ) } />
		);
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'renders nothing for a subscription that is no longer active', () => {
		const { container } = render(
			<CancelOrRemoveActionButton
				purchase={ makePurchase( { subscription_status: 'inactive' } ) }
			/>
		);
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'shows only Cancel when auto-renew is on and no refund is available', () => {
		render( <CancelOrRemoveActionButton purchase={ makePurchase() } /> );

		expect( screen.getByRole( 'button', { name: 'Cancel' } ) ).toBeVisible();
		expect( screen.getByText( 'Cancel subscription' ) ).toBeVisible();
		expect( screen.getByText( /Stop future payments\. Keep plan features until/ ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Remove' } ) ).toBeNull();
	} );

	test( 'shows only Remove when auto-renew is off', () => {
		render(
			<CancelOrRemoveActionButton purchase={ makePurchase( { is_auto_renew_enabled: false } ) } />
		);

		expect( screen.getByRole( 'button', { name: 'Remove' } ) ).toBeVisible();
		expect( screen.getByText( 'Remove plan' ) ).toBeVisible();
		expect( screen.getByText( 'Plan features will be removed immediately.' ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Cancel' } ) ).toBeNull();
	} );

	test( 'forces Remove during the post-expiration grace period even when auto-renew is on', () => {
		render(
			<CancelOrRemoveActionButton
				purchase={ makePurchase( { expiry_status: 'expired', subscription_status: 'active' } ) }
			/>
		);

		expect( screen.getByRole( 'button', { name: 'Remove' } ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Cancel' } ) ).toBeNull();
	} );

	test( 'keeps a single Cancel action (no second Remove CTA) when a refund is available with auto-renew on', () => {
		render( <CancelOrRemoveActionButton purchase={ makePurchase( { refund_amount: 96 } ) } /> );

		expect( screen.getByRole( 'button', { name: 'Cancel' } ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Remove' } ) ).toBeNull();
	} );

	test( 'renders nothing for a non-refundable domain transfer with auto-renew on', () => {
		const { container } = render(
			<CancelOrRemoveActionButton
				purchase={ makePurchase( {
					product_slug: 'domain_transfer',
					is_plan: false,
					refund_amount: 0,
				} ) }
			/>
		);
		expect( container ).toBeEmptyDOMElement();
	} );
} );

/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../../test-utils';
import PurchaseSiteDetails from '../purchase-site-details';
import type { ReferralPurchase } from '@automattic/api-core';

function createPurchase( overrides: Partial< ReferralPurchase > = {} ): ReferralPurchase {
	return {
		status: 'active',
		product_id: 2014,
		quantity: 1,
		site_assigned: '',
		referral_id: 1,
		license: {
			license_key: 'jetpack-complete_abc123',
			issued_at: '2026-01-01 00:00:00',
			attached_at: null,
			revoked_at: null,
		},
		...overrides,
	};
}

const cancelledSubscription = {
	id: 'sub-1',
	product_name: 'Jetpack Complete',
	status: 'active',
	is_auto_renew_enabled: false,
	expiry: '2026-12-01',
};

const infoButton = () =>
	screen.getByRole( 'button', { name: 'More information about cancellation' } );

describe( '<PurchaseSiteDetails>', () => {
	test( 'shows the status on its own for a purchase that still renews', () => {
		render( <PurchaseSiteDetails purchase={ createPurchase() } /> );

		expect( screen.getByText( 'Unassigned' ) ).toBeVisible();
		expect(
			screen.queryByRole( 'button', { name: 'More information about cancellation' } )
		).not.toBeInTheDocument();
	} );

	test( 'explains a cancelled product that is active until it expires', async () => {
		render(
			<PurchaseSiteDetails purchase={ createPurchase( { subscription: cancelledSubscription } ) } />
		);

		await userEvent.click( infoButton() );

		// The popover fades in, and jsdom never finishes the animation, so its
		// content is asserted by presence rather than visibility.
		expect( await screen.findByText( /remain active until/ ) ).toBeInTheDocument();
		expect( screen.getByText( 'December 1, 2026' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'link', { name: /Learn more about cancelations/ } ) ).toHaveAttribute(
			'href',
			'https://wordpress.com/support/manage-purchases/cancel-a-purchase/'
		);
	} );

	test( 'closes the cancellation popover with Escape', async () => {
		render(
			<PurchaseSiteDetails purchase={ createPurchase( { subscription: cancelledSubscription } ) } />
		);

		await userEvent.click( infoButton() );
		expect( await screen.findByText( /remain active until/ ) ).toBeInTheDocument();

		await userEvent.keyboard( '{Escape}' );

		await waitFor( () =>
			expect( screen.queryByText( /remain active until/ ) ).not.toBeInTheDocument()
		);
	} );

	test( 'explains why an unpaid purchase cannot be placed yet', () => {
		render( <PurchaseSiteDetails purchase={ createPurchase( { status: 'pending' } ) } /> );

		expect( screen.getByText( 'Awaiting payment' ) ).toBeVisible();
	} );
} );

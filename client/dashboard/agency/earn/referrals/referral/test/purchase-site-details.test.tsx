/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
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

		expect( await screen.findByText( /remain active until/ ) ).toBeVisible();
		expect( screen.getByText( 'December 1, 2026' ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: /Learn more about cancelations/ } ) ).toHaveAttribute(
			'href',
			'https://wordpress.com/support/manage-purchases/cancel-a-purchase/'
		);
	} );

	test( 'explains why an unpaid purchase cannot be placed yet', () => {
		render( <PurchaseSiteDetails purchase={ createPurchase( { status: 'pending' } ) } /> );

		expect( screen.getByText( 'Awaiting payment' ) ).toBeVisible();
	} );
} );

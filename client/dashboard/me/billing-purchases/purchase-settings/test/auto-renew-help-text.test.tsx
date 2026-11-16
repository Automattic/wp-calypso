/**
 * @vitest-environment jsdom
 */

import { screen } from '@testing-library/react';
import { render } from '../../../../test-utils';
import { ManageSubscriptionCard } from '../index';
import type { Purchase } from '@automattic/api-core';

function makePurchase( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		ID: 1,
		user_id: 1,
		product_name: 'WordPress.com Personal',
		product_slug: 'personal-bundle',
		site_slug: 'example.com',
		is_plan: true,
		is_auto_renew_enabled: true,
		is_rechargeable: true,
		can_disable_auto_renew: true,
		can_reenable_auto_renewal: true,
		subscription_status: 'active',
		expiry_status: 'auto-renewing',
		renew_date: '2027-01-01T12:00:00+00:00',
		expiry_date: '2027-02-01T12:00:00+00:00',
		...overrides,
	} as Purchase;
}

function getToggleHelp() {
	const toggle = screen.getByRole( 'checkbox', { name: 'Enable auto-renew' } );
	return document.getElementById( toggle.getAttribute( 'aria-describedby' ) ?? '' );
}

describe( 'auto-renew help text', () => {
	test( 'explains the early renewal inline when the renewal date differs from the expiry date', async () => {
		render( <ManageSubscriptionCard purchase={ makePurchase() } /> );

		expect( await screen.findByRole( 'link', { name: /Learn more/ } ) ).toBeVisible();
		expect( getToggleHelp() ).toHaveTextContent(
			'You will be billed on January 1, 2027. Your subscription is paid through February 1, 2027, but will be renewed prior to that date. Learn more'
		);
		expect( screen.queryByRole( 'button', { name: '' } ) ).not.toBeInTheDocument();
	} );

	test( 'shows only the billing date when the renewal date matches the expiry date', () => {
		render(
			<ManageSubscriptionCard
				purchase={ makePurchase( { expiry_date: '2027-01-01T12:00:00+00:00' } ) }
			/>
		);

		expect( getToggleHelp() ).toHaveTextContent( /^You will be billed on January 1, 2027$/ );
		expect( screen.queryByRole( 'link', { name: /Learn more/ } ) ).not.toBeInTheDocument();
	} );
} );

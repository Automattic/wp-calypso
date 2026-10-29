/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../../test-utils';
import {
	AutoRenewOffNotice,
	DangerZoneSection,
	DetailsSection,
	RenewalSection,
	isDomainRegistrationLayout,
	useDomainAutoRenew,
} from '../domain-registration-settings';
import type { Purchase, Site } from '@automattic/api-core';

// The rendering wrapper's default user has ID 1, so a purchase owned by user 1
// belongs to the current user.
function makeDomain( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		ID: 1,
		user_id: 1,
		product_name: 'Domain Registration',
		product_slug: 'domain_reg',
		site_slug: 'icecreamshop.com',
		meta: 'icecreamshop.com',
		is_domain: true,
		is_domain_registration: true,
		is_hundred_year_domain: false,
		is_partner_managed: false,
		is_host_managed: false,
		is_iap_purchase: false,
		is_auto_renew_enabled: true,
		is_rechargeable: true,
		can_disable_auto_renew: true,
		can_reenable_auto_renewal: true,
		can_explicit_renew: true,
		might_still_auto_renew: true,
		payment_type: 'credit_card',
		payment_card_id: 1,
		payment_card_type: 'visa',
		payment_details: '4242',
		price_integer: 1800,
		currency_code: 'USD',
		bill_period_days: 365,
		subscription_status: 'active',
		expiry_status: 'auto-renewing',
		renew_date: '2027-08-04T00:00:00+00:00',
		expiry_date: '2027-09-04T00:00:00+00:00',
		...overrides,
	} as Purchase;
}

const autoRenewOff = {
	is_auto_renew_enabled: false,
	expiry_status: 'manual-renew',
	might_still_auto_renew: false,
	renew_date: undefined,
} as const;

function Renewal( { purchase }: { purchase: Purchase } ) {
	const autoRenew = useDomainAutoRenew( purchase );
	return (
		<>
			{ ! purchase.is_auto_renew_enabled && (
				<AutoRenewOffNotice purchase={ purchase } autoRenew={ autoRenew } />
			) }
			<RenewalSection purchase={ purchase } autoRenew={ autoRenew } />
		</>
	);
}

describe( '<DomainRegistrationSettings />', () => {
	describe( 'isDomainRegistrationLayout', () => {
		test( 'applies to domain registrations only', () => {
			expect( isDomainRegistrationLayout( makeDomain() ) ).toBe( true );
			expect(
				isDomainRegistrationLayout(
					makeDomain( { is_domain_registration: false, product_slug: 'domain_map' } )
				)
			).toBe( false );
			expect( isDomainRegistrationLayout( makeDomain( { is_hundred_year_domain: true } ) ) ).toBe(
				false
			);
		} );
	} );

	describe( 'domain renewal', () => {
		test( 'with auto-renew on, explains the early renewal date and shows the payment method', async () => {
			render( <Renewal purchase={ makeDomain() } /> );

			expect( await screen.findByRole( 'checkbox', { name: 'Auto-renew on' } ) ).toBeChecked();
			expect(
				screen.getByText( 'Renews on August 4, 2027 for $18. Excludes taxes.' )
			).toBeVisible();
			expect(
				screen.getByText(
					'We charge a month earlier so the domain never lapses, and each renewal adds a full year.'
				)
			).toBeVisible();
			expect( screen.getByText( 'Payment method' ) ).toBeVisible();
			expect( screen.getByRole( 'button', { name: 'Update payment method' } ) ).toBeVisible();
			expect( screen.queryByText( 'Auto-renew is off' ) ).not.toBeInTheDocument();
		} );

		test( 'with auto-renew off, warns that the domain expires and offers to turn it on', async () => {
			render( <Renewal purchase={ makeDomain( autoRenewOff ) } /> );

			expect( await screen.findByText( 'Auto-renew is off' ) ).toBeVisible();
			expect( screen.getByRole( 'button', { name: 'Turn on auto-renew' } ) ).toBeVisible();
			expect( screen.getByRole( 'link', { name: 'Renew now for $18' } ) ).toBeVisible();

			const toggle = screen.getByRole( 'checkbox', { name: 'Auto-renew off' } );
			expect( toggle ).not.toBeChecked();
			expect( toggle ).toBeEnabled();
			expect(
				screen.getByText(
					'Turn on to renew automatically, a month before the domain expires, for $18 per year. Excludes taxes.'
				)
			).toBeVisible();
			expect( screen.queryByText( 'Payment method' ) ).not.toBeInTheDocument();
		} );

		test( 'with no payment method, asks for one instead of offering the toggle', async () => {
			render( <Renewal purchase={ makeDomain( { ...autoRenewOff, is_rechargeable: false } ) } /> );

			expect( await screen.findByRole( 'checkbox', { name: 'Auto-renew off' } ) ).toBeDisabled();
			expect( screen.getByText( 'Auto-renew needs a payment method.' ) ).toBeVisible();
			expect( screen.getByRole( 'button', { name: 'Add payment method' } ) ).toBeVisible();
			expect( screen.getByRole( 'link', { name: 'Add payment method' } ) ).toBeVisible();
			expect(
				screen.queryByRole( 'button', { name: 'Turn on auto-renew' } )
			).not.toBeInTheDocument();
		} );

		test( 'moves the toggle as soon as it is clicked and shows that it is saving', async () => {
			const user = userEvent.setup();
			nock( 'https://public-api.wordpress.com' )
				.post( '/rest/v1.1/upgrades/1/enable-auto-renew' )
				.delay( 100 )
				.reply( 200, { success: true, upgrade: {} } );

			render( <Renewal purchase={ makeDomain( autoRenewOff ) } /> );

			await user.click( await screen.findByRole( 'checkbox', { name: 'Auto-renew off' } ) );

			const toggle = screen.getByRole( 'checkbox', { name: 'Auto-renew on' } );
			expect( toggle ).toBeChecked();
			expect( toggle ).toBeDisabled();
			expect( screen.getByText( 'Saving…' ) ).toBeVisible();
		} );

		test( 'rolls the toggle back with a message when the save fails', async () => {
			const user = userEvent.setup();
			nock( 'https://public-api.wordpress.com' )
				.post( '/rest/v1.1/upgrades/1/enable-auto-renew' )
				.reply( 500, { error: 'server_error', message: 'Something went wrong.' } );

			render( <Renewal purchase={ makeDomain( autoRenewOff ) } /> );

			await user.click( await screen.findByRole( 'checkbox', { name: 'Auto-renew off' } ) );

			expect(
				await screen.findByText( 'Auto-renew could not be turned on. Please try again.' )
			).toBeVisible();
			await waitFor( () =>
				expect( screen.getByRole( 'checkbox', { name: 'Auto-renew off' } ) ).not.toBeChecked()
			);
		} );

		test( 'is hidden from someone who does not own the purchase', async () => {
			render( <Renewal purchase={ makeDomain( { user_id: 2 } ) } /> );

			await waitFor( () => expect( screen.queryByText( 'Renewal' ) ).not.toBeInTheDocument() );
			expect( screen.queryByRole( 'checkbox' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'details', () => {
		test( 'shows the site the domain is attached to', async () => {
			const site = {
				ID: 1,
				name: 'Ice Cream Shop',
				options: {},
				site_migration: {},
			} as Site;
			render( <DetailsSection purchase={ makeDomain() } site={ site } /> );

			expect( await screen.findByText( 'Ice Cream Shop' ) ).toBeVisible();
		} );

		test( 'says the domain is not attached when it has no site of its own', async () => {
			const site = { ID: 1, name: 'icecreamshop.com', options: { is_domain_only: true } } as Site;
			render( <DetailsSection purchase={ makeDomain() } site={ site } /> );

			expect( await screen.findByText( 'No site attached' ) ).toBeVisible();
			expect( screen.queryByText( 'icecreamshop.com' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'danger zone', () => {
		test( 'offers to delete the domain', async () => {
			render( <DangerZoneSection purchase={ makeDomain() } /> );

			expect( await screen.findByRole( 'button', { name: 'Delete' } ) ).toBeVisible();
			expect(
				screen.getByText(
					'Remove this domain name permanently. It becomes available for anyone to register.'
				)
			).toBeVisible();
		} );

		test( 'is hidden from someone who does not own the purchase', async () => {
			render( <DangerZoneSection purchase={ makeDomain( { user_id: 2 } ) } /> );

			await waitFor( () =>
				expect( screen.queryByRole( 'button', { name: 'Delete' } ) ).not.toBeInTheDocument()
			);
		} );
	} );
} );

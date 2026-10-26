/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../../test-utils';
import { ManageSubscriptionCard } from '../index';
import type { Purchase } from '@automattic/api-core';

// The rendering wrapper's default user has ID 1, so a purchase owned by user 1
// belongs to the current user.
function makePurchase( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		ID: 1,
		user_id: 1,
		product_name: 'WordPress.com Personal',
		product_slug: 'personal-bundle',
		site_slug: 'example.com',
		is_plan: true,
		is_auto_renew_enabled: false,
		is_rechargeable: false,
		can_disable_auto_renew: false,
		can_reenable_auto_renewal: false,
		subscription_status: 'active',
		expiry_status: 'manual-renew',
		expiry_date: '2027-01-01',
		...overrides,
	} as Purchase;
}

describe( 'auto-renew without a payment method', () => {
	test( 'auto-renew off and un-reenableable offers an add payment method CTA instead of a dead toggle', () => {
		render( <ManageSubscriptionCard purchase={ makePurchase() } /> );

		expect( screen.getByText( 'Auto-renew needs a payment method.' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Add payment method' } ) ).toBeVisible();
		expect(
			screen.queryByRole( 'checkbox', { name: 'Enable auto-renew' } )
		).not.toBeInTheDocument();
	} );

	test( 'auto-renew on without a rechargeable payment method keeps its existing CTA', () => {
		render(
			<ManageSubscriptionCard
				purchase={ makePurchase( {
					is_auto_renew_enabled: true,
					expiry_status: 'auto-renewing',
				} ) }
			/>
		);

		expect( screen.getByText( 'Auto-renew needs a payment method.' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Add payment method' } ) ).toBeVisible();
	} );

	test( 'an in-app purchase gets no CTA, since its payment method lives in the app store', () => {
		render(
			<ManageSubscriptionCard
				purchase={ makePurchase( { is_auto_renew_enabled: true, is_iap_purchase: true } ) }
			/>
		);

		expect( screen.queryByText( 'Auto-renew needs a payment method.' ) ).not.toBeInTheDocument();
		expect(
			screen.queryByRole( 'button', { name: 'Add payment method' } )
		).not.toBeInTheDocument();
	} );

	test( 'a re-enableable purchase keeps the toggle, so the CTA does not take over', () => {
		render(
			<ManageSubscriptionCard
				purchase={ makePurchase( { can_reenable_auto_renewal: true, is_rechargeable: true } ) }
			/>
		);

		expect( screen.getByRole( 'checkbox', { name: 'Enable auto-renew' } ) ).toBeVisible();
		expect( screen.queryByText( 'Auto-renew needs a payment method.' ) ).not.toBeInTheDocument();
	} );
} );

describe( 'auto-renew turned on event', () => {
	const EVENT = 'calypso_purchases_auto_renew_enabled';
	const offPurchase = makePurchase( { can_reenable_auto_renewal: true, is_rechargeable: true } );

	// The toggle stays disabled until the request settles.
	// It remounts on every render, so query it fresh.
	async function waitForRequestToSettle( scope: nock.Scope ) {
		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		await waitFor( () =>
			expect( screen.getByRole( 'checkbox', { name: 'Enable auto-renew' } ) ).toBeEnabled()
		);
	}

	test( 'turning auto-renew on records the event once, with the purchase ID and slug', async () => {
		const scope = nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/upgrades/1/enable-auto-renew' )
			.reply( 200, { success: true, upgrade: { ID: 1 } } );
		const { recordTracksEvent } = render( <ManageSubscriptionCard purchase={ offPurchase } /> );

		await userEvent.click( screen.getByRole( 'checkbox', { name: 'Enable auto-renew' } ) );

		await waitFor( () =>
			expect( recordTracksEvent ).toHaveBeenCalledWith( EVENT, {
				purchase_id: 1,
				product_slug: 'personal-bundle',
			} )
		);
		expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
		expect( scope.isDone() ).toBe( true );
	} );

	test( 'records nothing when the request fails', async () => {
		const scope = nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/upgrades/1/enable-auto-renew' )
			.reply( 500, { error: 'server_error', message: 'Auto-renew could not be turned on.' } );
		const { recordTracksEvent } = render( <ManageSubscriptionCard purchase={ offPurchase } /> );

		await userEvent.click( screen.getByRole( 'checkbox', { name: 'Enable auto-renew' } ) );

		await waitForRequestToSettle( scope );
		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );

	test( 'records nothing when a 200 reply says success is false', async () => {
		const scope = nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/upgrades/1/enable-auto-renew' )
			.reply( 200, { success: false, upgrade: { ID: 1 } } );
		const { recordTracksEvent } = render( <ManageSubscriptionCard purchase={ offPurchase } /> );

		await userEvent.click( screen.getByRole( 'checkbox', { name: 'Enable auto-renew' } ) );

		await waitForRequestToSettle( scope );
		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );

	test( 'records nothing when auto-renew is turned off', async () => {
		const scope = nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/upgrades/1/disable-auto-renew' )
			.reply( 200, { success: true, upgrade: { ID: 1 } } );
		const { recordTracksEvent } = render(
			<ManageSubscriptionCard
				purchase={ makePurchase( {
					is_auto_renew_enabled: true,
					can_disable_auto_renew: true,
					is_rechargeable: true,
					expiry_status: 'auto-renewing',
				} ) }
			/>
		);

		await userEvent.click( screen.getByRole( 'checkbox', { name: 'Enable auto-renew' } ) );

		await waitForRequestToSettle( scope );
		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );
} );

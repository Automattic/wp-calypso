/**
 * @vitest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../../test-utils';
import { ManageSubscriptionCard } from '../index';
import type { Purchase } from '@automattic/api-core';

const API = 'https://public-api.wordpress.com';

const purchase = {
	ID: 1,
	user_id: 1,
	product_name: 'example.com',
	product_slug: 'dotcom_domain',
	is_auto_renew_enabled: false,
	is_rechargeable: true,
	can_disable_auto_renew: true,
	can_reenable_auto_renewal: true,
	subscription_status: 'active',
	expiry_status: 'manual-renew',
	expiry_date: '2027-02-01T12:00:00+00:00',
} as Purchase;

// Holds the response until `release` is called, so the test can check the in-flight state
// without `nock.delay()`, which leaves open handles.
const mockEnableAutoRenewPending = () => {
	let release!: () => void;
	const pending = new Promise< void >( ( resolve ) => {
		release = resolve;
	} );
	const scope = nock( API )
		.post( '/rest/v1.1/upgrades/1/enable-auto-renew' )
		.reply( 200, () => pending.then( () => ( { success: true, upgrade: {} } ) ) );
	return { scope, release };
};

describe( '<ManageSubscriptionCard />', () => {
	test( 'turns the toggle on and disables it while auto-renew is being enabled', async () => {
		const { scope, release } = mockEnableAutoRenewPending();

		render( <ManageSubscriptionCard purchase={ purchase } /> );

		const getToggle = () => screen.getByRole( 'checkbox', { name: 'Enable auto-renew' } );
		expect( getToggle() ).not.toBeChecked();

		await userEvent.click( getToggle() );

		await waitFor( () => expect( getToggle() ).toBeChecked() );
		expect( getToggle() ).toBeDisabled();
		// The rest of the card keeps the confirmed state until the purchase is refetched.
		expect( screen.getByText( 'Expires on February 1, 2027.' ) ).toBeVisible();

		release();

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		await waitFor( () => expect( getToggle() ).toBeEnabled() );
	} );
} );

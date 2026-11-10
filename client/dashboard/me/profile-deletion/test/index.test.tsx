/**
 * @vitest-environment jsdom
 */

import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import AccountDeletionSection from '../index';
import type { User } from '@automattic/api-core';

function mockPurchases( purchases: object[] = [], monetizeSubscriptions: object[] = [] ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/upgrades' )
		.reply( 200, purchases )
		.get( '/rest/v1.1/me/memberships/subscriptions' )
		.reply( 200, { subscriptions: monetizeSubscriptions } );
}

const DASHBOARD_URL = 'https://my.wordpress.com/me/account';

async function openConfirmation( user: UserEvent ) {
	mockPurchases();

	await user.click( screen.getByRole( 'button', { name: 'Delete account' } ) );
	await screen.findByRole( 'dialog', { name: 'Are you sure?' } );

	await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );
	await screen.findByRole( 'dialog', { name: 'Confirm account deletion' } );
}

async function confirmDeletion( user: UserEvent ) {
	await openConfirmation( user );

	await user.type( screen.getByRole( 'textbox' ), 'testuser' );
	await user.click( screen.getByRole( 'button', { name: 'Delete account' } ) );
}

describe( '<AccountDeletionSection>', () => {
	describe( 'alternatives screen', () => {
		test( 'shows alternatives', async () => {
			const user = userEvent.setup();
			mockPurchases();

			render( <AccountDeletionSection />, {
				user: { username: 'testuser', site_count: 2 } as User,
			} );

			await user.click( screen.getByRole( 'button', { name: 'Delete account' } ) );

			await screen.findByRole( 'dialog', { name: 'Are you sure?' } );
			expect( screen.getByText( 'Change your site’s address' ) ).toBeVisible();
			expect( screen.getByText( 'Delete a site' ) ).toBeVisible();
			expect( screen.getByText( 'Start a new site' ) ).toBeVisible();
		} );

		test( 'closes modal when Cancel is clicked', async () => {
			const user = userEvent.setup();
			mockPurchases();

			render( <AccountDeletionSection /> );

			await user.click( screen.getByRole( 'button', { name: 'Delete account' } ) );
			await screen.findByRole( 'dialog', { name: 'Are you sure?' } );

			await user.click( screen.getByRole( 'button', { name: 'Cancel' } ) );

			expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'confirmation screen', () => {
		const originalLocation = window.location;

		// The router reads the path, search and hash when it is created.
		beforeEach( () => {
			Object.defineProperty( window, 'location', {
				writable: true,
				value: {
					href: DASHBOARD_URL,
					origin: 'https://my.wordpress.com',
					pathname: '/me/account',
					search: '',
					hash: '',
				},
			} );
		} );

		afterEach( () => {
			Object.defineProperty( window, 'location', { writable: true, value: originalLocation } );
		} );

		test( 'requires the username before the account can be deleted', async () => {
			const user = userEvent.setup();
			render( <AccountDeletionSection /> );

			await openConfirmation( user );

			expect( screen.getByRole( 'button', { name: 'Delete account' } ) ).toBeDisabled();

			await user.type( screen.getByRole( 'textbox' ), 'testuser' );

			expect( screen.getByRole( 'button', { name: 'Delete account' } ) ).toBeEnabled();
		} );

		test( 'leaves for the account-closed page with the restore token', async () => {
			const user = userEvent.setup();
			render( <AccountDeletionSection /> );
			nock( 'https://public-api.wordpress.com' )
				.post( '/rest/v1.1/me/account/close' )
				.reply( 200, { success: true, token: 'restore-token' } );

			await confirmDeletion( user );

			await waitFor( () =>
				expect( window.location.href ).toBe(
					'https://wordpress.com/me/account/closed?token=restore-token'
				)
			);
		} );

		test( 'leaves for the account-closed page when no restore token comes back', async () => {
			const user = userEvent.setup();
			render( <AccountDeletionSection /> );
			nock( 'https://public-api.wordpress.com' )
				.post( '/rest/v1.1/me/account/close' )
				.reply( 200, { success: true } );

			await confirmDeletion( user );

			await waitFor( () =>
				expect( window.location.href ).toBe( 'https://wordpress.com/me/account/closed' )
			);
		} );

		test( 'still leaves when the section is gone before the account is closed', async () => {
			const user = userEvent.setup();
			const { unmount } = render( <AccountDeletionSection /> );
			let respond = () => {};
			const unmounted = new Promise< void >( ( resolve ) => {
				respond = resolve;
			} );
			nock( 'https://public-api.wordpress.com' )
				.post( '/rest/v1.1/me/account/close' )
				.reply( async () => {
					await unmounted;
					return [ 200, { success: true, token: 'restore-token' } ];
				} );

			await confirmDeletion( user );
			unmount();
			respond();

			await waitFor( () =>
				expect( window.location.href ).toBe(
					'https://wordpress.com/me/account/closed?token=restore-token'
				)
			);
		} );

		test( 'stays on the page and lets the user retry when the account cannot be closed', async () => {
			const user = userEvent.setup();
			render( <AccountDeletionSection /> );
			const scope = nock( 'https://public-api.wordpress.com' )
				.post( '/rest/v1.1/me/account/close' )
				.reply( 403, { error: 'atomic-site', message: 'Cannot close this account.' } );

			await confirmDeletion( user );

			await waitFor( () => expect( scope.isDone() ).toBe( true ) );
			await waitFor( () =>
				expect( screen.getByRole( 'button', { name: 'Delete account' } ) ).toBeEnabled()
			);
			expect( window.location.href ).toBe( DASHBOARD_URL );
		} );
	} );

	describe( 'active purchases', () => {
		test( 'blocks deletion when user has active purchases', async () => {
			const user = userEvent.setup();
			mockPurchases( [
				{
					expiry_status: 'active',
					subscription_status: 'active',
					product_slug: 'pro_plan',
					is_refundable: true,
					is_cancelable: true,
				},
			] );

			render( <AccountDeletionSection /> );

			await user.click( screen.getByRole( 'button', { name: 'Delete account' } ) );

			expect(
				await screen.findByText( 'You still have active purchases on your account.' )
			).toBeVisible();
		} );

		test( 'blocks deletion when user has an expired purchase still in its grace period', async () => {
			const user = userEvent.setup();
			mockPurchases( [
				{
					expiry_status: 'expired',
					subscription_status: 'active',
					product_slug: 'pro_plan',
					is_refundable: false,
					is_cancelable: true,
				},
			] );

			render( <AccountDeletionSection /> );

			await user.click( screen.getByRole( 'button', { name: 'Delete account' } ) );

			expect(
				await screen.findByText( 'You still have active purchases on your account.' )
			).toBeVisible();
		} );

		test( 'does not block deletion when the only purchase has been removed', async () => {
			const user = userEvent.setup();
			mockPurchases( [
				{
					expiry_status: 'expired',
					subscription_status: 'inactive',
					product_slug: 'pro_plan',
					is_refundable: false,
					is_cancelable: true,
				},
			] );

			render( <AccountDeletionSection /> );

			await user.click( screen.getByRole( 'button', { name: 'Delete account' } ) );

			// A removed purchase is not "cancelable", so the user proceeds to the
			// alternatives screen rather than being blocked.
			await screen.findByRole( 'dialog', { name: 'Are you sure?' } );
			expect(
				screen.queryByText( 'You still have active purchases on your account.' )
			).not.toBeInTheDocument();
		} );

		test( 'blocks deletion when user has a renewable newsletter subscription', async () => {
			const user = userEvent.setup();
			mockPurchases( [], [ { ID: '1', status: 'active', is_renewable: true } ] );

			render( <AccountDeletionSection /> );

			await user.click( screen.getByRole( 'button', { name: 'Delete account' } ) );

			expect(
				await screen.findByText( 'You still have active purchases on your account.' )
			).toBeVisible();
		} );

		test( 'does not block deletion when the newsletter subscription does not renew', async () => {
			const user = userEvent.setup();
			mockPurchases( [], [ { ID: '1', status: 'active', is_renewable: false } ] );

			render( <AccountDeletionSection /> );

			await user.click( screen.getByRole( 'button', { name: 'Delete account' } ) );

			await screen.findByRole( 'dialog', { name: 'Are you sure?' } );
			expect(
				screen.queryByText( 'You still have active purchases on your account.' )
			).not.toBeInTheDocument();
		} );
	} );
} );

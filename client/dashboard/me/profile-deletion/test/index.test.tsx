/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import AccountDeletionSection from '../index';
import type { User } from '@automattic/api-core';

function mockPurchases( purchases: object[] = [] ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/upgrades' )
		.reply( 200, purchases );
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
		test( 'confirms and submits account deletion', async () => {
			const user = userEvent.setup();
			mockPurchases();

			render( <AccountDeletionSection /> );

			await user.click( screen.getByRole( 'button', { name: 'Delete account' } ) );
			await screen.findByRole( 'dialog', { name: 'Are you sure?' } );

			await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );
			await screen.findByRole( 'dialog', { name: 'Confirm account deletion' } );

			const deleteButton = screen.getByRole( 'button', { name: 'Delete account' } );
			expect( deleteButton ).toBeDisabled();

			await user.type( screen.getByRole( 'textbox' ), 'testuser' );

			const scope = nock( 'https://public-api.wordpress.com' )
				.post( '/rest/v1.1/me/account/close' )
				.reply( 200, { success: true } );

			await user.click( screen.getByRole( 'button', { name: 'Delete account' } ) );

			await waitFor( () => {
				expect( scope.isDone() ).toBe( true );
			} );
		} );
	} );

	describe( 'active purchases', () => {
		test( 'blocks deletion when user has active purchases', async () => {
			const user = userEvent.setup();
			mockPurchases( [
				{
					expiry_status: 'active',
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
	} );
} );

/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../../test-utils';
import { CancelScheduledDowngradeDialog } from '../cancel-scheduled-downgrade-dialog';
import type { Purchase } from '@automattic/api-core';

function makePurchase( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		ID: 123,
		product_name: 'WordPress.com Business',
		product_slug: 'business-bundle',
		is_plan: true,
		scheduled_downgrade_product_id: 1009,
		scheduled_downgrade_product_slug: 'value_bundle',
		scheduled_downgrade_renewal_date: '2026-07-15T00:00:00+00:00',
		...overrides,
	} as Purchase;
}

describe( '<CancelScheduledDowngradeDialog />', () => {
	afterEach( () => {
		nock.cleanAll();
	} );

	test( 'renders title, body copy, and both buttons', async () => {
		render(
			<CancelScheduledDowngradeDialog
				purchase={ makePurchase() }
				currentPlanTitle="Business"
				isOpen
				onClose={ jest.fn() }
			/>
		);

		expect(
			await screen.findByRole( 'dialog', { name: /keep your current plan/i } )
		).toBeVisible();
		expect( screen.getByText( /Your Business plan will stay active/i ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: /keep my plan/i } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: /not now/i } ) ).toBeVisible();
	} );

	test( 'calls cancel mutation on confirm and closes on success', async () => {
		const user = userEvent.setup();
		const onClose = jest.fn();

		nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/upgrades/123/cancel-scheduled-downgrade' )
			.reply( 200, { success: true } );

		render(
			<CancelScheduledDowngradeDialog
				purchase={ makePurchase() }
				currentPlanTitle="Business"
				isOpen
				onClose={ onClose }
			/>
		);

		const confirmButton = await screen.findByRole( 'button', { name: /keep my plan/i } );
		await user.click( confirmButton );

		await waitFor( () => {
			expect( onClose ).toHaveBeenCalled();
		} );
	} );

	test( 'Keep schedule button calls onClose', async () => {
		const user = userEvent.setup();
		const onClose = jest.fn();

		render(
			<CancelScheduledDowngradeDialog
				purchase={ makePurchase() }
				currentPlanTitle="Business"
				isOpen
				onClose={ onClose }
			/>
		);

		const keepButton = await screen.findByRole( 'button', { name: /not now/i } );
		await user.click( keepButton );

		expect( onClose ).toHaveBeenCalled();
	} );

	test( 'returns null when not open', () => {
		const { container } = render(
			<CancelScheduledDowngradeDialog
				purchase={ makePurchase() }
				currentPlanTitle="Business"
				isOpen={ false }
				onClose={ jest.fn() }
			/>
		);

		expect( container ).toBeEmptyDOMElement();
	} );
} );

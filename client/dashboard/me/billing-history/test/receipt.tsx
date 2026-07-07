/**
 * @jest-environment jsdom
 */
import { screen, within } from '@testing-library/react';
import { render } from '../../../test-utils';
import { ReceiptItemDiscounts } from '../receipt';
import type { ReceiptItem, ReceiptItemCostOverride, User } from '@automattic/api-core';

// Recent receipt date so the discount rows render.
const RECEIPT_DATE = '2026-05-21T00:00:00+00:00';
const testUser = { ID: 1, username: 'testuser', language: 'en' } as User;

function makeItem( costOverride: Partial< ReceiptItemCostOverride > ): ReceiptItem {
	return {
		currency: 'USD',
		introductory_offer_terms: null,
		months_per_renewal_interval: 24,
		amount_integer: 0,
		cost_overrides: [
			{
				human_readable_reason: 'Free domain for first year',
				override_code: 'coupon-discount',
				does_override_original_cost: false,
				...costOverride,
			},
		],
	} as unknown as ReceiptItem;
}

describe( '<ReceiptItemDiscounts>', () => {
	test( 'shows the volume-adjusted subtotals changing from struck old total to new total', () => {
		// Real receipt 118392995: unit 15.00 -> 7.50, volume 2, subtotal 30.00 -> 15.00.
		const item = makeItem( {
			old_price_integer: 1500,
			new_price_integer: 750,
			old_subtotal_integer: 3000,
			new_subtotal_integer: 1500,
		} );

		render( <ReceiptItemDiscounts item={ item } receiptDate={ RECEIPT_DATE } />, {
			user: testUser,
		} );

		const row = screen.getByRole( 'listitem' );
		expect( within( row ).getByText( '$30' ).tagName ).toBe( 'S' ); // struck old total
		expect( row ).toHaveTextContent( '$15' ); // new total
	} );

	test( 'shows the stored subtotal, never price * volume', () => {
		// First-unit-only discount where the subtotal is not price * volume: unit
		// 20.00 -> 12.00, volume 3, subtotal 60.00 -> 52.00 (price * volume would be $36).
		const item = makeItem( {
			old_price_integer: 2000,
			new_price_integer: 1200,
			old_subtotal_integer: 6000,
			new_subtotal_integer: 5200,
		} );

		render( <ReceiptItemDiscounts item={ item } receiptDate={ RECEIPT_DATE } />, {
			user: testUser,
		} );

		const row = screen.getByRole( 'listitem' );
		expect( within( row ).getByText( '$60' ).tagName ).toBe( 'S' );
		expect( row ).toHaveTextContent( '$52' );
	} );

	test( 'renders the plain discount-amount line for a single-unit override (no struck totals)', () => {
		// Volume-1 / legacy case: no volume-adjusted subtotals, so the display is
		// unchanged - the signed savings amount (15.00 - 7.50 = -7.50),
		// not the struck old/new totals.
		const item = makeItem( {
			old_price_integer: 1500,
			new_price_integer: 750,
		} );

		render( <ReceiptItemDiscounts item={ item } receiptDate={ RECEIPT_DATE } />, {
			user: testUser,
		} );

		const row = screen.getByRole( 'listitem' );
		expect( row ).toHaveTextContent( '-$7.50' );
		expect( row ).not.toHaveTextContent( '$15' ); // no struck old total
	} );
} );

/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import { Provider as ReduxProvider } from 'react-redux';
import { createTestReduxStore } from 'calypso/my-sites/checkout/src/test/util';
import { ReceiptItemDiscounts } from '../receipt';
import type { BillingTransactionItem } from 'calypso/state/billing-transactions/types';

// Recent receipt date so the discount rows render.
const RECEIPT_DATE = '2026-05-21T00:00:00+00:00';

function makeItem( costOverride: Record< string, unknown > ): BillingTransactionItem {
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
	} as unknown as BillingTransactionItem;
}

function renderDiscounts( item: BillingTransactionItem ) {
	const store = createTestReduxStore();
	const queryClient = new QueryClient();
	return render(
		<ReduxProvider store={ store }>
			<QueryClientProvider client={ queryClient }>
				<ReceiptItemDiscounts item={ item } receiptDate={ RECEIPT_DATE } />
			</QueryClientProvider>
		</ReduxProvider>
	);
}

describe( '<ReceiptItemDiscounts>', () => {
	test( 'shows the volume-adjusted subtotals changing from struck old total to new total', () => {
		// Real receipt 118392995: unit 15.00 -> 7.50, volume 2, subtotal 30.00 -> 15.00.
		renderDiscounts(
			makeItem( {
				old_price_integer: 1500,
				new_price_integer: 750,
				old_subtotal_integer: 3000,
				new_subtotal_integer: 1500,
			} )
		);

		const row = screen.getByRole( 'listitem' );
		expect( within( row ).getByText( '$30' ).tagName ).toBe( 'S' ); // struck old total
		expect( row ).toHaveTextContent( '$15' ); // new total
	} );

	test( 'shows the stored subtotal, never price * volume', () => {
		// First-unit-only discount where the subtotal is not price * volume: unit
		// 20.00 -> 12.00, volume 3, subtotal 60.00 -> 52.00 (price * volume would be $36).
		renderDiscounts(
			makeItem( {
				old_price_integer: 2000,
				new_price_integer: 1200,
				old_subtotal_integer: 6000,
				new_subtotal_integer: 5200,
			} )
		);

		const row = screen.getByRole( 'listitem' );
		expect( within( row ).getByText( '$60' ).tagName ).toBe( 'S' );
		expect( row ).toHaveTextContent( '$52' );
	} );

	test( 'renders the plain discount-amount line for a single-unit override (no struck totals)', () => {
		// Volume-1 / legacy case: no volume-adjusted subtotals, so the display is
		// unchanged - the signed savings amount (15.00 - 7.50 = -7.50),
		// not the struck old/new totals.
		renderDiscounts(
			makeItem( {
				old_price_integer: 1500,
				new_price_integer: 750,
			} )
		);

		const row = screen.getByRole( 'listitem' );
		expect( row ).toHaveTextContent( '-$7.50' );
		expect( row ).not.toHaveTextContent( '$15' ); // no struck old total
	} );
} );

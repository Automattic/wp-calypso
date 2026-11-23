/**
 * @vitest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { render } from '../../../../test-utils';
import PayoutCards from '../payout-cards';

const ESTIMATE_EXPLANATION = /active use for the current month/;
const MINIMUM_PAYOUT_NOTE =
	'If your commissions for a payout come to less than $50, we carry them over to the next payout until your total reaches $50.';
const PREVIOUS_QUARTER_INFO = 'Learn more about Estimated earnings in previous quarter';
const CURRENT_QUARTER_INFO =
	/Learn more about Estimated (earnings in current quarter|current quarter earnings to date)/;

function renderPayoutCards( isWooPayments: boolean ) {
	return render(
		<PayoutCards
			isFetching={ false }
			previousQuarterExpectedCommission={ 9.87 }
			currentQuarterExpectedCommission={ 250.75 }
			isWooPayments={ isWooPayments }
		/>
	);
}

async function openPopover( name: string | RegExp ) {
	await userEvent.click( screen.getByRole( 'button', { name } ) );
	// The popover positions itself before its content becomes visible.
	await waitFor( () => expect( screen.getByText( MINIMUM_PAYOUT_NOTE ) ).toBeVisible() );
}

describe( '<PayoutCards>', () => {
	beforeEach( () => {
		// Mid-November: the previous quarter has closed and its payout is still pending, so both cards show.
		vi.useFakeTimers( { toFake: [ 'Date' ] } );
		vi.setSystemTime( new Date( '2026-11-20T12:00:00Z' ) );
	} );

	afterEach( () => {
		vi.useRealTimers();
	} );

	describe.each( [
		{ page: 'Referrals', isWooPayments: false },
		{ page: 'WooPayments', isWooPayments: true },
	] )( 'on the $page page', ( { isWooPayments } ) => {
		test( 'the previous quarter popover leaves out the current-month estimate and explains the $50 minimum', async () => {
			renderPayoutCards( isWooPayments );

			await openPopover( PREVIOUS_QUARTER_INFO );

			expect( screen.getByText( 'Payout range:' ) ).toBeVisible();
			expect( screen.getByText( 'Payout date:' ) ).toBeVisible();
			expect( screen.queryByText( ESTIMATE_EXPLANATION ) ).not.toBeInTheDocument();
		} );

		test( 'the current quarter popover keeps the current-month estimate and explains the $50 minimum', async () => {
			renderPayoutCards( isWooPayments );

			await openPopover( CURRENT_QUARTER_INFO );

			expect( screen.getByText( ESTIMATE_EXPLANATION ) ).toBeVisible();
		} );
	} );
} );

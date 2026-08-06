/**
 * @jest-environment jsdom
 */
import { SubscriptionBillPeriod } from '@automattic/api-core';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockDate from 'mockdate';
import { render } from '../../../test-utils';
import { PurchaseExpiryStatus } from '../index';
import type { Purchase } from '@automattic/api-core';

// The copy counts whole calendar days in the viewer's time zone, so these
// assertions only hold against a fixed clock.
const NOW = '2026-02-24T18:00:00Z';

const daysFromNow = ( days: number ) => {
	const date = new Date( NOW );
	date.setUTCDate( date.getUTCDate() + days );
	return date.toISOString();
};

const OWNER_ID = 1;

const createPurchase = ( overrides: Partial< Purchase > = {} ): Purchase =>
	( {
		ID: 123,
		user_id: OWNER_ID,
		product_slug: 'business-bundle',
		product_name: 'Business',
		product_type: 'bundle',
		amount: 300,
		expiry_status: 'manual-renew',
		subscription_status: 'active',
		expiry_date: daysFromNow( 45 ),
		bill_period_days: SubscriptionBillPeriod.PLAN_ANNUAL_PERIOD,
		can_explicit_renew: true,
		is_renewable: true,
		is_locked: false,
		is_attached_to_holding_site: false,
		...overrides,
	} ) as Purchase;

const renewLink = () => screen.queryByRole( 'link' );

describe( '<PurchaseExpiryStatus>', () => {
	beforeEach( () => MockDate.set( NOW ) );
	afterEach( () => MockDate.reset() );

	test( 'says only when a distant expiry falls due', () => {
		render(
			<PurchaseExpiryStatus purchase={ createPurchase( { expiry_date: daysFromNow( 90 ) } ) } />
		);

		expect( screen.getByText( /expires on/i ) ).toBeVisible();
		expect( screen.queryByText( /expires in/i ) ).toBeNull();
		expect( renewLink() ).toBeNull();
	} );

	test( 'counts the days exactly rather than rounding to months', () => {
		render( <PurchaseExpiryStatus purchase={ createPurchase() } /> );

		expect( screen.getByText( /expires in 45 days/i ) ).toBeVisible();
		expect( screen.queryByText( /1 month/i ) ).toBeNull();
	} );

	test( 'offers renewal, named for what the reader can see', () => {
		render( <PurchaseExpiryStatus purchase={ createPurchase() } /> );

		const link = screen.getByRole( 'link' );
		expect( link ).toHaveTextContent( 'Expires in 45 days' );
		expect( link ).toHaveAttribute( 'title', 'Expires on April 10, 2026 (renew this purchase)' );
	} );

	test( 'records the renewal click where it happened', async () => {
		const user = userEvent.setup();
		const { recordTracksEvent } = render( <PurchaseExpiryStatus purchase={ createPurchase() } /> );

		await user.click( screen.getByRole( 'link' ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_purchases_renew_now_click', {
			product_slug: 'business-bundle',
			position: 'purchase-list',
		} );
	} );

	test( 'says how long ago an expired purchase lapsed, and still offers renewal', () => {
		render(
			<PurchaseExpiryStatus
				purchase={ createPurchase( { expiry_status: 'expired', expiry_date: daysFromNow( -3 ) } ) }
			/>
		);

		expect( screen.getByText( /expired 3 days ago/i ) ).toBeVisible();
		expect( renewLink() ).toBeVisible();
	} );

	describe( 'a monthly subscription', () => {
		const monthly = { bill_period_days: SubscriptionBillPeriod.PLAN_MONTHLY_PERIOD };

		test( 'is flagged well before it lapses, but not yet worth renewing', () => {
			render(
				<PurchaseExpiryStatus
					purchase={ createPurchase( { ...monthly, expiry_date: daysFromNow( 20 ) } ) }
				/>
			);

			expect( screen.getByText( /expires in 20 days/i ) ).toBeVisible();
			expect( renewLink() ).toBeNull();
		} );

		test( 'can be renewed once it is nearly up', () => {
			render(
				<PurchaseExpiryStatus
					purchase={ createPurchase( { ...monthly, expiry_date: daysFromNow( 5 ) } ) }
				/>
			);

			expect( renewLink() ).toBeVisible();
		} );
	} );

	describe( 'a purchase the viewer cannot renew', () => {
		test.each( [
			[ 'is not theirs', { user_id: OWNER_ID + 1 } ],
			[ 'cannot be explicitly renewed', { can_explicit_renew: false } ],
		] )( 'is still flagged, but offers nothing to click, when it %s', ( _label, overrides ) => {
			render(
				<PurchaseExpiryStatus purchase={ createPurchase( overrides as Partial< Purchase > ) } />
			);

			expect( screen.getByText( /expires in 45 days/i ) ).toBeVisible();
			expect( renewLink() ).toBeNull();
		} );
	} );
} );

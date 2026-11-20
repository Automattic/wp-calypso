/**
 * @vitest-environment jsdom
 */
import { SubscriptionBillPeriod } from '@automattic/api-core';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockDate from 'mockdate';
import { render } from '../../../test-utils';
import { PurchaseExpiryStatus, getPurchaseExpiryStatusText } from '../index';
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
		expect( screen.queryByText( /expires in/i ) ).not.toBeInTheDocument();
		expect( renewLink() ).not.toBeInTheDocument();
	} );

	test( 'counts the days exactly rather than rounding to months', () => {
		render( <PurchaseExpiryStatus purchase={ createPurchase() } /> );

		expect( screen.getByText( /expires in 45 days/i ) ).toBeVisible();
		expect( screen.queryByText( /1 month/i ) ).not.toBeInTheDocument();
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
			expect( renewLink() ).not.toBeInTheDocument();
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

	describe( 'a free trial', () => {
		const freeTrial = ( overrides: Partial< Purchase > = {} ) =>
			createPurchase( {
				expiry_status: 'manual-renew',
				expiry_date: daysFromNow( 30 ),
				introductory_offer: {
					cost_per_interval: 0,
					end_date: daysFromNow( 30 ),
					is_within_period: true,
				},
				...overrides,
			} as Partial< Purchase > );

		test( 'is described by when the trial runs out', () => {
			render( <PurchaseExpiryStatus purchase={ freeTrial() } /> );

			expect( screen.getByText( /free trial ends on march 26, 2026/i ) ).toBeVisible();
		} );

		test( 'is described by its expiry once an early renewal has paid past the trial', () => {
			render(
				<PurchaseExpiryStatus purchase={ freeTrial( { expiry_date: daysFromNow( 395 ) } ) } />
			);

			expect( screen.queryByText( /free trial/i ) ).not.toBeInTheDocument();
			expect( screen.getByText( /expires on/i ) ).toBeVisible();
			expect( screen.getByText( 'March 26, 2027' ) ).toBeVisible();
		} );

		test( 'is described by its renewal once an early renewal has paid past the trial', () => {
			render(
				<PurchaseExpiryStatus
					purchase={ freeTrial( {
						expiry_status: 'active',
						expiry_date: daysFromNow( 395 ),
						renew_date: daysFromNow( 395 ),
						price_integer: 3500,
						currency_code: 'USD',
					} ) }
				/>
			);

			expect( screen.queryByText( /free trial/i ) ).not.toBeInTheDocument();
			expect( screen.getByText( /renews yearly at \$35/i ) ).toBeVisible();
		} );
	} );

	describe( 'a renewal that failed', () => {
		const failedRenewal = ( overrides: Partial< Purchase > = {} ) =>
			createPurchase( {
				expiry_status: 'auto-renewing',
				is_past_first_auto_renew_attempt_date: true,
				might_still_auto_renew: true,
				renew_date: daysFromNow( 3 ),
				price_integer: 3500,
				currency_code: 'USD',
				...overrides,
			} );

		test( 'says so before its expiry, rather than that it renews', () => {
			render( <PurchaseExpiryStatus purchase={ failedRenewal() } /> );

			expect( screen.getByText( 'Payment failed, retrying on February 27, 2026' ) ).toBeVisible();
			expect( screen.queryByText( /renews yearly/i ) ).not.toBeInTheDocument();
		} );

		test( 'says so after its expiry, rather than that it expired', () => {
			render(
				<PurchaseExpiryStatus
					purchase={ failedRenewal( { expiry_status: 'expired', expiry_date: daysFromNow( -3 ) } ) }
				/>
			);

			expect( screen.getByText( 'Payment failed, retrying on February 27, 2026' ) ).toBeVisible();
			expect( screen.queryByText( /expired/i ) ).not.toBeInTheDocument();
		} );

		test( 'still says a retry is coming when its date is unknown', () => {
			render(
				<PurchaseExpiryStatus
					purchase={ failedRenewal( {
						expiry_status: 'expired',
						expiry_date: daysFromNow( -3 ),
						renew_date: '',
					} ) }
				/>
			);

			expect( screen.getByText( 'Payment failed, we’ll retry' ) ).toBeVisible();
		} );

		test( 'reads as expired once no attempts are left', () => {
			render(
				<PurchaseExpiryStatus
					purchase={ failedRenewal( {
						expiry_status: 'expired',
						expiry_date: daysFromNow( -3 ),
						might_still_auto_renew: false,
						is_past_last_auto_renew_attempt_date: true,
					} ) }
				/>
			);

			expect( screen.getByText( /expired 3 days ago/i ) ).toBeVisible();
			expect( screen.queryByText( /payment failed/i ) ).not.toBeInTheDocument();
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
			expect( renewLink() ).not.toBeInTheDocument();
		} );
	} );
} );

describe( 'getPurchaseExpiryStatusText()', () => {
	beforeEach( () => MockDate.set( NOW ) );
	afterEach( () => MockDate.reset() );

	test.each( [
		[ 'an expiring purchase', {}, /expires in 45 days/i ],
		[
			'an expired purchase',
			{ expiry_status: 'expired', expiry_date: daysFromNow( -3 ) },
			/expired 3 days ago/i,
		],
		[
			'an in-app purchase',
			{
				is_iap_purchase: true,
				iap_purchase_management_link: 'https://apps.apple.com/account/subscriptions',
			},
			/in-app purchase/i,
		],
	] )( 'describes %s with nothing to click', ( _label, overrides, text ) => {
		render(
			<>
				{ getPurchaseExpiryStatusText(
					createPurchase( overrides as Partial< Purchase > ),
					'en',
					() => true
				) }
			</>
		);

		expect( screen.getByText( text ) ).toBeVisible();
		expect( renewLink() ).not.toBeInTheDocument();
	} );
} );

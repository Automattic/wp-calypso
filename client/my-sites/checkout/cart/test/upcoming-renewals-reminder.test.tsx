/**
 * @jest-environment jsdom
 */
import { SubscriptionBillPeriod } from '@automattic/api-core';
import { sitePurchasesQuery } from '@automattic/api-queries';
import { getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import moment from 'moment';
import Modal from 'react-modal';
import { Provider as ReduxProvider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';
import { getPlanExpiryUrgency } from 'calypso/dashboard/components/plan-expiry-notice/get-plan-expiry-notice';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { storeData } from 'calypso/my-sites/checkout/src/components/test/lib/fixtures';
import { recordTracksEvent as recordReduxTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import UpcomingRenewalsReminder from '../upcoming-renewals-reminder';
import type { Purchase } from '@automattic/api-core';
import type { PartialCart } from 'calypso/my-sites/checkout/src/components/secondary-cart-promotions';

import 'calypso/my-sites/checkout/src/test/util';

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

// `TrackComponentView` still records through Redux.
jest.mock( 'calypso/state/analytics/actions', () => ( {
	recordTracksEvent: jest.fn( ( name, props ) => ( {
		type: 'ANALYTICS_EVENT_RECORD',
		name,
		props,
	} ) ),
	bumpStat: jest.fn( () => ( { type: 'ANALYTICS_STAT_BUMP' } ) ),
} ) );

jest.mock( 'calypso/state/preferences/actions', () => ( {
	savePreference: jest.fn( ( key, value ) => ( { type: 'PREFERENCE_SET', key, value } ) ),
	setPreference: jest.fn( ( key, value ) => ( { type: 'PREFERENCE_SET', key, value } ) ),
} ) );

const mockRecordTracksEvent = recordTracksEvent as unknown as jest.Mock;
const mockSavePreference = savePreference as unknown as jest.Mock;

const SITE_ID = 123;
const URGENT_DOMAIN_NAME = 'urgent-domain-1234.live';
const NON_URGENT_PLAN_NAME = 'WordPress.com Personal';

// Shaped like what `fetchSitePurchases` resolves to: `normalizePurchase` has
// already turned the API's numeric strings and "true" strings into numbers and
// booleans by the time a component sees them.
function urgentDomainPurchase( overrides = {} ) {
	return {
		ID: 10,
		user_id: 123,
		blog_id: SITE_ID,
		product_id: 74,
		product_name: '.live Domain Registration',
		product_slug: 'dotlive_domain',
		product_type: 'domain_reg',
		is_domain_registration: true,
		meta: URGENT_DOMAIN_NAME,
		domain: 'userpersonalsitetest1234.wordpress.com',
		subscription_status: 'active',
		amount: 500,
		currency_code: 'USD',
		currency_symbol: '$',
		expiry_date: moment().add( 2, 'days' ).format(),
		expiry_status: 'expiring',
		days_until_expiry: 2,
		is_cancelable: true,
		can_explicit_renew: true,
		is_renewable: true,
		is_renewal: false,
		is_rechargeable: true,
		...overrides,
	};
}

function nonUrgentPlanPurchase( overrides = {} ) {
	return {
		ID: 20,
		user_id: 123,
		blog_id: SITE_ID,
		product_id: 1009,
		product_name: NON_URGENT_PLAN_NAME,
		product_slug: 'personal-bundle',
		product_type: 'bundle',
		meta: '',
		domain: 'userpersonalsitetest1234.wordpress.com',
		subscription_status: 'active',
		amount: 540,
		currency_code: 'USD',
		currency_symbol: '$',
		expiry_date: moment().add( 60, 'days' ).format(),
		expiry_status: 'expiring',
		days_until_expiry: 60,
		is_cancelable: true,
		can_explicit_renew: true,
		is_renewable: true,
		is_renewal: false,
		is_rechargeable: true,
		...overrides,
	};
}

function expiringIn( days: number ) {
	return { expiry_date: moment().add( days, 'days' ).format(), days_until_expiry: days };
}

// An annual WordPress.com plan with auto-renew off: getPlanExpiryUrgency is
// 'warning' from 8 to 60 days out and 'info' beyond.
function expiringPlanPurchase( days: number, overrides = {} ) {
	return nonUrgentPlanPurchase( {
		is_plan: true,
		is_jetpack_plan_or_product: false,
		bill_period_days: SubscriptionBillPeriod.PLAN_ANNUAL_PERIOD,
		is_auto_renew_enabled: false,
		might_still_auto_renew: false,
		is_past_first_auto_renew_attempt_date: false,
		is_past_last_auto_renew_attempt_date: false,
		...expiringIn( days ),
		...overrides,
	} );
}

function renewalCart( purchaseId: number ): PartialCart {
	return {
		products: [
			{
				...getEmptyResponseCartProduct(),
				subscription_id: String( purchaseId ),
				is_renewal: true,
			},
		],
	};
}

type PreferencesState = { remoteValues: Record< string, boolean > | null };
const PREFS_LOADED: PreferencesState = { remoteValues: {} };
const PREFS_NOT_LOADED: PreferencesState = { remoteValues: null };
const dismissedPrefs = ( ...ids: number[] ): PreferencesState => ( {
	remoteValues: {
		[ `dismissible-card-checkout-urgent-renewals-${ ids.join( '-' ) }` ]: true,
	},
} );

function renderReminder( {
	purchases,
	preferences = PREFS_LOADED,
	cart = { products: [] },
	addItemToCart = jest.fn(),
}: {
	purchases: Record< string, unknown >[];
	preferences?: PreferencesState;
	cart?: PartialCart;
	addItemToCart?: jest.Mock;
} ) {
	const reducer = () => ( { ...storeData(), preferences } );
	const store = applyMiddleware( thunk )( createStore )( reducer );
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { staleTime: Infinity, retry: false } },
	} );
	queryClient.setQueryData(
		sitePurchasesQuery( SITE_ID ).queryKey,
		purchases as unknown as Purchase[]
	);
	const ui = ( nextCart: PartialCart ) => (
		<QueryClientProvider client={ queryClient }>
			<ReduxProvider store={ store }>
				<UpcomingRenewalsReminder cart={ nextCart } addItemToCart={ addItemToCart } />
			</ReduxProvider>
		</QueryClientProvider>
	);
	const result = render( ui( cart ) );
	return {
		...result,
		addItemToCart,
		rerenderWithCart: ( nextCart: PartialCart ) => result.rerender( ui( nextCart ) ),
	};
}

describe( 'UpcomingRenewalsReminder', () => {
	beforeAll( () => {
		const appRoot = document.createElement( 'div' );
		document.body.appendChild( appRoot );
		Modal.setAppElement( appRoot );
	} );

	beforeEach( () => {
		mockRecordTracksEvent.mockClear();
		mockSavePreference.mockClear();
	} );

	describe( 'urgent auto-open', () => {
		test( 'auto-opens the dialog on mount without a user click', async () => {
			renderReminder( { purchases: [ urgentDomainPurchase() ] } );
			expect( await screen.findByText( 'Upcoming renewals' ) ).toBeVisible();
		} );

		test( 'lists only the urgent subset, not the non-urgent renewable purchases', async () => {
			renderReminder( { purchases: [ urgentDomainPurchase(), nonUrgentPlanPurchase() ] } );
			expect( await screen.findByText( 'Upcoming renewals' ) ).toBeVisible();
			const dialog = screen.getByRole( 'dialog' );
			expect( within( dialog ).getByText( URGENT_DOMAIN_NAME ) ).toBeVisible();
			expect( within( dialog ).queryByText( NON_URGENT_PLAN_NAME ) ).not.toBeInTheDocument();
		} );

		test( 'fires the impression event once on auto-open', async () => {
			renderReminder( { purchases: [ urgentDomainPurchase() ] } );
			expect( await screen.findByText( 'Upcoming renewals' ) ).toBeVisible();
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_checkout_urgent_renewals_modal_impression',
				{ urgent_count: 1 }
			);
			const impressions = mockRecordTracksEvent.mock.calls.filter(
				( [ name ]: [ string ] ) => name === 'calypso_checkout_urgent_renewals_modal_impression'
			);
			expect( impressions ).toHaveLength( 1 );
		} );

		test( 'confirming adds the urgent purchase to the cart via the renewal item path', async () => {
			const { addItemToCart } = renderReminder( { purchases: [ urgentDomainPurchase() ] } );
			expect( await screen.findByText( 'Upcoming renewals' ) ).toBeVisible();
			const dialog = screen.getByRole( 'dialog' );
			await userEvent.click( within( dialog ).getByRole( 'button', { name: 'Add to cart' } ) );
			expect( addItemToCart ).toHaveBeenCalledWith(
				expect.objectContaining( {
					product_slug: 'dotlive_domain',
					extra: expect.objectContaining( { purchaseId: 10 } ),
				} )
			);
			await waitFor( () =>
				expect( screen.queryByText( 'Upcoming renewals' ) ).not.toBeInTheDocument()
			);
		} );

		test( 'does not re-fire the impression when the effect re-runs (run-once guard)', async () => {
			const { rerenderWithCart } = renderReminder( { purchases: [ urgentDomainPurchase() ] } );
			expect( await screen.findByText( 'Upcoming renewals' ) ).toBeVisible();
			// A fresh cart reference re-runs the auto-open effect (urgentPurchases is
			// recomputed). The hasAutoOpened ref must stop a second open + impression.
			rerenderWithCart( { products: [] } );
			const impressions = mockRecordTracksEvent.mock.calls.filter(
				( [ name ]: [ string ] ) => name === 'calypso_checkout_urgent_renewals_modal_impression'
			);
			expect( impressions ).toHaveLength( 1 );
		} );
	} );

	describe( 'dismissal', () => {
		test( 'closing the auto-opened dialog persists the per-set dismissal via dismissCard', async () => {
			renderReminder( { purchases: [ urgentDomainPurchase() ] } );
			expect( await screen.findByText( 'Upcoming renewals' ) ).toBeVisible();
			const dialog = screen.getByRole( 'dialog' );
			await userEvent.click( within( dialog ).getByRole( 'button', { name: 'Cancel' } ) );
			expect( savePreference ).toHaveBeenCalledWith(
				'dismissible-card-checkout-urgent-renewals-10',
				true
			);
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_checkout_urgent_renewals_modal_dismiss'
			);
		} );

		test( 'a previously-dismissed same set does not auto-open', async () => {
			renderReminder( {
				purchases: [ urgentDomainPurchase() ],
				preferences: dismissedPrefs( 10 ),
			} );
			await expect( screen.findByText( 'Upcoming renewals' ) ).toNeverAppear();
		} );

		test( 'a new urgent set auto-opens even after a different set was dismissed', async () => {
			renderReminder( {
				purchases: [ urgentDomainPurchase( { ID: 11 } ) ],
				preferences: dismissedPrefs( 10 ),
			} );
			expect( await screen.findByText( 'Upcoming renewals' ) ).toBeVisible();
		} );
	} );

	describe( 'preferences load gate', () => {
		test( 'does not auto-open until preferences have loaded', async () => {
			renderReminder( {
				purchases: [ urgentDomainPurchase() ],
				preferences: PREFS_NOT_LOADED,
			} );
			await expect( screen.findByText( 'Upcoming renewals' ) ).toNeverAppear();
		} );

		test( 'auto-opens once preferences load and this key is absent', async () => {
			renderReminder( {
				purchases: [ urgentDomainPurchase() ],
				preferences: PREFS_LOADED,
			} );
			expect( await screen.findByText( 'Upcoming renewals' ) ).toBeVisible();
		} );
	} );

	describe( 'regressions', () => {
		test( 'no urgent purchases means no auto-open, but the quiet box still renders', async () => {
			renderReminder( { purchases: [ nonUrgentPlanPurchase() ] } );
			expect( await screen.findByText( 'Renew your products together' ) ).toBeVisible();
			expect( screen.queryByText( 'Upcoming renewals' ) ).not.toBeInTheDocument();
		} );

		test( 'the quiet box renders with a renewable purchase present', async () => {
			renderReminder( { purchases: [ nonUrgentPlanPurchase() ] } );
			expect( await screen.findByText( 'Renew your products together' ) ).toBeVisible();
			expect( recordReduxTracksEvent ).toHaveBeenCalledWith(
				'calypso_checkout_upcoming_renewals_impression',
				undefined
			);
		} );

		test( 'the manual link lists all renewable purchases, diverging from the urgent path', async () => {
			renderReminder( {
				purchases: [ urgentDomainPurchase(), nonUrgentPlanPurchase() ],
				preferences: dismissedPrefs( 10 ),
			} );
			await userEvent.click( await screen.findByText( 'other upgrades' ) );
			expect( await screen.findByText( 'Upcoming renewals' ) ).toBeVisible();
			const dialog = screen.getByRole( 'dialog' );
			expect( within( dialog ).getByText( URGENT_DOMAIN_NAME ) ).toBeVisible();
			expect( within( dialog ).getByText( NON_URGENT_PLAN_NAME ) ).toBeVisible();
		} );
	} );

	describe( 'urgent classification', () => {
		test( 'excludes a perpetual purchase with no expiry (daysUntilExpiry null)', async () => {
			renderReminder( { purchases: [ nonUrgentPlanPurchase( { days_until_expiry: null } ) ] } );
			await expect( screen.findByText( 'Upcoming renewals' ) ).toNeverAppear();
		} );

		test( 'includes a purchase 9 days from expiry', async () => {
			renderReminder( { purchases: [ nonUrgentPlanPurchase( { days_until_expiry: 9 } ) ] } );
			expect( await screen.findByText( 'Upcoming renewals' ) ).toBeVisible();
		} );

		test( 'excludes a purchase exactly 10 days from expiry', async () => {
			renderReminder( { purchases: [ nonUrgentPlanPurchase( { days_until_expiry: 10 } ) ] } );
			await expect( screen.findByText( 'Upcoming renewals' ) ).toNeverAppear();
		} );

		test( 'includes an expired purchase in its grace period (negative daysUntilExpiry)', async () => {
			renderReminder( {
				purchases: [ nonUrgentPlanPurchase( { expiry_status: 'expired', days_until_expiry: -5 } ) ],
			} );
			expect( await screen.findByText( 'Upcoming renewals' ) ).toBeVisible();
		} );
	} );

	describe( 'outside the 10-day window', () => {
		const warningPlan = () => expiringPlanPurchase( 14 );
		const infoPlan = () => expiringPlanPurchase( 200 );
		const domain = () => urgentDomainPurchase( expiringIn( 20 ) );

		// Auto-renew on and the first renewal attempt is still ahead, so the urgency is null.
		const autoRenewingPlan = () =>
			expiringPlanPurchase( 14, { is_auto_renew_enabled: true, might_still_auto_renew: true } );

		// Auto-renew on but the first renewal attempt already failed, so the urgency is 'warning'.
		const failingAutoRenewPlan = () =>
			expiringPlanPurchase( 14, {
				is_auto_renew_enabled: true,
				might_still_auto_renew: true,
				is_past_first_auto_renew_attempt_date: true,
			} );
		const domainExpiringIn = ( days: number, overrides = {} ) =>
			urgentDomainPurchase( { ...expiringIn( days ), ...overrides } );

		// A monthly add-on with auto-renew on, which the API returns as 'active'
		// until its last 10 days.
		const addOnExpiringIn = ( days: number ) =>
			nonUrgentPlanPurchase( {
				ID: 30,
				product_name: 'Jetpack Backup Add-on Storage (10GB)',
				product_slug: 'jetpack_backup_addon_storage_10gb_monthly',
				product_type: 'jetpack',
				bill_period_days: SubscriptionBillPeriod.PLAN_MONTHLY_PERIOD,
				is_auto_renew_enabled: true,
				expiry_status: 'active',
				...expiringIn( days ),
			} );

		test( 'plan fixtures resolve to warning and info urgency', () => {
			expect( getPlanExpiryUrgency( warningPlan() as unknown as Purchase ) ).toBe( 'warning' );
			expect( getPlanExpiryUrgency( infoPlan() as unknown as Purchase ) ).toBe( 'info' );
		} );

		test( 'failing auto-renew and 5-day plan fixtures resolve to warning and error urgency', () => {
			expect( getPlanExpiryUrgency( failingAutoRenewPlan() as unknown as Purchase ) ).toBe(
				'warning'
			);
			expect( getPlanExpiryUrgency( expiringPlanPurchase( 5 ) as unknown as Purchase ) ).toBe(
				'error'
			);
		} );

		test( 'auto-renewing plan fixture resolves to null urgency', () => {
			expect( getPlanExpiryUrgency( autoRenewingPlan() as unknown as Purchase ) ).toBeNull();
		} );

		test( 'auto-opens for a domain expiring soon after the plan being renewed', async () => {
			renderReminder( {
				purchases: [ failingAutoRenewPlan(), domain() ],
				cart: renewalCart( 20 ),
			} );
			expect( await screen.findByText( 'Upcoming renewals' ) ).toBeVisible();
			const dialog = screen.getByRole( 'dialog' );
			expect( within( dialog ).getByText( URGENT_DOMAIN_NAME ) ).toBeVisible();
		} );

		test( 'auto-opens when the plan being renewed is in the error window', async () => {
			renderReminder( {
				purchases: [ expiringPlanPurchase( 5 ), domainExpiringIn( 12 ) ],
				cart: renewalCart( 20 ),
			} );
			expect( await screen.findByText( 'Upcoming renewals' ) ).toBeVisible();
		} );

		test( 'keeps the dialog closed for a domain expiring far beyond the plan', async () => {
			renderReminder( {
				purchases: [ warningPlan(), domainExpiringIn( 90 ) ],
				cart: renewalCart( 20 ),
			} );
			expect( await screen.findByText( 'Renew your products together' ) ).toBeVisible();
			await expect( screen.findByText( 'Upcoming renewals' ) ).toNeverAppear();
		} );

		test( 'includes a domain expiring 7 days after the plan', async () => {
			renderReminder( {
				purchases: [ warningPlan(), domainExpiringIn( 21 ) ],
				cart: renewalCart( 20 ),
			} );
			expect( await screen.findByText( 'Upcoming renewals' ) ).toBeVisible();
		} );

		test( 'excludes a domain expiring 8 days after the plan', async () => {
			renderReminder( {
				purchases: [ warningPlan(), domainExpiringIn( 22 ) ],
				cart: renewalCart( 20 ),
			} );
			expect( await screen.findByText( 'Renew your products together' ) ).toBeVisible();
			await expect( screen.findByText( 'Upcoming renewals' ) ).toNeverAppear();
		} );

		test( 'includes a domain 60 days from expiry when renewing a plan 58 days out', async () => {
			renderReminder( {
				purchases: [ expiringPlanPurchase( 58 ), domainExpiringIn( 60 ) ],
				cart: renewalCart( 20 ),
			} );
			expect( await screen.findByText( 'Upcoming renewals' ) ).toBeVisible();
		} );

		test( 'excludes a domain 61 days from expiry even within 7 days of the plan', async () => {
			renderReminder( {
				purchases: [ expiringPlanPurchase( 58 ), domainExpiringIn( 61 ) ],
				cart: renewalCart( 20 ),
			} );
			expect( await screen.findByText( 'Renew your products together' ) ).toBeVisible();
			await expect( screen.findByText( 'Upcoming renewals' ) ).toNeverAppear();
		} );

		test( 'measures the window from the soonest-expiring plan being renewed', async () => {
			renderReminder( {
				purchases: [
					warningPlan(),
					expiringPlanPurchase( 50, { ID: 21 } ),
					domainExpiringIn( 25 ),
				],
				cart: { products: [ ...renewalCart( 20 ).products, ...renewalCart( 21 ).products ] },
			} );
			expect( await screen.findByText( 'Renew your products together' ) ).toBeVisible();
			await expect( screen.findByText( 'Upcoming renewals' ) ).toNeverAppear();
		} );

		test( 'lists purchases from the 10-day window and near the plan together, each once', async () => {
			const otherDomainName = 'other-domain-1234.live';
			renderReminder( {
				purchases: [
					warningPlan(),
					domainExpiringIn( 5 ),
					domainExpiringIn( 20, { ID: 11, meta: otherDomainName } ),
				],
				cart: renewalCart( 20 ),
			} );
			expect( await screen.findByText( 'Upcoming renewals' ) ).toBeVisible();
			const dialog = screen.getByRole( 'dialog' );
			expect( within( dialog ).getAllByRole( 'checkbox' ) ).toHaveLength( 2 );
			expect( within( dialog ).getByText( URGENT_DOMAIN_NAME ) ).toBeVisible();
			expect( within( dialog ).getByText( otherDomainName ) ).toBeVisible();
		} );

		test( 'includes a purchase within 10 days that expires over a week after the plan', async () => {
			renderReminder( {
				purchases: [ expiringPlanPurchase( 1 ), domainExpiringIn( 9 ) ],
				cart: renewalCart( 20 ),
			} );
			expect( await screen.findByText( 'Upcoming renewals' ) ).toBeVisible();
		} );

		test( 'closing the dialog dismisses a set expiring near the plan', async () => {
			renderReminder( {
				purchases: [ warningPlan(), domain() ],
				cart: renewalCart( 20 ),
			} );
			expect( await screen.findByText( 'Upcoming renewals' ) ).toBeVisible();
			const dialog = screen.getByRole( 'dialog' );
			await userEvent.click( within( dialog ).getByRole( 'button', { name: 'Cancel' } ) );
			expect( savePreference ).toHaveBeenCalledWith(
				'dismissible-card-checkout-urgent-renewals-10',
				true
			);
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_checkout_urgent_renewals_modal_dismiss'
			);
		} );

		test( 'auto-opens when another purchase near the plan joins a dismissed set', async () => {
			renderReminder( {
				purchases: [ warningPlan(), domain(), domainExpiringIn( 21, { ID: 11 } ) ],
				cart: renewalCart( 20 ),
				preferences: dismissedPrefs( 10 ),
			} );
			expect( await screen.findByText( 'Upcoming renewals' ) ).toBeVisible();
		} );

		test( 'keeps the dialog closed when the cart has no renewal', async () => {
			renderReminder( { purchases: [ warningPlan(), domain() ] } );
			expect( await screen.findByText( 'Renew your products together' ) ).toBeVisible();
			await expect( screen.findByText( 'Upcoming renewals' ) ).toNeverAppear();
		} );

		test( 'keeps the dialog closed for a warning-urgency plan when renewing a domain', async () => {
			renderReminder( {
				purchases: [ warningPlan(), domain() ],
				cart: renewalCart( 10 ),
			} );
			expect( await screen.findByText( 'Renew your products together' ) ).toBeVisible();
			await expect( screen.findByText( 'Upcoming renewals' ) ).toNeverAppear();
		} );

		test( 'auto-opens for a domain expiring soon when renewing an info-urgency plan', async () => {
			renderReminder( {
				purchases: [ infoPlan(), domain() ],
				cart: renewalCart( 20 ),
			} );
			expect( await screen.findByText( 'Upcoming renewals' ) ).toBeVisible();
			const dialog = screen.getByRole( 'dialog' );
			expect( within( dialog ).getByText( URGENT_DOMAIN_NAME ) ).toBeVisible();
		} );

		test( 'keeps the dialog closed for a domain when renewing an auto-renewing plan', async () => {
			renderReminder( {
				purchases: [ autoRenewingPlan(), domain() ],
				cart: renewalCart( 20 ),
			} );
			expect( await screen.findByText( 'Renew your products together' ) ).toBeVisible();
			await expect( screen.findByText( 'Upcoming renewals' ) ).toNeverAppear();
		} );

		test( 'lists a warning-urgency plan near the plan being renewed', async () => {
			const otherPlanName = 'WordPress.com Premium';
			renderReminder( {
				purchases: [
					warningPlan(),
					expiringPlanPurchase( 18, {
						ID: 21,
						product_name: otherPlanName,
						product_slug: 'value_bundle',
					} ),
				],
				cart: renewalCart( 20 ),
			} );
			expect( await screen.findByText( 'Upcoming renewals' ) ).toBeVisible();
			const dialog = screen.getByRole( 'dialog' );
			expect( within( dialog ).getByText( otherPlanName ) ).toBeVisible();
		} );

		test( 'includes an auto-renewing purchase within 10 days of expiry', async () => {
			renderReminder( {
				purchases: [
					warningPlan(),
					domainExpiringIn( 5, { is_auto_renew_enabled: true, expiry_status: 'auto-renewing' } ),
				],
				cart: renewalCart( 20 ),
			} );
			expect( await screen.findByText( 'Upcoming renewals' ) ).toBeVisible();
		} );

		test( 'keeps the dialog closed for an auto-renewing monthly add-on near the plan', async () => {
			renderReminder( {
				purchases: [ warningPlan(), addOnExpiringIn( 20 ) ],
				cart: renewalCart( 20 ),
			} );
			expect( await screen.findByText( 'Renew your products together' ) ).toBeVisible();
			await expect( screen.findByText( 'Upcoming renewals' ) ).toNeverAppear();
		} );

		test( 'keeps the dialog closed for an auto-renewing annual domain near the plan', async () => {
			renderReminder( {
				purchases: [
					expiringPlanPurchase( 50 ),
					domainExpiringIn( 55, {
						bill_period_days: SubscriptionBillPeriod.PLAN_ANNUAL_PERIOD,
						is_auto_renew_enabled: true,
						expiry_status: 'auto-renewing',
					} ),
				],
				cart: renewalCart( 20 ),
			} );
			expect( await screen.findByText( 'Renew your products together' ) ).toBeVisible();
			await expect( screen.findByText( 'Upcoming renewals' ) ).toNeverAppear();
		} );
	} );
} );

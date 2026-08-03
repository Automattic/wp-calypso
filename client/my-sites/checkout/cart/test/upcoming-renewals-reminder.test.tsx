/**
 * @jest-environment jsdom
 */
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import moment from 'moment';
import Modal from 'react-modal';
import { Provider as ReduxProvider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';
import { storeData } from 'calypso/my-sites/checkout/src/components/test/lib/fixtures';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import UpcomingRenewalsReminder from '../upcoming-renewals-reminder';
import type { PartialCart } from 'calypso/my-sites/checkout/src/components/secondary-cart-promotions';

import 'calypso/my-sites/checkout/src/test/util';

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

const URGENT_DOMAIN_NAME = 'urgent-domain-1234.live';
const NON_URGENT_PLAN_NAME = 'WordPress.com Personal';

function urgentDomainPurchase( overrides = {} ) {
	return {
		ID: '10',
		user_id: '123',
		blog_id: '123',
		product_id: '74',
		product_name: '.live Domain Registration',
		product_slug: 'dotlive_domain',
		product_type: 'domain_reg',
		is_domain_registration: 'true',
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
		ID: '20',
		user_id: '123',
		blog_id: '123',
		product_id: '1009',
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
	const reducer = () => ( {
		...storeData(),
		purchases: { ...storeData().purchases, data: purchases },
		preferences,
	} );
	const store = applyMiddleware( thunk )( createStore )( reducer );
	const ui = ( nextCart: PartialCart ) => (
		<ReduxProvider store={ store }>
			<UpcomingRenewalsReminder cart={ nextCart } addItemToCart={ addItemToCart } />
		</ReduxProvider>
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
				purchases: [ urgentDomainPurchase( { ID: '11' } ) ],
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
			expect( recordTracksEvent ).toHaveBeenCalledWith(
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
} );

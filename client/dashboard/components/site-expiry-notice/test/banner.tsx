/**
 * @jest-environment jsdom
 */

import { DotcomPlans, SubscriptionBillPeriod } from '@automattic/api-core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockDate from 'mockdate';
import nock from 'nock';
import { getPlanExpiryNotice } from '../../plan-expiry-notice';
import { SiteExpiryNoticeBanner } from '../banner';
import type { SiteExpiryNoticeState } from '../use-site-expiry-notice';
import type { Purchase } from '@automattic/api-core';
import type { ComponentProps } from 'react';

const NOW = '2026-02-24T12:00:00Z';
const SITE_ID = 99;

function expiryInDays( days: number ): string {
	return new Date( Date.UTC( 2026, 1, 24 + days, 12 ) ).toISOString();
}

function makePurchase( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		ID: 1234,
		blog_id: SITE_ID,
		product_slug: DotcomPlans.BUSINESS,
		product_name: 'WordPress.com Business',
		site_slug: 'example.wordpress.com',
		expiry_date: expiryInDays( 3 ),
		expiry_status: 'manual-renew',
		subscription_status: 'active',
		is_plan: true,
		is_jetpack_plan_or_product: false,
		bill_period_days: SubscriptionBillPeriod.PLAN_ANNUAL_PERIOD,
		is_auto_renew_enabled: false,
		is_rechargeable: true,
		might_still_auto_renew: false,
		is_past_first_auto_renew_attempt_date: false,
		is_past_last_auto_renew_attempt_date: false,
		...overrides,
	} as Purchase;
}

function makeState( purchase: Purchase, isReverted = false ): SiteExpiryNoticeState {
	const notice = getPlanExpiryNotice( purchase, { scope: 'sitewide', locale: 'en', isReverted } );
	if ( ! notice?.stage ) {
		throw new Error( 'fixture produces no notice' );
	}
	const stage = notice.stage;
	return {
		purchase,
		stage,
		isDismissible: stage === 'post-grace',
		isReverted,
		isPlanOwner: true,
		dismissMetaKey: stage === 'post-grace' ? 'wp_wpcom_plan_expiry_notice_dismiss' : undefined,
	};
}

const postGrace = () =>
	makePurchase( {
		expiry_date: expiryInDays( -40 ),
		expiry_status: 'expired',
		subscription_status: 'inactive',
	} );

const grace = () =>
	makePurchase( {
		expiry_date: expiryInDays( -5 ),
		expiry_status: 'expired',
		subscription_status: 'active',
	} );

function renderBanner(
	state: SiteExpiryNoticeState,
	extra: Partial< ComponentProps< typeof SiteExpiryNoticeBanner > > = {}
) {
	const recordTracksEvent = jest.fn();
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	} );
	render(
		<QueryClientProvider client={ queryClient }>
			<SiteExpiryNoticeBanner
				siteId={ SITE_ID }
				state={ state }
				locale="en"
				surface="test"
				recordTracksEvent={ recordTracksEvent }
				{ ...extra }
			/>
		</QueryClientProvider>
	);
	return { recordTracksEvent };
}

beforeEach( () => MockDate.set( NOW ) );
afterEach( () => {
	MockDate.reset();
	nock.cleanAll();
} );

test( 'renders the notice without a close button before post-grace', () => {
	renderBanner( makeState( makePurchase() ) );
	expect( screen.getByText( 'Your Business plan expires in 3 days' ) ).toBeVisible();
	expect( screen.queryByRole( 'button', { name: 'Dismiss' } ) ).not.toBeInTheDocument();
} );

test( 'dismisses post-grace: hides at once, writes the meta, records the event', async () => {
	const scope = nock( 'https://public-api.wordpress.com' )
		.post( `/wp/v2/sites/${ SITE_ID }/users/me`, {
			meta: { wp_wpcom_plan_expiry_notice_dismiss: 1 },
		} )
		.query( true )
		.reply( 200, {
			id: 1,
			name: 'me',
			slug: 'me',
			meta: { wp_wpcom_plan_expiry_notice_dismiss: 1 },
		} );

	const { recordTracksEvent } = renderBanner( makeState( postGrace() ) );
	await userEvent.click( screen.getByRole( 'button', { name: 'Dismiss' } ) );

	expect( screen.queryByText( 'Your Business plan has expired' ) ).not.toBeInTheDocument();
	await waitFor( () => expect( scope.isDone() ).toBe( true ) );
	expect( recordTracksEvent ).toHaveBeenCalledWith(
		'calypso_purchases_plan_expiry_notice_dismiss',
		expect.objectContaining( {
			surface: 'test',
			purchase_id: 1234,
			product_slug: DotcomPlans.BUSINESS,
			stage: 'post-grace',
			state: 'expired',
			is_plan_owner: true,
			days_remaining: -40,
		} )
	);
} );

test( 'restores the notice when the dismissal fails', async () => {
	nock( 'https://public-api.wordpress.com' )
		.post( `/wp/v2/sites/${ SITE_ID }/users/me` )
		.query( true )
		.reply( 500, { message: 'nope' } );

	const { recordTracksEvent } = renderBanner( makeState( postGrace() ) );
	await userEvent.click( screen.getByRole( 'button', { name: 'Dismiss' } ) );

	await waitFor( () =>
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_purchases_plan_expiry_notice_dismiss_failed',
			expect.objectContaining( {
				surface: 'test',
				purchase_id: 1234,
				product_slug: DotcomPlans.BUSINESS,
				stage: 'post-grace',
				days_remaining: -40,
				error_message: expect.any( String ),
			} )
		)
	);
	expect( screen.getByText( 'Your Business plan has expired' ) ).toBeVisible();
} );

test( 'hands the prefilled message to the contact-support callback', async () => {
	const onContactSupport = jest.fn();
	renderBanner( makeState( postGrace(), true ), { onContactSupport } );
	await userEvent.click( screen.getByRole( 'button', { name: 'Contact support' } ) );
	expect( onContactSupport ).toHaveBeenCalledWith(
		'My Business plan expired and I need your help getting it restored.'
	);
} );

test( 'offers "View other plans" during grace when a URL is given', () => {
	renderBanner( makeState( grace() ), { viewOtherPlansUrl: '/plans/x' } );
	expect( screen.getByRole( 'link', { name: 'View other plans' } ) ).toHaveAttribute(
		'href',
		'/plans/x'
	);
} );

test( 'an un-reverted Atomic site past grace hears the grace copy, not post-grace’s', () => {
	renderBanner( {
		purchase: postGrace(),
		stage: 'grace',
		isDismissible: false,
		isReverted: false,
		isPlanOwner: true,
	} );

	expect(
		screen.getByText(
			'Your site will move to the Free plan. That means losing plugins, custom themes, and 50 GB of storage. But it’s not too late. Renew now to keep your site as it is.'
		)
	).toBeVisible();
	expect( screen.getByRole( 'link', { name: 'Restore site' } ) ).toBeVisible();
	expect( screen.queryByRole( 'link', { name: 'View other plans' } ) ).not.toBeInTheDocument();
} );

test( 'a non-owner state renders the explanation with no actions', () => {
	const state = { ...makeState( postGrace(), true ), isPlanOwner: false };
	renderBanner( state );
	expect( screen.getByText( /purchased by a different WordPress.com account/ ) ).toBeVisible();
	expect( screen.queryByRole( 'button', { name: 'Contact support' } ) ).not.toBeInTheDocument();
} );

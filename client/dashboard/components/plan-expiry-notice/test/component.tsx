/**
 * @jest-environment jsdom
 */
import { DotcomPlans, SubscriptionBillPeriod } from '@automattic/api-core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockDate from 'mockdate';
import { PlanExpiryNotice } from '..';
import type { Purchase } from '@automattic/api-core';
import type { ComponentProps } from 'react';

const NOW = '2026-02-24T12:00:00Z';

function expiryInDays( days: number ): string {
	return new Date( Date.UTC( 2026, 1, 24 + days, 12 ) ).toISOString();
}

function makePurchase( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		ID: 1234,
		blog_id: 99,
		user_id: 7,
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

function renderNotice( extra: Partial< ComponentProps< typeof PlanExpiryNotice > > = {} ) {
	const recordTracksEvent = jest.fn();
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	render(
		<QueryClientProvider client={ queryClient }>
			<PlanExpiryNotice
				purchase={ makePurchase() }
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
afterEach( () => MockDate.reset() );

test( 'sitewide impression carries the aligned properties', () => {
	const { recordTracksEvent } = renderNotice( {
		scope: 'sitewide',
		eventProperties: { page: 'overview' },
	} );
	expect( recordTracksEvent ).toHaveBeenCalledWith(
		'calypso_purchases_plan_expiry_notice_impression',
		expect.objectContaining( {
			surface: 'test',
			page: 'overview',
			purchase_id: 1234,
			product_slug: DotcomPlans.BUSINESS,
			stage: 'final-window',
			state: 'approaching_expiry',
			days_remaining: 3,
			is_plan_owner: true,
			variant: 'error',
		} )
	);
} );

test( 'a re-render with an equal but new eventProperties object does not re-fire the impression', () => {
	const recordTracksEvent = jest.fn();
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	const purchase = makePurchase();

	const { rerender } = render(
		<QueryClientProvider client={ queryClient }>
			<PlanExpiryNotice
				purchase={ purchase }
				locale="en"
				surface="test"
				recordTracksEvent={ recordTracksEvent }
				scope="sitewide"
				eventProperties={ { page: 'overview' } }
			/>
		</QueryClientProvider>
	);

	rerender(
		<QueryClientProvider client={ queryClient }>
			<PlanExpiryNotice
				purchase={ purchase }
				locale="en"
				surface="test"
				recordTracksEvent={ recordTracksEvent }
				scope="sitewide"
				eventProperties={ { page: 'overview' } }
			/>
		</QueryClientProvider>
	);

	expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
	expect( recordTracksEvent ).toHaveBeenCalledWith(
		'calypso_purchases_plan_expiry_notice_impression',
		expect.objectContaining( { page: 'overview' } )
	);
} );

test( 'clicks name the cta beside the action', async () => {
	const { recordTracksEvent } = renderNotice( { scope: 'sitewide' } );
	await userEvent.click( screen.getByRole( 'link', { name: 'Renew now' } ) );
	expect( recordTracksEvent ).toHaveBeenCalledWith(
		'calypso_purchases_plan_expiry_notice_click',
		expect.objectContaining( { action: 'renew', cta: 'primary' } )
	);
} );

test( 'non-owner renders the explanation and no buttons', () => {
	const { recordTracksEvent } = renderNotice( { scope: 'sitewide', isPlanOwner: false } );
	expect( screen.getByText( /purchased by a different WordPress.com account/ ) ).toBeVisible();
	expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
	expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();
	expect( recordTracksEvent ).toHaveBeenCalledWith(
		'calypso_purchases_plan_expiry_notice_impression',
		expect.objectContaining( { is_plan_owner: false } )
	);
} );

test( 'contact support is a button that hands over the message, cta support', async () => {
	const onContactSupport = jest.fn();
	const { recordTracksEvent } = renderNotice( {
		scope: 'sitewide',
		isReverted: true,
		onContactSupport,
		purchase: makePurchase( {
			expiry_date: expiryInDays( -40 ),
			expiry_status: 'expired',
			subscription_status: 'inactive',
		} ),
	} );
	await userEvent.click( screen.getByRole( 'button', { name: 'Contact support' } ) );
	expect( onContactSupport ).toHaveBeenCalledWith(
		'My Business plan expired and I need your help getting it restored.'
	);
	expect( recordTracksEvent ).toHaveBeenCalledWith(
		'calypso_purchases_plan_expiry_notice_click',
		expect.objectContaining( { action: 'contact-support', cta: 'support' } )
	);
} );

test( 'onClose renders the dismiss button', () => {
	const onClose = jest.fn();
	renderNotice( { scope: 'sitewide', onClose } );
	expect( screen.getByRole( 'button', { name: 'Dismiss' } ) ).toBeVisible();
} );

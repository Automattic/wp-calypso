/**
 * @jest-environment jsdom
 */

import { DotcomPlans } from '@automattic/api-core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockDate from 'mockdate';
import nock from 'nock';
import { getPlanExpiryNotice } from '../../plan-expiry-notice';
import {
	NOW,
	SITE_ID,
	expiryInDays,
	grace,
	makePurchase,
	postGrace,
} from '../../plan-expiry-notice/test/fixtures';
import { SiteExpiryNoticeBanner } from '../banner';
import type { SiteExpiryNoticeState } from '../use-site-expiry-notice';
import type { Purchase } from '@automattic/api-core';
import type { ComponentProps } from 'react';

const DISMISS_KEY = 'wp_wpcom_plan_expiry_notice_dismiss';

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
		dismissMetaKey: stage === 'post-grace' ? DISMISS_KEY : undefined,
	};
}

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
	renderBanner( makeState( makePurchase( { expiry_date: expiryInDays( 3 ) } ) ) );
	expect( screen.getByText( 'Your Business plan expires in 3 days' ) ).toBeVisible();
	expect( screen.queryByRole( 'button', { name: 'Dismiss' } ) ).not.toBeInTheDocument();
} );

test( 'dismisses post-grace: hides at once, writes the meta, records the event', async () => {
	const scope = nock( 'https://public-api.wordpress.com' )
		.post( `/wp/v2/sites/${ SITE_ID }/users/me`, { meta: { [ DISMISS_KEY ]: 1 } } )
		.query( true )
		.reply( 200, { id: 1, name: 'me', slug: 'me', meta: { [ DISMISS_KEY ]: 1 } } );

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
	renderBanner( { ...makeState( postGrace(), true ), isPlanOwner: false } );
	expect( screen.getByText( /purchased by a different WordPress.com account/ ) ).toBeVisible();
	expect( screen.queryByRole( 'button', { name: 'Contact support' } ) ).not.toBeInTheDocument();
} );

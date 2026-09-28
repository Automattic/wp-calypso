/**
 * @jest-environment jsdom
 */

import { DotcomPlans } from '@automattic/api-core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render as testingLibraryRender, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockDate from 'mockdate';
import nock from 'nock';
import { render } from '../../../test-utils';
import {
	NOW,
	SITE_ID,
	expiryInDays,
	grace,
	makePurchase,
} from '../../plan-expiry-notice/test/fixtures';
import { SiteExpiryNoticeBanner } from '../banner';
import type { SiteExpiryNoticeState, SiteExpiryPurchaseState } from '../use-site-expiry-notice';
import type { Purchase } from '@automattic/api-core';
import type { ComponentProps } from 'react';

const DISMISS_KEY = 'wp_wpcom_plan_expiry_notice_dismiss';
const REVERTED_AT = Date.UTC( 2026, 1, 14, 12 );

function purchaseState(
	purchase: Purchase,
	stage: 'early-warning' | 'final-window' | 'grace'
): SiteExpiryPurchaseState {
	return { kind: 'purchase', purchase, stage, isPlanOwner: true };
}

function revertedState( dismissMetaKey: string | undefined = DISMISS_KEY ): SiteExpiryNoticeState {
	return { kind: 'reverted', revertedAt: REVERTED_AT, dismissMetaKey };
}

function renderBanner(
	state: SiteExpiryNoticeState,
	extra: Partial< ComponentProps< typeof SiteExpiryNoticeBanner > > = {}
) {
	const recordTracksEvent = jest.fn();
	const onContactSupport = jest.fn();
	render(
		<SiteExpiryNoticeBanner
			siteId={ SITE_ID }
			state={ state }
			locale="en"
			surface="test"
			recordTracksEvent={ recordTracksEvent }
			onContactSupport={ onContactSupport }
			{ ...extra }
		/>
	);
	return { recordTracksEvent, onContactSupport };
}

beforeEach( () => MockDate.set( NOW ) );
afterEach( () => MockDate.reset() );

test( 'a purchase state renders the plan notice with no close button', () => {
	const { recordTracksEvent } = renderBanner(
		purchaseState( makePurchase( { expiry_date: expiryInDays( 3 ) } ), 'final-window' )
	);
	expect( screen.getByText( 'Your Business plan expires in 3 days' ) ).toBeVisible();
	expect( screen.queryByRole( 'button', { name: 'Dismiss' } ) ).not.toBeInTheDocument();
	expect( recordTracksEvent ).toHaveBeenCalledWith(
		'calypso_purchases_plan_expiry_notice_impression',
		expect.objectContaining( {
			surface: 'test',
			purchase_id: 1234,
			product_slug: DotcomPlans.BUSINESS,
			stage: 'final-window',
		} )
	);
} );

test( 'offers "View other plans" during grace when a URL is given', () => {
	renderBanner( purchaseState( grace(), 'grace' ), { viewOtherPlansUrl: '/plans/x' } );
	expect( screen.getByRole( 'link', { name: 'View other plans' } ) ).toHaveAttribute(
		'href',
		'/plans/x'
	);
	expect( screen.getByRole( 'link', { name: 'Renew now' } ) ).toBeVisible();
} );

test( 'a non-owner purchase state renders the explanation with no actions', () => {
	renderBanner( { ...purchaseState( grace(), 'grace' ), isPlanOwner: false } );
	expect( screen.getByText( /purchased by a different WordPress.com account/ ) ).toBeVisible();
	expect( screen.queryByRole( 'link', { name: 'Renew now' } ) ).not.toBeInTheDocument();
} );

test( 'the reverted state renders the generic copy, records an impression, and opens support', async () => {
	const { recordTracksEvent, onContactSupport } = renderBanner( revertedState() );

	expect( screen.getByText( 'Your plan has expired' ) ).toBeVisible();
	expect( screen.getByText( /moved to the Free plan and set to private/ ) ).toBeVisible();
	expect( recordTracksEvent ).toHaveBeenCalledWith(
		'calypso_purchases_plan_expiry_notice_impression',
		{ surface: 'test', stage: 'post-grace', state: 'expired', days_remaining: -10 }
	);

	await userEvent.click( screen.getByRole( 'button', { name: 'Contact support' } ) );
	expect( onContactSupport ).toHaveBeenCalledWith(
		'My plan expired and I need your help getting it restored.'
	);
	expect( recordTracksEvent ).toHaveBeenCalledWith(
		'calypso_purchases_plan_expiry_notice_click',
		expect.objectContaining( { stage: 'post-grace', action: 'contact-support', cta: 'support' } )
	);
} );

test( 'the reverted state records the impression once across re-renders', () => {
	// `render` from test-utils wraps every call in its own fresh provider tree,
	// so its `rerender` unmounts and remounts rather than re-rendering the same
	// instance; render directly here, with just the QueryClientProvider this
	// notice needs, so the same instance survives the rerender.
	const recordTracksEvent = jest.fn();
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	const tree = () => (
		<QueryClientProvider client={ queryClient }>
			<SiteExpiryNoticeBanner
				siteId={ SITE_ID }
				state={ revertedState() }
				locale="en"
				surface="test"
				recordTracksEvent={ recordTracksEvent }
				eventProperties={ { page: 'overview' } }
			/>
		</QueryClientProvider>
	);
	const { rerender } = testingLibraryRender( tree() );
	rerender( tree() );
	expect(
		recordTracksEvent.mock.calls.filter(
			( [ name ] ) => name === 'calypso_purchases_plan_expiry_notice_impression'
		)
	).toHaveLength( 1 );
} );

test( 'without a support handler the reverted notice has no action', () => {
	renderBanner( revertedState(), { onContactSupport: undefined } );
	expect( screen.queryByRole( 'button', { name: 'Contact support' } ) ).not.toBeInTheDocument();
} );

test( 'dismisses the reverted state: hides at once, writes the meta, records the event', async () => {
	const scope = nock( 'https://public-api.wordpress.com' )
		.post( `/wp/v2/sites/${ SITE_ID }/users/me`, { meta: { [ DISMISS_KEY ]: 1 } } )
		.query( true )
		.reply( 200, { id: 1, name: 'me', slug: 'me', meta: { [ DISMISS_KEY ]: 1 } } );

	const { recordTracksEvent } = renderBanner( revertedState() );
	await userEvent.click( screen.getByRole( 'button', { name: 'Dismiss' } ) );

	expect( screen.queryByText( 'Your plan has expired' ) ).not.toBeInTheDocument();
	await waitFor( () => expect( scope.isDone() ).toBe( true ) );
	expect( recordTracksEvent ).toHaveBeenCalledWith(
		'calypso_purchases_plan_expiry_notice_dismiss',
		{ surface: 'test', stage: 'post-grace', state: 'expired', days_remaining: -10 }
	);
} );

test( 'restores the reverted notice when the dismissal fails', async () => {
	nock( 'https://public-api.wordpress.com' )
		.post( `/wp/v2/sites/${ SITE_ID }/users/me` )
		.query( true )
		.reply( 500, { message: 'nope' } );

	const { recordTracksEvent } = renderBanner( revertedState() );
	await userEvent.click( screen.getByRole( 'button', { name: 'Dismiss' } ) );

	await waitFor( () =>
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_purchases_plan_expiry_notice_dismiss_failed',
			expect.objectContaining( { stage: 'post-grace', error_message: expect.any( String ) } )
		)
	);
	expect( screen.getByText( 'Your plan has expired' ) ).toBeVisible();
} );

test( 'without a dismiss key the reverted notice has no close button', () => {
	// Not `revertedState( undefined )`: the default parameter kicks in for an
	// explicit `undefined` argument too, so that call still carries DISMISS_KEY.
	renderBanner( { kind: 'reverted', revertedAt: REVERTED_AT } );
	expect( screen.queryByRole( 'button', { name: 'Dismiss' } ) ).not.toBeInTheDocument();
} );

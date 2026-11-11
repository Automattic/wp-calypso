/**
 * @jest-environment jsdom
 */

import {
	hasPurchaseBeenExtendedQuery,
	plansQuery,
	productsQuery,
	purchaseCancelFeaturesQuery,
	purchaseQuery,
	rawUserPreferencesQuery,
} from '@automattic/api-queries';
import { disable, enable } from '@automattic/calypso-config';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../../test-utils';
import CancelPurchase from '../index';
import type { Purchase } from '@automattic/api-core';

jest.mock( '../../../../app/router/me', () => ( {
	cancelPurchaseRoute: { fullPath: '__root__', useParams: () => ( { purchaseId: '123' } ) },
	purchaseSettingsRoute: { fullPath: '/me/billing/purchases/$purchaseId' },
	purchasesRoute: { to: '/me/billing/purchases' },
} ) );

const purchase = {
	ID: 123,
	blog_id: 456,
	site_slug: 'example.wordpress.com',
	product_name: 'WordPress.com Premium',
	product_slug: 'value_bundle',
	bill_period_days: 365,
	is_plan: true,
	is_cancelable: true,
	is_removable: true,
	can_disable_auto_renew: true,
	is_auto_renew_enabled: false,
	subscription_status: 'active',
	currency_code: 'USD',
	expiry_date: '2027-04-06T00:00:00+00:00',
} as Purchase;

function mockSiteRequests() {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/upgrades' )
		.query( { site: purchase.blog_id } )
		.reply( 200, [] )
		.get( `/rest/v1.1/sites/${ purchase.blog_id }/features` )
		.query( true )
		.reply( 200, { active: [], available: {} } )
		.get( `/rest/v1.1/sites/${ purchase.blog_id }` )
		.query( true )
		.reply( 200, { ID: purchase.blog_id, slug: purchase.site_slug } )
		.get( `/wpcom/v2/sites/${ purchase.blog_id }/atomic/transfers/latest` )
		.query( true )
		.reply( 200, {} )
		.get( `/rest/v1.2/sites/${ purchase.blog_id }/domains` )
		.query( true )
		.reply( 200, { domains: [] } )
		.get( '/wpcom/v2/cancellation-offers' )
		.query( true )
		.reply( 200, [] );
}

function mockHasExtended( status: number, body: object ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( `/wpcom/v2/upgrades/${ purchase.ID }/has-extended` )
		.reply( status, body );
}

function renderRemoveFlow( {
	purchase: testPurchase = purchase,
	seedHasExtended = true,
}: { purchase?: Purchase; seedHasExtended?: boolean } = {} ) {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false, staleTime: Infinity } },
	} );
	queryClient.setQueryData( purchaseQuery( purchase.ID ).queryKey, testPurchase );
	queryClient.setQueryData( plansQuery().queryKey, [] );
	queryClient.setQueryData( purchaseCancelFeaturesQuery( purchase.ID ).queryKey, [] );
	queryClient.setQueryData( productsQuery().queryKey, {} );
	queryClient.setQueryData( rawUserPreferencesQuery().queryKey, {} );
	if ( seedHasExtended ) {
		queryClient.setQueryData( hasPurchaseBeenExtendedQuery( purchase.ID ).queryKey, false );
	}
	mockSiteRequests();

	return render( <CancelPurchase />, { queryClient } );
}

// The offer is decided when the reason is chosen, so let the check finish first.
async function waitForCheck( check: nock.Scope, queryClient: QueryClient ) {
	await waitFor( () => {
		expect( check.isDone() ).toBe( true );
		expect( queryClient.isFetching() ).toBe( 0 );
	} );
}

async function startSurvey( user: ReturnType< typeof userEvent.setup > ) {
	await user.click( await screen.findByRole( 'checkbox' ) );
	await user.click( screen.getByRole( 'button', { name: 'Continue removal' } ) );
}

async function pickFoundBetterValue( user: ReturnType< typeof userEvent.setup > ) {
	await startSurvey( user );
	await user.click( await screen.findByRole( 'radio', { name: 'Too expensive' } ) );
	await user.click(
		screen.getByRole( 'radio', { name: 'I found a competitor with better pricing/value' } )
	);
	await user.click( screen.getByRole( 'button', { name: 'Continue removal' } ) );
}

const optionsListName = 'Before canceling, you can consider these options:';

const findOptions = () => screen.findByRole( 'list', { name: optionsListName } );

describe( '<CancelPurchase />', () => {
	beforeEach( () => {
		window.history.replaceState( {}, '', '/?intent=remove' );
	} );

	describe( 'with the cards flag on', () => {
		beforeAll( () => {
			enable( 'purchases/cancel-options-cards' );
		} );

		afterAll( () => {
			disable( 'purchases/cancel-options-cards' );
		} );

		test( 'shows Ask AI and Support for "Another reason" with text typed', async () => {
			const user = userEvent.setup();
			const { recordTracksEvent } = renderRemoveFlow();
			await startSurvey( user );

			await user.click( await screen.findByRole( 'radio', { name: 'Another reason…' } ) );
			await user.type(
				screen.getByRole( 'textbox', { name: 'Can you please specify?' } ),
				'test reason'
			);
			await user.click( screen.getByRole( 'button', { name: 'Continue removal' } ) );

			const options = await findOptions();
			expect(
				within( options ).getByRole( 'button', { name: /Ask WordPress Agent/ } )
			).toBeVisible();
			expect(
				within( options ).getByRole( 'button', { name: /Speak with our support team/ } )
			).toBeVisible();
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_cancellation_solution_cards_view',
				expect.objectContaining( {
					solution_ids: 'ask-ai-assistant,speak-with-support',
					cancellation_reason: 'anotherReasonOne',
				} )
			);
		} );

		test( 'shows Ask AI and Support for a "Something else" answer with text typed', async () => {
			const user = userEvent.setup();
			const { recordTracksEvent } = renderRemoveFlow();
			await startSurvey( user );

			await user.click( await screen.findByRole( 'radio', { name: 'Too expensive' } ) );
			await user.click(
				screen.getByRole( 'radio', { name: 'Something else related to price/value' } )
			);
			await user.type(
				screen.getByRole( 'textbox', { name: 'Can you please specify?' } ),
				'test reason'
			);
			await user.click( screen.getByRole( 'button', { name: 'Continue removal' } ) );

			expect( await findOptions() ).toBeVisible();
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_cancellation_solution_cards_view',
				expect.objectContaining( {
					solution_ids: 'ask-ai-assistant,speak-with-support',
					cancellation_reason: 'otherPriceValue',
				} )
			);
		} );
	} );

	describe( 'free month offer', () => {
		const monthlyPurchase = { ...purchase, bill_period_days: 31 } as Purchase;

		test( 'offers a free month when the site never had one', async () => {
			const user = userEvent.setup();
			const check = mockHasExtended( 200, { has_extended: false } );
			const { queryClient } = renderRemoveFlow( {
				purchase: monthlyPurchase,
				seedHasExtended: false,
			} );
			await waitForCheck( check, queryClient );

			await pickFoundBetterValue( user );

			expect( await screen.findByRole( 'button', { name: 'Get a free month' } ) ).toBeVisible();
		} );

		test( 'offers Built By when the site already had a free month', async () => {
			const user = userEvent.setup();
			const check = mockHasExtended( 200, { has_extended: true } );
			const { queryClient } = renderRemoveFlow( {
				purchase: monthlyPurchase,
				seedHasExtended: false,
			} );
			await waitForCheck( check, queryClient );

			await pickFoundBetterValue( user );

			expect(
				await screen.findByRole( 'heading', { name: 'Let us build your site for you' } )
			).toBeVisible();
			expect(
				screen.queryByRole( 'button', { name: 'Get a free month' } )
			).not.toBeInTheDocument();
		} );

		test( 'offers Built By when the free month check fails', async () => {
			const user = userEvent.setup();
			const check = mockHasExtended( 500, {
				code: 'writes-disabled',
				message: 'Purchase management is not available. Please check back shortly.',
				data: { status: 500 },
			} );
			const { queryClient } = renderRemoveFlow( {
				purchase: monthlyPurchase,
				seedHasExtended: false,
			} );
			await waitForCheck( check, queryClient );

			await pickFoundBetterValue( user );

			expect(
				await screen.findByRole( 'heading', { name: 'Let us build your site for you' } )
			).toBeVisible();
			expect(
				screen.queryByRole( 'button', { name: 'Get a free month' } )
			).not.toBeInTheDocument();
		} );

		test( 'lets the customer retry a failed free month', async () => {
			const user = userEvent.setup();
			const check = mockHasExtended( 200, { has_extended: false } );
			const extend = nock( 'https://public-api.wordpress.com' )
				.post( `/wpcom/v2/upgrades/${ purchase.ID }/extend` )
				.times( 2 )
				.reply( 500, {
					code: 'writes-disabled',
					message: 'Purchase management is not available. Please check back shortly.',
					data: { status: 500 },
				} );
			const { queryClient } = renderRemoveFlow( {
				purchase: monthlyPurchase,
				seedHasExtended: false,
			} );
			await waitForCheck( check, queryClient );

			await pickFoundBetterValue( user );
			const button = await screen.findByRole( 'button', { name: 'Get a free month' } );
			await user.click( button );
			// Continue removal re-enables once the failure clears the busy state, so the retry click goes through.
			await waitFor( () =>
				expect( screen.getByRole( 'button', { name: 'Continue removal' } ) ).toBeEnabled()
			);
			await user.click( button );

			await waitFor( () => expect( extend.isDone() ).toBe( true ) );
		} );
	} );
} );

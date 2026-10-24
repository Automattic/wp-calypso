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
import { dispatch, select } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import nock from 'nock';
import { render } from '../../../../test-utils';
import CancelPurchase from '../index';
import type { PlanProduct, Purchase } from '@automattic/api-core';

jest.mock( '../../../../app/router/me', () => ( {
	cancelPurchaseRoute: { fullPath: '__root__', useParams: () => ( { purchaseId: '123' } ) },
	purchaseSettingsRoute: { fullPath: '/me/billing/purchases/$purchaseId' },
	purchasesRoute: { to: '/me/billing/purchases' },
} ) );

const monthlyPurchase = {
	ID: 123,
	blog_id: 456,
	site_slug: 'example.wordpress.com',
	product_id: 1018,
	product_name: 'WordPress.com Business',
	product_slug: 'business-bundle-monthly',
	bill_period_days: 31,
	is_plan: true,
	is_cancelable: true,
	is_removable: true,
	is_refundable: false,
	can_disable_auto_renew: true,
	is_auto_renew_enabled: false,
	subscription_status: 'active',
	currency_code: 'USD',
	expiry_date: '2026-11-16T00:00:00+00:00',
} as Purchase;

const plans = [
	{
		product_id: 1018,
		product_slug: 'business-bundle-monthly',
		product_name: 'WordPress.com Business',
		downgrade_paths: [] as PlanProduct[ 'downgrade_paths' ],
	},
] as PlanProduct[];

function mockSiteRequests( purchase: Purchase ) {
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

function renderRemoveFlow( purchase: Purchase = monthlyPurchase, hasBeenExtended = false ) {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false, staleTime: Infinity } },
	} );
	queryClient.setQueryData( purchaseQuery( purchase.ID ).queryKey, purchase );
	queryClient.setQueryData( plansQuery().queryKey, plans );
	queryClient.setQueryData( purchaseCancelFeaturesQuery( purchase.ID ).queryKey, [] );
	queryClient.setQueryData( productsQuery().queryKey, {} );
	queryClient.setQueryData( rawUserPreferencesQuery().queryKey, {} );
	// The page passes the blog ID as this query's purchase ID.
	queryClient.setQueryData(
		hasPurchaseBeenExtendedQuery( purchase.blog_id ).queryKey,
		hasBeenExtended
	);
	mockSiteRequests( purchase );

	return render( <CancelPurchase />, { queryClient } );
}

async function startSurvey( user: ReturnType< typeof userEvent.setup > ) {
	await user.click( await screen.findByRole( 'checkbox' ) );
	await user.click( screen.getByRole( 'button', { name: 'Continue removal' } ) );
}

async function pickReason(
	user: ReturnType< typeof userEvent.setup >,
	reason: string,
	detail: string
) {
	await user.click( await screen.findByRole( 'radio', { name: reason } ) );
	await user.click( screen.getByRole( 'radio', { name: detail } ) );
	await user.click( screen.getByRole( 'button', { name: 'Continue removal' } ) );
}

const optionsListName = 'Before canceling, you can consider these options:';

const findOptions = () => screen.findByRole( 'list', { name: optionsListName } );

const freeMonthCardName = /How about a free month\?/;

function getTracksEvents(
	recordTracksEvent: ReturnType< typeof render >[ 'recordTracksEvent' ],
	eventName: string
) {
	return jest
		.mocked( recordTracksEvent )
		.mock.calls.filter( ( [ name ] ) => name === eventName )
		.map( ( [ , properties ] ) => properties );
}

describe( '<CancelPurchase />', () => {
	beforeEach( () => {
		window.history.replaceState( {}, '', '/?intent=remove' );
	} );

	afterEach( () => {
		select( noticesStore )
			.getNotices()
			.forEach( ( notice ) => dispatch( noticesStore ).removeNotice( notice.id ) );
	} );

	describe( 'free month card', () => {
		describe( 'with the cards flag on', () => {
			beforeAll( () => {
				enable( 'purchases/split-cancel-remove' );
			} );

			afterAll( () => {
				disable( 'purchases/split-cancel-remove' );
			} );

			test( 'shows the free month card first for an eligible monthly plan', async () => {
				const user = userEvent.setup();
				const { recordTracksEvent } = renderRemoveFlow();
				await startSurvey( user );
				await pickReason( user, 'Too expensive', 'I found a competitor with better pricing/value' );

				const [ firstCard ] = within( await findOptions() ).getAllByRole( 'listitem' );
				const freeMonthCard = within( firstCard ).getByRole( 'button', {
					name: freeMonthCardName,
				} );
				expect( freeMonthCard ).toBeVisible();
				expect( freeMonthCard ).toHaveTextContent(
					'How about a free month of your WordPress.com Business plan subscription'
				);
				expect( recordTracksEvent ).toHaveBeenCalledWith(
					'calypso_cancellation_solution_cards_view',
					expect.objectContaining( {
						solution_ids: 'free-month-offer,change-plan,renew-now-pay-less,speak-with-support',
						cancellation_reason: 'foundBetterValue',
					} )
				);
			} );

			test.each( [
				{
					name: 'the plan already had a free month',
					purchase: monthlyPurchase,
					hasBeenExtended: true,
					detail: 'I found a competitor with better pricing/value',
					solutionIds: 'change-plan,renew-now-pay-less,speak-with-support',
					cancellationReason: 'foundBetterValue',
				},
				{
					name: 'the plan is annual',
					purchase: {
						...monthlyPurchase,
						product_slug: 'business-bundle',
						bill_period_days: 365,
					} as Purchase,
					hasBeenExtended: false,
					detail: 'I found a competitor with better pricing/value',
					solutionIds: 'change-plan,renew-now-pay-less,switch-to-monthly,speak-with-support',
					cancellationReason: 'foundBetterValue',
				},
				{
					name: 'the plan is refundable',
					purchase: { ...monthlyPurchase, is_refundable: true } as Purchase,
					hasBeenExtended: false,
					detail: 'I found a competitor with better pricing/value',
					solutionIds: 'change-plan,renew-now-pay-less,speak-with-support',
					cancellationReason: 'foundBetterValue',
				},
				{
					name: 'the reason is "too expensive for the features"',
					purchase: monthlyPurchase,
					hasBeenExtended: false,
					detail: 'The plan is too expensive for the features offered.',
					solutionIds: 'change-plan,renew-now-pay-less,speak-with-support',
					cancellationReason: 'tooExpensive',
				},
			] )(
				'shows only the reason cards when $name',
				async ( { purchase, hasBeenExtended, detail, solutionIds, cancellationReason } ) => {
					const user = userEvent.setup();
					const { recordTracksEvent } = renderRemoveFlow( purchase, hasBeenExtended );
					await startSurvey( user );
					await pickReason( user, 'Too expensive', detail );

					const options = await findOptions();
					expect(
						within( options ).getByRole( 'button', { name: /Speak with our support team/ } )
					).toBeVisible();
					expect(
						within( options ).queryByRole( 'button', { name: freeMonthCardName } )
					).not.toBeInTheDocument();
					expect( recordTracksEvent ).toHaveBeenCalledWith(
						'calypso_cancellation_solution_cards_view',
						expect.objectContaining( {
							solution_ids: solutionIds,
							cancellation_reason: cancellationReason,
						} )
					);
				}
			);

			test( 'adds the free month and returns to the purchases list on click', async () => {
				const user = userEvent.setup();
				const extendRequest = nock( 'https://public-api.wordpress.com' )
					.post( `/wpcom/v2/upgrades/${ monthlyPurchase.ID }/extend` )
					.reply( 200, { status: 'completed', message: 'Enjoy your free month!' } );
				const { recordTracksEvent, router } = renderRemoveFlow();
				await startSurvey( user );
				await pickReason(
					user,
					'Too hard to use',
					'The website editor is difficult or unintuitive to use'
				);

				const options = await findOptions();
				await user.click( within( options ).getByRole( 'button', { name: freeMonthCardName } ) );

				await waitFor( () =>
					expect( router.state.location.pathname ).toBe( '/me/billing/purchases' )
				);
				expect( extendRequest.isDone() ).toBe( true );
				expect( select( noticesStore ).getNotices() ).toEqual( [
					expect.objectContaining( {
						content: 'Enjoy your free month!',
						status: 'success',
						type: 'snackbar',
					} ),
				] );
				expect(
					getTracksEvents( recordTracksEvent, 'calypso_cancellation_solution_card_click' )
				).toEqual( [
					expect.objectContaining( {
						solution_id: 'free-month-offer',
						cancellation_reason: 'difficultEditor',
					} ),
				] );
				expect(
					getTracksEvents( recordTracksEvent, 'calypso_purchases_free_month_offer_form_submit' )
				).toHaveLength( 1 );
			} );

			test( 'shows an error and stays on the options when the free month fails', async () => {
				const user = userEvent.setup();
				const extendRequest = nock( 'https://public-api.wordpress.com' )
					.post( `/wpcom/v2/upgrades/${ monthlyPurchase.ID }/extend` )
					.reply( 400, { error: 'extend_failed', message: 'Could not extend.' } );
				const { router } = renderRemoveFlow();
				await startSurvey( user );
				await pickReason(
					user,
					'Too hard to use',
					'The website editor is difficult or unintuitive to use'
				);
				const pathnameBeforeClick = router.state.location.pathname;

				const options = await findOptions();
				await user.click( within( options ).getByRole( 'button', { name: freeMonthCardName } ) );

				await waitFor( () =>
					expect( select( noticesStore ).getNotices() ).toEqual( [
						expect.objectContaining( {
							content: 'Could not extend.',
							status: 'error',
							type: 'snackbar',
						} ),
					] )
				);
				expect( extendRequest.isDone() ).toBe( true );
				expect( router.state.location.pathname ).toBe( pathnameBeforeClick );
				expect( screen.getByRole( 'list', { name: optionsListName } ) ).toBeVisible();
			} );
		} );

		describe( 'with the cards flag off', () => {
			beforeAll( () => {
				disable( 'purchases/split-cancel-remove' );
			} );

			test( 'shows the free month upsell for an eligible monthly plan', async () => {
				const user = userEvent.setup();
				const { recordTracksEvent } = renderRemoveFlow();
				await startSurvey( user );
				await pickReason( user, 'Too expensive', 'I found a competitor with better pricing/value' );

				expect(
					await screen.findByRole( 'heading', { name: 'How about a free month?' } )
				).toBeVisible();
				expect( screen.getByRole( 'button', { name: 'Get a free month' } ) ).toBeVisible();
				expect( recordTracksEvent ).not.toHaveBeenCalledWith(
					'calypso_cancellation_solution_cards_view',
					expect.anything()
				);
			} );
		} );
	} );
} );

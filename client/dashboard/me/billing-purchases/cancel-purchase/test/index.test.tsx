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
import type { PlanProduct, PlanProductDowngrade, Purchase } from '@automattic/api-core';

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

function renderRemoveFlow( {
	purchase: overrides = {},
	plans = [],
}: { purchase?: Partial< Purchase >; plans?: PlanProduct[] } = {} ) {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false, staleTime: Infinity } },
	} );
	queryClient.setQueryData( purchaseQuery( purchase.ID ).queryKey, { ...purchase, ...overrides } );
	queryClient.setQueryData( plansQuery().queryKey, plans );
	queryClient.setQueryData( purchaseCancelFeaturesQuery( purchase.ID ).queryKey, [] );
	queryClient.setQueryData( productsQuery().queryKey, {} );
	queryClient.setQueryData( rawUserPreferencesQuery().queryKey, {} );
	// The page passes the blog ID as this query's purchase ID.
	queryClient.setQueryData( hasPurchaseBeenExtendedQuery( purchase.blog_id ).queryKey, false );
	mockSiteRequests();

	return render( <CancelPurchase />, { queryClient } );
}

async function startSurvey( user: ReturnType< typeof userEvent.setup > ) {
	await user.click( await screen.findByRole( 'checkbox' ) );
	await user.click( screen.getByRole( 'button', { name: 'Continue removal' } ) );
}

const optionsListName = 'Before canceling, you can consider these options:';

const findOptions = () => screen.findByRole( 'list', { name: optionsListName } );

const personalAnnual: Partial< Purchase > = {
	product_id: 1009,
	product_name: 'WordPress.com Personal',
	product_slug: 'personal-bundle',
};

const personalAnnualPlan = {
	product_id: 1009,
	product_name: 'WordPress.com Personal',
	product_slug: 'personal-bundle',
	bill_period: 365,
	downgrade_paths: [ { product_id: 1019, bill_period: 31 } ],
} as PlanProduct;

const personalMonthlyPlan = {
	product_id: 1019,
	product_name: 'WordPress.com Personal',
	product_slug: 'personal-bundle-monthly',
	bill_period: 31,
	downgrade_paths: [] as PlanProductDowngrade[],
} as PlanProduct;

const renderPersonalFlow = () =>
	renderRemoveFlow( {
		purchase: personalAnnual,
		plans: [ personalAnnualPlan, personalMonthlyPlan ],
	} );

async function answerTooExpensive( user: ReturnType< typeof userEvent.setup > ) {
	await startSurvey( user );
	await user.click( await screen.findByRole( 'radio', { name: 'Too expensive' } ) );
	await user.click(
		screen.getByRole( 'radio', { name: 'The plan is too expensive for the features offered.' } )
	);
	await user.click( screen.getByRole( 'button', { name: 'Continue removal' } ) );
}

// Holds the reply until `release()`, so a test can check what fires before the API result.
function mockHeldPurchaseRequest( action: 'cancel' | 'extend' ) {
	let release!: () => void;
	const pending = new Promise< void >( ( resolve ) => {
		release = resolve;
	} );
	const scope = nock( 'https://public-api.wordpress.com' )
		.post( `/wpcom/v2/upgrades/${ purchase.ID }/${ action }` )
		.reply( 200, () => pending.then( () => ( { status: 'completed', message: 'ok' } ) ) );
	return { scope, release };
}

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

		test( 'adds the purchase ID to the downgrade event from the Switch to monthly card, before the API result', async () => {
			const user = userEvent.setup();
			const downgrade = mockHeldPurchaseRequest( 'cancel' );
			// The switch reloads the purchases list after the API result.
			nock( 'https://public-api.wordpress.com' ).get( '/rest/v1.2/upgrades' ).reply( 200, [] );
			const { recordTracksEvent, router } = renderPersonalFlow();

			await answerTooExpensive( user );
			await user.click(
				await screen.findByRole( 'button', { name: /Switch to monthly payments/ } )
			);
			await waitFor( () => expect( downgrade.scope.isDone() ).toBe( true ) );

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_purchases_downgrade_form_submit',
				expect.objectContaining( { purchase_id: 123 } )
			);
			downgrade.release();
			await waitFor( () =>
				expect( router.state.location.pathname ).toBe( '/me/billing/purchases' )
			);
		} );
	} );

	describe( 'with the cards flag off', () => {
		test( 'adds the purchase ID to the downgrade event from the Switch to monthly offer, before the API result', async () => {
			const user = userEvent.setup();
			const downgrade = mockHeldPurchaseRequest( 'cancel' );
			const { recordTracksEvent, router } = renderPersonalFlow();

			await answerTooExpensive( user );
			await user.click(
				await screen.findByRole( 'button', { name: 'Switch to monthly payments' } )
			);
			await waitFor( () => expect( downgrade.scope.isDone() ).toBe( true ) );

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_purchases_downgrade_form_submit',
				expect.objectContaining( {
					purchase_id: 123,
					product_slug: 'personal-bundle',
					cancellation_flow: 'remove',
				} )
			);
			downgrade.release();
			await waitFor( () =>
				expect( router.state.location.pathname ).toBe( '/me/billing/purchases' )
			);
		} );

		test( 'adds the purchase ID to the free month offer event, before the API result', async () => {
			const user = userEvent.setup();
			const freeMonth = mockHeldPurchaseRequest( 'extend' );
			const { recordTracksEvent, router } = renderRemoveFlow( {
				purchase: {
					product_id: 1019,
					product_slug: 'personal-bundle-monthly',
					bill_period_days: 31,
				},
				plans: [ personalAnnualPlan, personalMonthlyPlan ],
			} );
			await startSurvey( user );

			await user.click( await screen.findByRole( 'radio', { name: 'Too hard to use' } ) );
			await user.click(
				screen.getByRole( 'radio', {
					name: 'The platform/dashboard is too complicated or confusing to navigate',
				} )
			);
			await user.click( screen.getByRole( 'button', { name: 'Continue removal' } ) );
			await user.click( await screen.findByRole( 'button', { name: 'Get a free month' } ) );
			await waitFor( () => expect( freeMonth.scope.isDone() ).toBe( true ) );

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_purchases_free_month_offer_form_submit',
				expect.objectContaining( { purchase_id: 123 } )
			);
			freeMonth.release();
			await waitFor( () =>
				expect( router.state.location.pathname ).toBe( '/me/billing/purchases' )
			);
		} );
	} );
} );

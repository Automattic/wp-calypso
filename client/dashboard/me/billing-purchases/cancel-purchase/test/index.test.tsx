/**
 * @vitest-environment jsdom
 */

import {
	domainQuery,
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
import { vi } from 'vitest';
import { render } from '../../../../test-utils';
import { UPSELL_STEP } from '../cancel-purchase-form/steps';
import CancelPurchase from '../index';
import KeepSubscriptionButton from '../keep-subscription-button';
import type { Domain, PlanProduct, PlanProductDowngrade, Purchase } from '@automattic/api-core';

vi.mock( '../../../../app/router/domains', () => ( {
	domainRoute: { fullPath: '/domains/$domainName' },
} ) );

vi.mock( '../../../../app/router/me', () => ( {
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
		.reply( 200, { ID: purchase.blog_id, slug: purchase.site_slug, is_wpcom_atomic: false } )
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
	purchase: overrides = {},
	plans = [],
	seedHasExtended = true,
}: { purchase?: Partial< Purchase >; plans?: PlanProduct[]; seedHasExtended?: boolean } = {} ) {
	const testPurchase = { ...purchase, ...overrides };
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false, staleTime: Infinity } },
	} );
	queryClient.setQueryData( purchaseQuery( purchase.ID ).queryKey, testPurchase );
	queryClient.setQueryData( plansQuery().queryKey, plans );
	queryClient.setQueryData( purchaseCancelFeaturesQuery( purchase.ID ).queryKey, [] );
	queryClient.setQueryData( productsQuery().queryKey, {} );
	queryClient.setQueryData( rawUserPreferencesQuery().queryKey, {} );
	if ( testPurchase.meta ) {
		queryClient.setQueryData( domainQuery( testPurchase.meta ).queryKey, {
			domain: testPurchase.meta,
		} as Domain );
	}
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

const EXPOSURE = 'calypso_purchases_cancel_options_eligible';

const exposureCalls = (
	recordTracksEvent: ( name: string, properties?: Record< string, unknown > ) => void
) => vi.mocked( recordTracksEvent ).mock.calls.filter( ( [ name ] ) => name === EXPOSURE );

// Holds the reply until `release()`, so a test can check what fires before the API result.
function mockHeldPurchaseRequest( action: 'extend' ) {
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

		test( 'shows no options for "Another reason" with text typed', async () => {
			const user = userEvent.setup();
			const { recordTracksEvent } = renderRemoveFlow();
			await startSurvey( user );

			await user.click( await screen.findByRole( 'radio', { name: 'Another reason…' } ) );
			await user.type(
				screen.getByRole( 'textbox', { name: 'Can you please specify?' } ),
				'test reason'
			);
			await user.click( screen.getByRole( 'button', { name: 'Continue removal' } ) );

			expect(
				await screen.findByRole( 'radiogroup', {
					name: 'Where is your next adventure taking you?',
				} )
			).toBeVisible();
			expect( screen.queryByRole( 'list', { name: optionsListName } ) ).not.toBeInTheDocument();
			expect( recordTracksEvent ).not.toHaveBeenCalledWith(
				'calypso_cancellation_solution_cards_view',
				expect.anything()
			);
		} );

		test( 'records the exposure with the purchase and flow details when the reason has options', async () => {
			const user = userEvent.setup();
			const { recordTracksEvent } = renderPersonalFlow();

			await answerTooExpensive( user );

			expect( await findOptions() ).toBeVisible();
			expect( exposureCalls( recordTracksEvent ) ).toEqual( [
				[
					EXPOSURE,
					{
						purchase_id: 123,
						cancellation_reason: 'tooExpensive',
						cancellation_flow: 'remove',
						product_slug: 'personal-bundle',
						is_atomic: false,
					},
				],
			] );
		} );

		test( 'skips the exposure for "Something else related to changed needs" with text typed', async () => {
			const user = userEvent.setup();
			const { recordTracksEvent } = renderRemoveFlow();
			await startSurvey( user );

			await user.click( await screen.findByRole( 'radio', { name: 'No longer need a site' } ) );
			await user.click(
				screen.getByRole( 'radio', { name: 'Something else related to changed needs' } )
			);
			await user.type(
				screen.getByRole( 'textbox', { name: 'Can you please specify?' } ),
				'test reason'
			);
			await user.click( screen.getByRole( 'button', { name: 'Continue removal' } ) );

			expect( await screen.findByRole( 'button', { name: 'Complete removal' } ) ).toBeVisible();
			expect( exposureCalls( recordTracksEvent ) ).toHaveLength( 0 );
		} );

	} );

	describe( 'with the cards flag off', () => {
		test( 'records the exposure before moving on to the offer', async () => {
			const user = userEvent.setup();
			const { recordTracksEvent } = renderPersonalFlow();

			await answerTooExpensive( user );

			expect(
				await screen.findByRole( 'link', { name: 'Switch to monthly payments' } )
			).toBeVisible();
			expect( exposureCalls( recordTracksEvent ) ).toEqual( [
				[
					EXPOSURE,
					{
						purchase_id: 123,
						cancellation_reason: 'tooExpensive',
						cancellation_flow: 'remove',
						product_slug: 'personal-bundle',
						is_atomic: false,
					},
				],
			] );
			const calls = vi.mocked( recordTracksEvent ).mock.calls;
			const exposureIndex = calls.findIndex( ( [ name ] ) => name === EXPOSURE );
			const offerIndex = calls.findIndex(
				( [ name, properties ] ) =>
					name === 'calypso_purchases_cancel_survey_step' && properties?.new_step === UPSELL_STEP
			);
			expect( offerIndex ).toBeGreaterThan( exposureIndex );
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
				expect( router.state.location.pathname ).toBe( `/me/billing/purchases/${ purchase.ID }` )
			);
		} );
	} );

	describe( 'domain removal', () => {
		const domainPurchase = {
			...purchase,
			product_name: 'Domain Registration',
			product_slug: 'dotblog_domain',
			meta: 'example.blog',
			is_plan: false,
			is_domain: true,
			is_domain_registration: true,
			is_refundable: false,
		} as Purchase;

		test( 'returns to the domain when it was opened from the domain', async () => {
			window.history.replaceState( {}, '', '/?intent=remove&back_to=domain' );
			const user = userEvent.setup();
			const { router } = renderRemoveFlow( { purchase: domainPurchase } );

			await user.click( await screen.findByRole( 'button', { name: 'Cancel' } ) );

			await waitFor( () =>
				expect( router.state.location.pathname ).toBe( '/domains/example.blog' )
			);
		} );

		test( 'keeps where the domain was opened from when returning to it', async () => {
			window.history.replaceState(
				{},
				'',
				'/?intent=remove&back_to=domain&domain_back_to=site-domains'
			);
			const user = userEvent.setup();
			const { router } = renderRemoveFlow( { purchase: domainPurchase } );

			await user.click( await screen.findByRole( 'button', { name: 'Cancel' } ) );

			await waitFor( () =>
				expect( router.state.location.pathname ).toBe( '/domains/example.blog' )
			);
			expect( router.state.location.search ).toEqual( { back_to: 'site-domains' } );
		} );

		test( 'Keep subscription returns a domain connection to the domain', async () => {
			window.history.replaceState( {}, '', '/?intent=remove&back_to=domain' );
			const user = userEvent.setup();
			const { router } = render(
				<KeepSubscriptionButton
					purchase={ {
						...domainPurchase,
						product_slug: 'domain_map',
						product_type: 'domain_map',
						is_domain_registration: false,
					} }
					intent="remove"
					onKeepSubscriptionClick={ vi.fn() }
				/>
			);

			await user.click( await screen.findByRole( 'button', { name: 'Keep subscription' } ) );

			await waitFor( () =>
				expect( router.state.location.pathname ).toBe( '/domains/example.blog' )
			);
		} );

		test( 'returns to purchases when it was opened from billing', async () => {
			const user = userEvent.setup();
			const { router } = renderRemoveFlow( { purchase: domainPurchase } );

			await user.click( await screen.findByRole( 'button', { name: 'Cancel' } ) );

			await waitFor( () =>
				expect( router.state.location.pathname ).toBe( '/me/billing/purchases' )
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
			const { queryClient, router } = renderRemoveFlow( {
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
			expect( router.state.location.pathname ).toBe( '/' );
			await user.click( button );

			await waitFor( () => expect( extend.isDone() ).toBe( true ) );
		} );

		test( 'takes the customer to the purchase page after a free month', async () => {
			const user = userEvent.setup();
			const check = mockHasExtended( 200, { has_extended: false } );
			nock( 'https://public-api.wordpress.com' )
				.post( `/wpcom/v2/upgrades/${ purchase.ID }/extend` )
				.reply( 200, { status: 'completed' } );
			const { queryClient, router } = renderRemoveFlow( {
				purchase: monthlyPurchase,
				seedHasExtended: false,
			} );
			await waitForCheck( check, queryClient );

			await pickFoundBetterValue( user );
			await user.click( await screen.findByRole( 'button', { name: 'Get a free month' } ) );

			await waitFor( () =>
				expect( router.state.location.pathname ).toBe( `/me/billing/purchases/${ purchase.ID }` )
			);
			expect( router.state.location.search ).toEqual( { free_month: true } );
		} );
	} );
} );

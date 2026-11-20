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
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { vi } from 'vitest';
import { render } from '../../../../test-utils';
import CancelPurchase from '../index';
import KeepSubscriptionButton from '../keep-subscription-button';
import type { Domain, Purchase } from '@automattic/api-core';

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

function mockSiteRequests( sitePurchases: object[] = [] ) {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/upgrades' )
		.query( { site: purchase.blog_id } )
		.reply( 200, sitePurchases )
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
	sitePurchases,
}: { purchase?: Purchase; seedHasExtended?: boolean; sitePurchases?: object[] } = {} ) {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false, staleTime: Infinity } },
	} );
	queryClient.setQueryData( purchaseQuery( purchase.ID ).queryKey, testPurchase );
	queryClient.setQueryData( plansQuery().queryKey, [] );
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
	mockSiteRequests( sitePurchases );

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

async function pickReason( user: ReturnType< typeof userEvent.setup >, name: string ) {
	await user.click( await screen.findByRole( 'radio', { name: 'Too expensive' } ) );
	await user.click( screen.getByRole( 'radio', { name } ) );
	await user.click( screen.getByRole( 'button', { name: 'Continue removal' } ) );
}

async function pickFoundBetterValue( user: ReturnType< typeof userEvent.setup > ) {
	await startSurvey( user );
	await pickReason( user, 'I found a competitor with better pricing/value' );
}

const lackOfCustomization = 'Lack of customization features (e.g., colors, fonts, themes)';

const experimentName = 'calypso_cancel_options_cards_202611_v1';

// Store a live control assignment so ExPlat returns it from localStorage.
function assignControl() {
	window.localStorage.setItem(
		`explat-experiment--${ experimentName }`,
		JSON.stringify( {
			experimentName,
			variationName: 'control',
			retrievedTimestamp: Date.now(),
			ttl: 3600,
		} )
	);
}

// Drop the stored assignment so ExPlat asks for a new one.
function mockAssignmentRequest() {
	window.localStorage.clear();
	return nock( 'https://public-api.wordpress.com' )
		.get( '/wpcom/v2/experiments/0.1.0/assignments/calypso' )
		.query( true );
}

// Hold the request for a new assignment until the test answers it.
function holdAssignment() {
	let answer!: ( variationName: string ) => void;
	const variation = new Promise< string >( ( resolve ) => {
		answer = resolve;
	} );
	const request = mockAssignmentRequest().reply( 200, () =>
		variation.then( ( variationName ) => ( {
			variations: { [ experimentName ]: variationName },
			ttl: 3600,
		} ) )
	);
	return { request, answer };
}

const optionsListName = 'Before canceling, you can consider these options:';

describe( '<CancelPurchase />', () => {
	beforeEach( () => {
		window.history.replaceState( {}, '', '/?intent=remove' );
		assignControl();
		// A Tracks anonymous id lets ExPlat ask for an assignment straight away, skipping its 5 second wait.
		document.cookie = 'tk_ai=test-anon-id; path=/';
	} );

	afterEach( () => {
		window.localStorage.clear();
		document.cookie = 'tk_ai=; path=/; max-age=-1';
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
	} );

	describe( 'cancel options experiment', () => {
		test( 'asks for the assignment at the survey and holds the reasons until it arrives', async () => {
			const { request, answer } = holdAssignment();
			const user = userEvent.setup();
			renderRemoveFlow();

			await user.click( await screen.findByRole( 'checkbox' ) );
			expect( request.isDone() ).toBe( false );
			await user.click( screen.getByRole( 'button', { name: 'Continue removal' } ) );

			await waitFor( () => expect( request.isDone() ).toBe( true ) );
			expect( await screen.findByRole( 'heading', { level: 1 } ) ).toBeVisible();
			expect( screen.queryByRole( 'radio', { name: 'Too expensive' } ) ).not.toBeInTheDocument();

			answer( 'new_flow' );
			await pickReason( user, lackOfCustomization );

			expect( await screen.findByRole( 'list', { name: optionsListName } ) ).toBeVisible();
		} );

		test( 'shows the control survey when the assignment request fails', async () => {
			const request = mockAssignmentRequest().reply( 500, {} );
			const user = userEvent.setup();
			renderRemoveFlow();
			await startSurvey( user );
			await waitFor( () => expect( request.isDone() ).toBe( true ) );

			await pickReason( user, lackOfCustomization );

			expect(
				await screen.findByRole( 'heading', { name: 'Let us build your site for you' } )
			).toBeVisible();
			expect( screen.queryByRole( 'list', { name: optionsListName } ) ).not.toBeInTheDocument();
		} );

		test( 'asks for the assignment only after auto-renew is turned off', async () => {
			window.history.replaceState( {}, '', '/?intent=auto-renew' );
			const { request, answer } = holdAssignment();
			let finishAutoRenew!: () => void;
			const autoRenewDone = new Promise< void >( ( resolve ) => {
				finishAutoRenew = resolve;
			} );
			const autoRenew = nock( 'https://public-api.wordpress.com' )
				.post( `/rest/v1.1/upgrades/${ purchase.ID }/disable-auto-renew` )
				.reply( 200, () =>
					autoRenewDone.then( () => ( {
						success: true,
						upgrade: { ...purchase, is_auto_renew_enabled: false },
					} ) )
				);
			const user = userEvent.setup();
			renderRemoveFlow( { purchase: { ...purchase, is_auto_renew_enabled: true } } );

			await user.click( await screen.findByRole( 'checkbox' ) );
			await user.click( screen.getByRole( 'button', { name: 'Turn off auto-renew' } ) );
			await waitFor( () => expect( autoRenew.isDone() ).toBe( true ) );
			expect( request.isDone() ).toBe( false );

			finishAutoRenew();

			await waitFor( () => expect( request.isDone() ).toBe( true ) );
			expect( await screen.findByRole( 'heading', { level: 1 } ) ).toBeVisible();
			expect( screen.queryByRole( 'radio', { name: 'Too expensive' } ) ).not.toBeInTheDocument();
			answer( 'control' );
			expect( await screen.findByRole( 'radio', { name: 'Too expensive' } ) ).toBeVisible();
		} );

		test( 'holds the reasons for a removed plan until the assignment arrives', async () => {
			window.history.replaceState( {}, '', '/' );
			const { request, answer } = holdAssignment();
			const user = userEvent.setup();
			renderRemoveFlow( { purchase: { ...purchase, subscription_status: 'inactive' } } );

			await waitFor( () => expect( request.isDone() ).toBe( true ) );
			expect( await screen.findByRole( 'heading', { level: 1 } ) ).toBeVisible();
			expect( screen.queryByRole( 'radio', { name: 'Too expensive' } ) ).not.toBeInTheDocument();

			answer( 'control' );
			const reason = await screen.findByRole( 'radio', { name: 'Too expensive' } );
			await user.click( reason );

			expect( reason ).toBeChecked();
		} );

		test( 'asks for the assignment only after the domain options step', async () => {
			const { request, answer } = holdAssignment();
			const user = userEvent.setup();
			renderRemoveFlow( {
				purchase: { ...purchase, is_refundable: true, included_domain: 'example.com' },
				sitePurchases: [
					{
						ID: 789,
						blog_id: purchase.blog_id,
						product_slug: 'domain_reg',
						meta: 'example.com',
						is_domain: true,
						is_domain_registration: true,
						cost_to_unbundle_display: '$20',
						is_within_initial_refund_window: true,
					},
				],
			} );

			await user.click( await screen.findByRole( 'checkbox' ) );
			await user.click( screen.getByRole( 'button', { name: 'Continue with cancellation' } ) );
			await user.click(
				await screen.findByRole( 'radio', { name: /Cancel the plan, but keep "example.com"/ } )
			);
			expect( request.isDone() ).toBe( false );
			await user.click( screen.getByRole( 'button', { name: 'Continue with cancellation' } ) );

			await waitFor( () => expect( request.isDone() ).toBe( true ) );
			expect( await screen.findByRole( 'heading', { level: 1 } ) ).toBeVisible();
			expect( screen.queryByRole( 'radio', { name: 'Too expensive' } ) ).not.toBeInTheDocument();
			answer( 'control' );
			expect( await screen.findByRole( 'radio', { name: 'Too expensive' } ) ).toBeVisible();
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

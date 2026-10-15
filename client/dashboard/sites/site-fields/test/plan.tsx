/**
 * @jest-environment jsdom
 */
import { DotcomPlans, SubscriptionBillPeriod } from '@automattic/api-core';
import { QueryClient } from '@tanstack/react-query';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockDate from 'mockdate';
import nock from 'nock';
import { render as testUtilsRender } from '../../../test-utils';
import { wpcomLink } from '../../../utils/link';
import { Plan } from '../index';
import type { Purchase, Site } from '@automattic/api-core';

const NOW = '2026-02-24T12:00:00Z';
const SITE_ID = 77;

/**
 * Noon UTC keeps the calendar-day arithmetic stable regardless of the time zone
 * the test runner happens to be in.
 */
function expiryInDays( days: number ): string {
	return new Date( Date.UTC( 2026, 1, 24 + days, 12 ) ).toISOString();
}

function makeSite( plan?: Partial< NonNullable< Site[ 'plan' ] > > ): Site {
	return {
		ID: SITE_ID,
		slug: 'test.wordpress.com',
		plan: plan && {
			product_slug: DotcomPlans.BUSINESS,
			product_name_short: 'Business',
			expired: false,
			...plan,
		},
	} as Site;
}

/**
 * A site a funnel built before its owner paid: already on Atomic, and reading as Free.
 */
function makeAtomicFreeSite(): Site {
	return {
		...makeSite( {
			product_slug: DotcomPlans.FREE_PLAN,
			product_name_short: 'Free',
			is_free: true,
		} ),
		is_wpcom_atomic: true,
	} as Site;
}

function mockPendingFunnelSite( response: object, status = 200 ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( '/wpcom/v2/wow-funnel/pending' )
		.query( true )
		.reply( status, response );
}

function makePurchase( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		ID: 1234,
		blog_id: SITE_ID,
		product_slug: DotcomPlans.BUSINESS,
		product_name: 'WordPress.com Business',
		expiry_date: expiryInDays( 120 ),
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

function render( ui: React.ReactElement, purchases: Purchase[] = [] ) {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false } },
	} );
	queryClient.setQueryData( [ 'upgrades' ], purchases );

	return testUtilsRender( ui, { queryClient } );
}

function renderPlan( { site, purchases }: { site: Site; purchases?: Purchase[] } ) {
	return render(
		<Plan
			site={ site }
			isJetpack={ false }
			isSelfHostedJetpackConnected={ false }
			value={ site.plan?.product_name_short ?? '' }
		/>,
		purchases
	);
}

beforeEach( () => {
	MockDate.set( NOW );
} );

afterEach( () => {
	MockDate.reset();
} );

describe( '<Plan>', () => {
	test( 'for self-hosted, Jetpack-connected sites, active Jetpack plugin, it renders the plan name without a logo', () => {
		const { container } = render(
			<Plan site={ makeSite() } isJetpack isSelfHostedJetpackConnected value="Jetpack Free" />
		);
		expect( container.querySelector( 'svg' ) ).not.toBeInTheDocument();
		expect( container.textContent ).toBe( 'Jetpack Free' );
	} );

	test( 'for self-hosted, Jetpack-connected sites, inactive Jetpack plugin, it renders dash', () => {
		const { container } = render(
			<Plan site={ makeSite() } isJetpack={ false } isSelfHostedJetpackConnected value="Free" />
		);
		expect( container.textContent ).toBe( '-' );
	} );

	test( 'for WordPress.com Simple sites, it renders the value prop', () => {
		const { container } = renderPlan( { site: makeSite( { product_name_short: 'Premium' } ) } );
		expect( container.textContent ).toBe( 'Premium' );
	} );

	test( 'for WordPress.com Atomic sites, it renders the plan name', () => {
		const { container } = render(
			<Plan site={ makeSite() } isJetpack isSelfHostedJetpackConnected={ false } value="Business" />
		);
		expect( container.textContent ).toBe( 'Business' );
	} );

	test( 'a plan that is renewing normally shows its name alone', () => {
		const { container } = renderPlan( {
			site: makeSite( {} ),
			purchases: [
				makePurchase( {
					expiry_status: 'active',
					is_auto_renew_enabled: true,
					might_still_auto_renew: true,
					expiry_date: expiryInDays( 30 ),
				} ),
			],
		} );
		expect( container.textContent ).toBe( 'Business' );
	} );

	test( 'a plan approaching expiry counts down the days and links to renewal', () => {
		const { getByRole } = renderPlan( {
			site: makeSite( { user_is_owner: true } ),
			purchases: [ makePurchase( { expiry_date: expiryInDays( 45 ) } ) ],
		} );

		const link = getByRole( 'link' );
		expect( link ).toHaveTextContent( 'Expires in 45 days' );
		expect( link ).toHaveAttribute( 'href', expect.stringContaining( '/checkout/renew/1234' ) );
	} );

	test( 'a plan expiring further out than the warning window shows its name alone', () => {
		const { container } = renderPlan( {
			site: makeSite( {} ),
			purchases: [ makePurchase( { expiry_date: expiryInDays( 120 ) } ) ],
		} );
		expect( container.textContent ).toBe( 'Business' );
	} );

	test( 'a plan somebody else owns shows its name alone while it is only approaching expiry', () => {
		const { container } = renderPlan( { site: makeSite( { user_is_owner: false } ) } );
		expect( container.textContent ).toBe( 'Business' );
	} );

	test( 'an expired plan says so to everyone, without a link for a non-subscriber', () => {
		const { container, queryByRole } = renderPlan( {
			site: makeSite( { expired: true, user_is_owner: false } ),
		} );

		expect( container.textContent ).toBe( 'BusinessPlan expired' );
		expect( queryByRole( 'link' ) ).not.toBeInTheDocument();
	} );

	test( 'an expired plan links the subscriber to checkout even before the purchase loads', () => {
		const { getByRole } = renderPlan( {
			site: makeSite( { expired: true, user_is_owner: true } ),
		} );

		const link = getByRole( 'link' );
		expect( link ).toHaveTextContent( 'Plan expired' );
		expect( link ).toHaveAttribute(
			'href',
			wpcomLink( '/checkout/test.wordpress.com/business-bundle' )
		);
	} );

	test( 'an expired plan links the subscriber to its own renewal once the purchase loads', () => {
		const { getByRole } = renderPlan( {
			site: makeSite( { expired: true, user_is_owner: true } ),
			purchases: [
				makePurchase( {
					expiry_date: expiryInDays( -3 ),
					expiry_status: 'expired',
				} ),
			],
		} );

		const link = getByRole( 'link' );
		expect( link ).toHaveTextContent( 'Plan expired' );
		expect( link ).toHaveAttribute( 'href', expect.stringContaining( '/checkout/renew/1234' ) );
	} );

	test( 'records an impression naming the stage, urgency and whose plan it is', () => {
		const { recordTracksEvent } = renderPlan( {
			site: makeSite( { user_is_owner: true } ),
			purchases: [ makePurchase( { expiry_date: expiryInDays( 45 ) } ) ],
		} );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_sites_plan_renew_nag_impression',
			{
				product_slug: 'business-bundle',
				source: 'plan',
				surface: 'dashboard-sites-list',
				state: 'approaching_expiry',
				urgency: 'warning',
				is_plan_owner: true,
				days_remaining: 45,
			}
		);
	} );

	test( 'records an impression for a lapsed plan the reader cannot renew', () => {
		const { recordTracksEvent } = renderPlan( {
			site: makeSite( { expired: true, user_is_owner: false } ),
		} );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_sites_plan_renew_nag_impression',
			expect.objectContaining( { state: 'expired_grace', is_plan_owner: false } )
		);
		// No date to count from, so the property is left off rather than guessed.
		expect( recordTracksEvent ).not.toHaveBeenCalledWith(
			'calypso_dashboard_sites_plan_renew_nag_impression',
			expect.objectContaining( { days_remaining: expect.anything() } )
		);
	} );

	test( 'records a click on the renewal link', async () => {
		const { getByRole, recordTracksEvent } = renderPlan( {
			site: makeSite( { user_is_owner: true } ),
			purchases: [ makePurchase( { expiry_date: expiryInDays( 3 ) } ) ],
		} );

		await userEvent.click( getByRole( 'link' ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_sites_plan_renew_nag_click',
			expect.objectContaining( {
				source: 'plan',
				surface: 'dashboard-sites-list',
				state: 'approaching_expiry',
				urgency: 'error',
				is_plan_owner: true,
				days_remaining: 3,
				cta: 'renew',
			} )
		);
	} );

	test( 'tells a click on an expired trial apart from a renewal', async () => {
		const { getByRole, recordTracksEvent } = renderPlan( {
			site: makeSite( {
				product_slug: DotcomPlans.ECOMMERCE_TRIAL_MONTHLY,
				product_name_short: 'Trial',
				expired: true,
				user_is_owner: true,
			} ),
		} );

		await userEvent.click( getByRole( 'link' ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_sites_plan_renew_nag_click',
			expect.objectContaining( { cta: 'upgrade', state: 'expired_grace' } )
		);
	} );

	test( 'a site its funnel is holding for checkout links its owner back to finish buying it', async () => {
		mockPendingFunnelSite( {
			pending: true,
			blog_id: SITE_ID,
			site_slug: 'test.wordpress.com',
			funnel_slug: 'blueprint',
			funnel_args: { blueprint_slug: 'punk' },
		} );

		const { container, findByRole } = renderPlan( { site: makeAtomicFreeSite() } );

		const link = await findByRole( 'link' );
		expect( link ).toHaveTextContent( 'Finish setup' );
		expect( link ).toHaveAttribute(
			'href',
			wpcomLink( '/setup/onboarding?wow_funnel=blueprint&blueprint=punk' )
		);
		// Not "Free": the site is waiting for the plan in its owner's cart.
		expect( container.textContent ).toContain( 'Awaiting checkout' );
		expect( container.textContent ).not.toContain( 'Free' );
	} );

	test( 'a held site whose funnel run carries no blueprint links to the funnel alone', async () => {
		mockPendingFunnelSite( {
			pending: true,
			blog_id: SITE_ID,
			site_slug: 'test.wordpress.com',
			funnel_slug: 'default',
			funnel_args: {},
		} );

		const { findByRole } = renderPlan( { site: makeAtomicFreeSite() } );

		expect( await findByRole( 'link' ) ).toHaveAttribute(
			'href',
			wpcomLink( '/setup/onboarding?wow_funnel=default' )
		);
	} );

	test( 'records a click on the finish setup link', async () => {
		mockPendingFunnelSite( {
			pending: true,
			blog_id: SITE_ID,
			site_slug: 'test.wordpress.com',
			funnel_slug: 'blueprint',
			funnel_args: { blueprint_slug: 'punk' },
		} );

		const { findByRole, recordTracksEvent } = renderPlan( { site: makeAtomicFreeSite() } );

		await userEvent.click( await findByRole( 'link' ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_sites_plan_finish_setup_click',
			{ surface: 'dashboard-sites-list', funnel: 'blueprint' }
		);
	} );

	test( 'an Atomic site on the Free plan that no funnel is holding keeps its plan name', async () => {
		const scope = mockPendingFunnelSite( { pending: false } );

		const { container, queryByRole } = renderPlan( { site: makeAtomicFreeSite() } );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		expect( container.textContent ).toBe( 'Free' );
		expect( queryByRole( 'link' ) ).not.toBeInTheDocument();
	} );

	test( 'a held site that is a different one leaves this row alone', async () => {
		const scope = mockPendingFunnelSite( {
			pending: true,
			blog_id: SITE_ID + 1,
			site_slug: 'other.wordpress.com',
			funnel_slug: 'blueprint',
			funnel_args: { blueprint_slug: 'punk' },
		} );

		const { container, queryByRole } = renderPlan( { site: makeAtomicFreeSite() } );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		expect( container.textContent ).toBe( 'Free' );
		expect( queryByRole( 'link' ) ).not.toBeInTheDocument();
	} );

	test( 'a held site whose run the entry URL cannot express gets no link', async () => {
		// Re-entering with a URL that does not name the same run would offer only to discard
		// the site, and a funnel the flow does not know would start ordinary onboarding.
		const unknownArg = mockPendingFunnelSite( {
			pending: true,
			blog_id: SITE_ID,
			site_slug: 'test.wordpress.com',
			funnel_slug: 'blueprint',
			funnel_args: { blueprint_slug: 'punk', something_new: '1' },
		} );
		const first = renderPlan( { site: makeAtomicFreeSite() } );
		await waitFor( () => expect( unknownArg.isDone() ).toBe( true ) );
		expect( first.container.textContent ).toBe( 'Free' );
		expect( first.queryByRole( 'link' ) ).not.toBeInTheDocument();
		first.unmount();

		const unknownFunnel = mockPendingFunnelSite( {
			pending: true,
			blog_id: SITE_ID,
			site_slug: 'test.wordpress.com',
			funnel_slug: 'not-a-funnel-this-client-knows',
			funnel_args: {},
		} );
		const second = renderPlan( { site: makeAtomicFreeSite() } );
		await waitFor( () => expect( unknownFunnel.isDone() ).toBe( true ) );
		expect( second.container.textContent ).toBe( 'Free' );
		expect( second.queryByRole( 'link' ) ).not.toBeInTheDocument();
	} );

	test( 'a lookup that fails leaves the plan name as it was', async () => {
		const scope = mockPendingFunnelSite( { code: 'rest_forbidden' }, 403 );

		const { container, queryByRole } = renderPlan( { site: makeAtomicFreeSite() } );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		expect( container.textContent ).toBe( 'Free' );
		expect( queryByRole( 'link' ) ).not.toBeInTheDocument();
	} );

	test( 'a site that could not be held never asks', async () => {
		// Simple, and paid: neither can be a site a funnel is holding for checkout.
		const scope = mockPendingFunnelSite( { pending: false } );

		renderPlan( { site: makeSite( { product_name_short: 'Premium' } ) } );
		renderPlan( {
			site: { ...makeSite( { product_name_short: 'Business' } ), is_wpcom_atomic: true } as Site,
		} );

		// Long enough for a query that was going to fire to have fired.
		await new Promise( ( resolve ) => setTimeout( resolve, 50 ) );
		expect( scope.isDone() ).toBe( false );
	} );

	test( 'an expired trial sends the subscriber to buy a plan instead of renewing one', () => {
		const { getByRole } = renderPlan( {
			site: makeSite( {
				product_slug: DotcomPlans.ECOMMERCE_TRIAL_MONTHLY,
				product_name_short: 'Trial',
				expired: true,
				user_is_owner: true,
			} ),
		} );

		const link = getByRole( 'link' );
		expect( link ).toHaveTextContent( 'Plan expired' );
		expect( link ).toHaveAttribute(
			'href',
			expect.stringContaining( '/plans/test.wordpress.com' )
		);
	} );
} );

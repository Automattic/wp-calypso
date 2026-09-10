/**
 * @jest-environment jsdom
 */
import { DotcomPlans, SubscriptionBillPeriod } from '@automattic/api-core';
import { QueryClient } from '@tanstack/react-query';
import MockDate from 'mockdate';
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
	test( 'for self-hosted, Jetpack-connected sites, active Jetpack plugin, it renders the Jetpack logo and plan name', () => {
		const { container } = render(
			<Plan site={ makeSite() } isJetpack isSelfHostedJetpackConnected value="Free" />
		);
		expect( container.querySelector( 'svg' ) ).toBeInTheDocument();
		expect( container.textContent ).toBe( 'Free' );
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

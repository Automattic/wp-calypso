/** @vitest-environment jsdom */

import {
	PLAN_BUSINESS,
	PLAN_PREMIUM,
	PLAN_PERSONAL,
	PLAN_ECOMMERCE,
	PLAN_FREE,
	PlanSlug,
	isProPlan,
} from '@automattic/calypso-products';
import { screen } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';
import { useMarketingMessage } from 'calypso/components/marketing-message/use-marketing-message';
import { getDiscountByName } from 'calypso/lib/discounts';
import PlanNotice from 'calypso/my-sites/plans-features-main/components/plan-notice';
import { useUpgradeCreditsNoticeData } from 'calypso/my-sites/plans-features-main/hooks/use-upgrade-credits-notice';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getRawSitePurchases } from 'calypso/state/purchases/selectors/get-raw-site-purchases';
import {
	isCurrentUserCurrentPlanOwner,
	isRequestingSitePlans,
} from 'calypso/state/sites/plans/selectors';
import { isCurrentPlanPaid } from 'calypso/state/sites/selectors';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import type { Purchase } from '@automattic/api-core';

vi.mock( '@automattic/calypso-products', async () => ( {
	...( await vi.importActual< typeof import( '@automattic/calypso-products' ) >(
		'@automattic/calypso-products'
	) ),
	isProPlan: vi.fn(),
	isStarterPlan: vi.fn(),
} ) );
vi.mock( 'calypso/state/sites/plans/selectors', () => ( {
	isCurrentUserCurrentPlanOwner: vi.fn(),
	isRequestingSitePlans: vi.fn(),
	getCurrentPlan: vi.fn(),
} ) );
vi.mock( 'calypso/state/sites/selectors', () => ( {
	isCurrentPlanPaid: vi.fn(),
	getSitePlan: vi.fn(),
} ) );
vi.mock( 'calypso/components/marketing-message/use-marketing-message', () => ( {
	useMarketingMessage: vi.fn(),
} ) );
vi.mock( 'calypso/lib/discounts', () => ( {
	getDiscountByName: vi.fn(),
} ) );
vi.mock( 'calypso/my-sites/plans-features-main/hooks/use-upgrade-credits-notice', () => ( {
	useUpgradeCreditsNoticeData: vi.fn(),
} ) );
vi.mock( 'calypso/my-sites/plans-features-main/hooks/use-max-plan-upgrade-credits', () => ( {
	useMaxPlanUpgradeCredits: vi.fn(),
} ) );
vi.mock( 'calypso/state/currency-code/selectors', () => ( {
	getCurrentUserCurrencyCode: vi.fn(),
} ) );
vi.mock( '@automattic/calypso-config' );
vi.mock( 'calypso/state/purchases/selectors/get-raw-site-purchases', () => ( {
	getRawSitePurchases: vi.fn(),
} ) );
vi.mock( 'calypso/components/data/query-site-purchases', () => {
	return {
		default: function MockQuerySitePurchases() {
			return null;
		},
	};
} );

const plansList: PlanSlug[] = [
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
];
const discount = {
	name: 'simple_payments_jetpack',
	startsAt: new Date( 2018, 6, 9, 0, 0, 0 ),
	endsAt: new Date( 2018, 8, 9, 23, 59, 59 ),
	plansPageNoticeText: 'This is the most fantastic discount in the whole wide world',
	targetPlans: [],
};
describe( '<PlanNotice /> Tests', () => {
	beforeEach( () => {
		vi.resetAllMocks();

		vi.mocked( getDiscountByName ).mockReturnValue( false );
		vi.mocked( useMarketingMessage ).mockReturnValue( [ false, [], () => ( {} ) ] );
		vi.mocked( isCurrentPlanPaid ).mockReturnValue( true );
		vi.mocked( isCurrentUserCurrentPlanOwner ).mockReturnValue( true );
		vi.mocked( isRequestingSitePlans ).mockReturnValue( true );
		vi.mocked( getCurrentUserCurrencyCode ).mockReturnValue( 'USD' );
		vi.mocked( useUpgradeCreditsNoticeData ).mockReturnValue( { credits: 100, source: 'plan' } );
		vi.mocked( getRawSitePurchases ).mockReturnValue( [] );
		vi.mocked( isProPlan ).mockReturnValue( false );
	} );

	test( 'A contact site owner <PlanNotice /> should be shown no matter what other conditions are met, when the current site owner is not logged in, and the site plan is paid', () => {
		vi.mocked( getDiscountByName ).mockReturnValue( discount );
		vi.mocked( isCurrentPlanPaid ).mockReturnValue( true );
		vi.mocked( isCurrentUserCurrentPlanOwner ).mockReturnValue( false );

		renderWithProvider(
			<PlanNotice
				discountInformation={ { coupon: 'test', discountEndDate: new Date() } }
				visiblePlans={ plansList }
				isInSignup={ false }
				siteId={ 10000000 }
			/>
		);
		expect( screen.getByRole( 'status' ).textContent ).toBe(
			'This plan was purchased by a different WordPress.com account. To manage this plan, log in to that account or contact the account owner.'
		);
	} );

	test( 'A discount <PlanNotice /> should be shown if the user is the site owner and no matter what other conditions are met', () => {
		vi.mocked( isCurrentUserCurrentPlanOwner ).mockReturnValue( true );
		vi.mocked( isCurrentPlanPaid ).mockReturnValue( true );
		vi.mocked( getDiscountByName ).mockReturnValue( discount );

		renderWithProvider(
			<PlanNotice
				discountInformation={ { coupon: 'test', discountEndDate: new Date() } }
				visiblePlans={ plansList }
				isInSignup={ false }
				siteId={ 32234 }
			/>
		);
		expect( screen.getByRole( 'status' ).textContent ).toBe( discount.plansPageNoticeText );
	} );

	test( 'A marketing message <PlanNotice /> when no other notices are available and marketing messages are available and the user is not in signup', () => {
		vi.mocked( isCurrentUserCurrentPlanOwner ).mockReturnValue( true );
		vi.mocked( isCurrentPlanPaid ).mockReturnValue( true );
		vi.mocked( getDiscountByName ).mockReturnValue( false );
		vi.mocked( useUpgradeCreditsNoticeData ).mockReturnValue( null );
		vi.mocked( useMarketingMessage ).mockReturnValue( [
			false,
			[ { id: '12121', text: 'An important marketing message' } ],
			() => ( {} ),
		] );
		//
		renderWithProvider(
			<PlanNotice
				discountInformation={ { coupon: 'test', discountEndDate: new Date() } }
				visiblePlans={ plansList }
				isInSignup={ false }
				siteId={ 32234 }
			/>
		);
		expect( screen.getByRole( 'status' ).textContent ).toBe( 'An important marketing message' );
	} );

	test( 'No <PlanNotice /> should be shown when in signup', () => {
		vi.mocked( isCurrentUserCurrentPlanOwner ).mockReturnValue( true );
		vi.mocked( isCurrentPlanPaid ).mockReturnValue( true );
		vi.mocked( getDiscountByName ).mockReturnValue( false );
		vi.mocked( useUpgradeCreditsNoticeData ).mockReturnValue( null );
		vi.mocked( useMarketingMessage ).mockReturnValue( [
			false,
			[ { id: '12121', text: 'An important marketing message' } ],
			() => ( {} ),
		] );
		//
		renderWithProvider(
			<PlanNotice
				discountInformation={ { coupon: 'test', discountEndDate: new Date() } }
				visiblePlans={ plansList }
				isInSignup
				siteId={ 32234 }
			/>
		);
		expect( screen.queryByRole( 'status' ) ).not.toBeInTheDocument();
	} );

	test( 'Show retired plan <PlanNotice /> when the current site has the pro plan', () => {
		vi.mocked( isProPlan ).mockReturnValue( true );
		renderWithProvider(
			<PlanNotice
				discountInformation={ { coupon: 'test', discountEndDate: new Date() } }
				visiblePlans={ plansList }
				isInSignup={ false }
				siteId={ 32234 }
			/>
		);
		expect( screen.getByRole( 'status' ).textContent ).toBe(
			'Your current plan is no longer available for new subscriptions. You’re all set to continue with the plan for as long as you like. Alternatively, you can switch to any of our current plans by selecting it below. Please keep in mind that switching plans will be irreversible.'
		);
	} );

	test( 'Show in app purchase <PlanNotice /> when the current site was purchased in an app', () => {
		renderWithProvider(
			<PlanNotice
				currentPurchase={ { is_iap_purchase: true } as Purchase }
				discountInformation={ { coupon: 'test', discountEndDate: new Date() } }
				visiblePlans={ plansList }
				isInSignup={ false }
				siteId={ 32234 }
			/>
		);
		expect( screen.getByRole( 'status' ).textContent ).toBe(
			'Your current plan is an in-app purchase. You can upgrade to a different plan from within the WordPress app.'
		);
	} );

	test( 'Shows "domain and other upgrades" copy when source is domain and the site has other upgrades purchased', () => {
		vi.mocked( useUpgradeCreditsNoticeData ).mockReturnValue( { credits: 4600, source: 'domain' } );
		vi.mocked( getRawSitePurchases ).mockReturnValue( [
			{
				product_slug: 'premium_theme',
			},
		] as unknown as Purchase[] );

		renderWithProvider(
			<PlanNotice visiblePlans={ plansList } isInSignup={ false } siteId={ 32234 } />
		);

		expect( screen.getByRole( 'status' ).textContent ).toContain(
			'available from your current domain and other upgrades'
		);
	} );

	test( 'Shows "other upgrades" copy when source is other-upgrades', () => {
		vi.mocked( useUpgradeCreditsNoticeData ).mockReturnValue( {
			credits: 4600,
			source: 'other-upgrades',
		} );

		renderWithProvider(
			<PlanNotice visiblePlans={ plansList } isInSignup={ false } siteId={ 32234 } />
		);

		expect( screen.getByRole( 'status' ).textContent ).toContain( 'available from other upgrades' );
	} );

	test( 'Shows "domain and other upgrades" copy when source is domain-and-other-upgrades', () => {
		vi.mocked( useUpgradeCreditsNoticeData ).mockReturnValue( {
			credits: 4600,
			source: 'domain-and-other-upgrades',
		} );

		renderWithProvider(
			<PlanNotice visiblePlans={ plansList } isInSignup={ false } siteId={ 32234 } />
		);

		expect( screen.getByRole( 'status' ).textContent ).toContain(
			'available from your current domain and other upgrades'
		);
	} );
} );

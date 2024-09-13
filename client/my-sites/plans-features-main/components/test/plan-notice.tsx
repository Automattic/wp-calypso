/** @jest-environment jsdom */

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
import { useMarketingMessage } from 'calypso/components/marketing-message/use-marketing-message';
import { getDiscountByName } from 'calypso/lib/discounts';
import { Purchase } from 'calypso/lib/purchases/types';
import PlanNotice from 'calypso/my-sites/plans-features-main/components/plan-notice';
import { usePlanUpgradeCreditsApplicable } from 'calypso/my-sites/plans-features-main/hooks/use-plan-upgrade-credits-applicable';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getByPurchaseId } from 'calypso/state/purchases/selectors';
import {
	isCurrentUserCurrentPlanOwner,
	isRequestingSitePlans,
} from 'calypso/state/sites/plans/selectors';
import { isCurrentPlanPaid } from 'calypso/state/sites/selectors';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';

jest.mock( '@automattic/calypso-products', () => ( {
	isProPlan: jest.fn(),
	isStarterPlan: jest.fn(),
} ) );
jest.mock( 'calypso/state/purchases/selectors', () => ( {
	getByPurchaseId: jest.fn(),
} ) );
jest.mock( 'calypso/state/sites/plans/selectors', () => ( {
	isCurrentUserCurrentPlanOwner: jest.fn(),
	isRequestingSitePlans: jest.fn(),
	getCurrentPlan: jest.fn(),
} ) );
jest.mock( 'calypso/state/sites/selectors', () => ( {
	isCurrentPlanPaid: jest.fn(),
	getSitePlan: jest.fn(),
} ) );
jest.mock( 'calypso/components/marketing-message/use-marketing-message', () => ( {
	useMarketingMessage: jest.fn(),
} ) );
jest.mock( 'calypso/lib/discounts', () => ( {
	getDiscountByName: jest.fn(),
} ) );
jest.mock(
	'calypso/my-sites/plans-features-main/hooks/use-plan-upgrade-credits-applicable',
	() => ( {
		usePlanUpgradeCreditsApplicable: jest.fn(),
	} )
);
jest.mock( 'calypso/my-sites/plans-features-main/hooks/use-max-plan-upgrade-credits', () => ( {
	useMaxPlanUpgradeCredits: jest.fn(),
} ) );
jest.mock( 'calypso/state/currency-code/selectors', () => ( {
	getCurrentUserCurrencyCode: jest.fn(),
} ) );

const mGetDiscountByName = getDiscountByName as jest.MockedFunction< typeof getDiscountByName >;
const mUseMarketingMessage = useMarketingMessage as jest.MockedFunction<
	typeof useMarketingMessage
>;
const mIsCurrentPlanPaid = isCurrentPlanPaid as jest.MockedFunction< typeof isCurrentPlanPaid >;
const mIsCurrentUserCurrentPlanOwner = isCurrentUserCurrentPlanOwner as jest.MockedFunction<
	typeof isCurrentUserCurrentPlanOwner
>;
const mIsRequestingSitePlans = isRequestingSitePlans as jest.MockedFunction<
	typeof isRequestingSitePlans
>;
const mUsePlanUpgradeCreditsApplicable = usePlanUpgradeCreditsApplicable as jest.MockedFunction<
	typeof usePlanUpgradeCreditsApplicable
>;
const mGetCurrentUserCurrencyCode = getCurrentUserCurrencyCode as jest.MockedFunction<
	typeof getCurrentUserCurrencyCode
>;
const mGetByPurchaseId = getByPurchaseId as jest.MockedFunction< typeof getByPurchaseId >;
const mIsProPlan = isProPlan as jest.MockedFunction< typeof isProPlan >;

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
		jest.resetAllMocks();

		mGetDiscountByName.mockImplementation( () => false );
		mUseMarketingMessage.mockImplementation( () => [ false, [], () => ( {} ) ] );
		mIsCurrentPlanPaid.mockImplementation( () => true );
		mIsCurrentUserCurrentPlanOwner.mockImplementation( () => true );
		mIsRequestingSitePlans.mockImplementation( () => true );
		mGetCurrentUserCurrencyCode.mockImplementation( () => 'USD' );
		mUsePlanUpgradeCreditsApplicable.mockImplementation( () => 100 );
		mGetByPurchaseId.mockImplementation( () => ( { isInAppPurchase: false } ) as Purchase );
		mIsProPlan.mockImplementation( () => false );
	} );

	test( 'A contact site owner <PlanNotice /> should be shown no matter what other conditions are met, when the current site owner is not logged in, and the site plan is paid', () => {
		mGetDiscountByName.mockImplementation( () => discount );
		mUsePlanUpgradeCreditsApplicable.mockImplementation( () => 100 );
		mIsCurrentPlanPaid.mockImplementation( () => true );
		mIsCurrentUserCurrentPlanOwner.mockImplementation( () => false );

		renderWithProvider(
			<PlanNotice
				discountInformation={ { withDiscount: 'test', discountEndDate: new Date() } }
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
		mIsCurrentUserCurrentPlanOwner.mockImplementation( () => true );
		mIsCurrentPlanPaid.mockImplementation( () => true );
		mGetDiscountByName.mockImplementation( () => discount );
		mUsePlanUpgradeCreditsApplicable.mockImplementation( () => 100 );

		renderWithProvider(
			<PlanNotice
				discountInformation={ { withDiscount: 'test', discountEndDate: new Date() } }
				visiblePlans={ plansList }
				isInSignup={ false }
				siteId={ 32234 }
			/>
		);
		expect( screen.getByRole( 'status' ).textContent ).toBe( discount.plansPageNoticeText );
	} );

	test( 'A plan upgrade credit <PlanNotice /> should be shown in a site where a plan is purchased, without other active discounts, has upgradeable plan and, the site owner is logged in', () => {
		mIsCurrentUserCurrentPlanOwner.mockImplementation( () => true );
		mIsCurrentPlanPaid.mockImplementation( () => true );
		mGetDiscountByName.mockImplementation( () => false );
		mUsePlanUpgradeCreditsApplicable.mockImplementation( () => 10000 );

		renderWithProvider(
			<PlanNotice
				discountInformation={ { withDiscount: 'test', discountEndDate: new Date() } }
				visiblePlans={ plansList }
				isInSignup={ false }
				siteId={ 32234 }
			/>
		);
		expect( screen.getByRole( 'status' ).textContent ).toBe(
			'You have $100.00 in upgrade credits available from your current plan. This credit will be applied to the pricing below at checkout if you upgrade today!'
		);
	} );

	test( 'A marketing message <PlanNotice /> when no other notices are available and marketing messages are available and the user is not in signup', () => {
		mIsCurrentUserCurrentPlanOwner.mockImplementation( () => true );
		mIsCurrentPlanPaid.mockImplementation( () => true );
		mGetDiscountByName.mockImplementation( () => false );
		mUsePlanUpgradeCreditsApplicable.mockImplementation( () => null );
		mUseMarketingMessage.mockImplementation( () => [
			false,
			[ { id: '12121', text: 'An important marketing message' } ],
			() => ( {} ),
		] );
		//
		renderWithProvider(
			<PlanNotice
				discountInformation={ { withDiscount: 'test', discountEndDate: new Date() } }
				visiblePlans={ plansList }
				isInSignup={ false }
				siteId={ 32234 }
			/>
		);
		expect( screen.getByRole( 'status' ).textContent ).toBe( 'An important marketing message' );
	} );

	test( 'No <PlanNotice /> should be shown when in signup', () => {
		mIsCurrentUserCurrentPlanOwner.mockImplementation( () => true );
		mIsCurrentPlanPaid.mockImplementation( () => true );
		mGetDiscountByName.mockImplementation( () => false );
		mUsePlanUpgradeCreditsApplicable.mockImplementation( () => null );
		mUseMarketingMessage.mockImplementation( () => [
			false,
			[ { id: '12121', text: 'An important marketing message' } ],
			() => ( {} ),
		] );
		//
		renderWithProvider(
			<PlanNotice
				discountInformation={ { withDiscount: 'test', discountEndDate: new Date() } }
				visiblePlans={ plansList }
				isInSignup
				siteId={ 32234 }
			/>
		);
		expect( screen.queryByRole( 'status' ) ).not.toBeInTheDocument();
	} );

	test( 'Show retired plan <PlanNotice /> when the current site has the pro plan', () => {
		mIsProPlan.mockImplementation( () => true );
		renderWithProvider(
			<PlanNotice
				discountInformation={ { withDiscount: 'test', discountEndDate: new Date() } }
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
		mGetByPurchaseId.mockImplementation( () => ( { isInAppPurchase: true } ) as Purchase );
		renderWithProvider(
			<PlanNotice
				discountInformation={ { withDiscount: 'test', discountEndDate: new Date() } }
				visiblePlans={ plansList }
				isInSignup={ false }
				siteId={ 32234 }
			/>
		);
		expect( screen.getByRole( 'status' ).textContent ).toBe(
			'Your current plan is an in-app purchase. You can upgrade to a different plan from within the WordPress app.'
		);
	} );
} );

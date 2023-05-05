/** @jest-environment jsdom */

import {
	PLAN_BUSINESS,
	PLAN_PREMIUM,
	PLAN_PERSONAL,
	PLAN_ECOMMERCE,
	PLAN_FREE,
	PlanSlug,
} from '@automattic/calypso-products';
import { screen } from '@testing-library/react';
import React from 'react';
import { useMarketingMessage } from 'calypso/components/marketing-message/use-marketing-message';
import { getDiscountByName } from 'calypso/lib/discounts';
import PlanNotice from 'calypso/my-sites/plans-features-main/components/plan-notice';
import { usePlanUpgradeCreditsDisplay } from 'calypso/my-sites/plans-features-main/hooks/use-plan-upgrade-credits-display';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { isCurrentUserCurrentPlanOwner } from 'calypso/state/sites/plans/selectors';
import { isCurrentPlanPaid } from 'calypso/state/sites/selectors';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';

jest.mock( 'calypso/state/sites/plans/selectors', () => ( {
	isCurrentUserCurrentPlanOwner: jest.fn(),
} ) );
jest.mock( 'calypso/state/sites/selectors', () => ( {
	isCurrentPlanPaid: jest.fn(),
} ) );
jest.mock( 'calypso/components/marketing-message/use-marketing-message', () => ( {
	useMarketingMessage: jest.fn(),
} ) );
jest.mock( 'calypso/lib/discounts', () => ( {
	getDiscountByName: jest.fn(),
} ) );
jest.mock( 'calypso/my-sites/plans-features-main/hooks/use-plan-upgrade-credits-display', () => ( {
	usePlanUpgradeCreditsDisplay: jest.fn(),
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
const mUsePlanUpgradeCreditsDisplay = usePlanUpgradeCreditsDisplay as jest.MockedFunction<
	typeof usePlanUpgradeCreditsDisplay
>;
const mGetCurrentUserCurrencyCode = getCurrentUserCurrencyCode as jest.MockedFunction<
	typeof getCurrentUserCurrencyCode
>;

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
		mGetCurrentUserCurrencyCode.mockImplementation( () => 'USD' );
		mUsePlanUpgradeCreditsDisplay.mockImplementation( () => ( {
			creditsValue: 100,
			isPlanUpgradeCreditEligible: true,
		} ) );
	} );

	test( 'A contact site owner <PlanNotice /> should be shown no matter what other conditions are met, when the current site owner is not logged in, and the site is on the plan is paid', () => {
		mGetDiscountByName.mockImplementation( () => discount );
		mUsePlanUpgradeCreditsDisplay.mockImplementation( () => ( {
			creditsValue: 100,
			isPlanUpgradeCreditEligible: true,
		} ) );
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
		mUsePlanUpgradeCreditsDisplay.mockImplementation( () => ( {
			creditsValue: 100,
			isPlanUpgradeCreditEligible: true,
		} ) );

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
		mUsePlanUpgradeCreditsDisplay.mockImplementation( () => ( {
			creditsValue: 100,
			isPlanUpgradeCreditEligible: true,
		} ) );

		renderWithProvider(
			<PlanNotice
				discountInformation={ { withDiscount: 'test', discountEndDate: new Date() } }
				visiblePlans={ plansList }
				isInSignup={ false }
				siteId={ 32234 }
			/>
		);
		expect( screen.getByRole( 'status' ).textContent ).toBe(
			'You have $100.00 of pro-rated credits available from your current plan. Apply those credits towards an upgrade before they expire!'
		);
	} );

	test( 'A marketing message <PlanNotice /> when no other notices are available and marketing messages are available and the user is not in signup', () => {
		mIsCurrentUserCurrentPlanOwner.mockImplementation( () => true );
		mIsCurrentPlanPaid.mockImplementation( () => true );
		mGetDiscountByName.mockImplementation( () => false );
		mUsePlanUpgradeCreditsDisplay.mockImplementation( () => ( {
			creditsValue: 0,
			isPlanUpgradeCreditEligible: false,
		} ) );
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
		mUsePlanUpgradeCreditsDisplay.mockImplementation( () => ( {
			creditsValue: 0,
			isPlanUpgradeCreditEligible: false,
		} ) );
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
				isInSignup={ true }
				siteId={ 32234 }
			/>
		);
		expect( screen.queryByRole( 'status' ) ).not.toBeInTheDocument();
	} );
} );

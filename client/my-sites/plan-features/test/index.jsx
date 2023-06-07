/**
 * @jest-environment jsdom
 */

jest.mock( 'calypso/state/sites/plans/selectors', () => ( {
	getPlanDiscountedRawPrice: jest.fn(),
	getSitePlanRawPrice: jest.fn(),
} ) );

jest.mock( 'calypso/components/marketing-message', () => () => null );
jest.mock( 'calypso/lib/discounts', () => ( {
	getDiscountByName: jest.fn(),
} ) );

import {
	PLAN_FREE,
	PLAN_BLOGGER,
	PLAN_BLOGGER_2_YEARS,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_BUSINESS,
} from '@automattic/calypso-products';
import { screen } from '@testing-library/react';
import ReactDOM from 'react-dom';
import { getDiscountByName } from 'calypso/lib/discounts';
import activePromotions from 'calypso/state/active-promotions/reducer';
import {
	getPlanDiscountedRawPrice,
	getSitePlanRawPrice,
} from 'calypso/state/sites/plans/selectors';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { calculatePlanCredits, isPrimaryUpgradeByPlanDelta, PlanFeatures } from '../index';

const identity = ( x ) => x;

const render = ( el, options ) =>
	renderWithProvider(
		<>
			<div className="plans-features-main__notice" data-testid="mock-notice-wrapper" />
			{ el }
		</>,
		{
			reducers: {
				activePromotions,
			},
			...options,
		}
	);

describe( 'isPrimaryUpgradeByPlanDelta', () => {
	test( 'Should return true when called with blogger and personal plan', () => {
		expect( isPrimaryUpgradeByPlanDelta( PLAN_BLOGGER, PLAN_PERSONAL ) ).toBe( true );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_BLOGGER_2_YEARS, PLAN_PERSONAL ) ).toBe( true );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_BLOGGER, PLAN_PERSONAL_2_YEARS ) ).toBe( true );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_BLOGGER_2_YEARS, PLAN_PERSONAL_2_YEARS ) ).toBe(
			true
		);
	} );

	test( 'Should return true when called with personal and premium plan', () => {
		expect( isPrimaryUpgradeByPlanDelta( PLAN_PERSONAL, PLAN_PREMIUM ) ).toBe( true );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_PERSONAL_2_YEARS, PLAN_PREMIUM ) ).toBe( true );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_PERSONAL, PLAN_PREMIUM_2_YEARS ) ).toBe( true );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_PERSONAL_2_YEARS, PLAN_PREMIUM_2_YEARS ) ).toBe(
			true
		);
	} );

	test( 'Should return true when called with premium and business plan', () => {
		expect( isPrimaryUpgradeByPlanDelta( PLAN_PREMIUM, PLAN_BUSINESS ) ).toBe( true );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_PREMIUM, PLAN_BUSINESS_2_YEARS ) ).toBe( true );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_PREMIUM_2_YEARS, PLAN_BUSINESS ) ).toBe( true );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_PREMIUM_2_YEARS, PLAN_BUSINESS_2_YEARS ) ).toBe(
			true
		);
	} );

	test( 'Should return false when called with other plan combinations', () => {
		expect( isPrimaryUpgradeByPlanDelta( PLAN_JETPACK_FREE, PLAN_JETPACK_PREMIUM ) ).toBe( false );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_JETPACK_FREE, PLAN_JETPACK_PERSONAL ) ).toBe( false );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_JETPACK_FREE, PLAN_JETPACK_BUSINESS ) ).toBe( false );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_JETPACK_PERSONAL, PLAN_JETPACK_PREMIUM ) ).toBe(
			false
		);
		expect(
			isPrimaryUpgradeByPlanDelta( PLAN_JETPACK_PERSONAL, PLAN_JETPACK_PREMIUM_MONTHLY )
		).toBe( false );
		expect(
			isPrimaryUpgradeByPlanDelta( PLAN_JETPACK_PERSONAL_MONTHLY, PLAN_JETPACK_PREMIUM_MONTHLY )
		).toBe( false );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_PREMIUM, PLAN_PREMIUM ) ).toBe( false );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_PREMIUM, PLAN_PREMIUM_2_YEARS ) ).toBe( false );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_PREMIUM_2_YEARS, PLAN_PERSONAL ) ).toBe( false );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_BLOGGER, PLAN_BLOGGER ) ).toBe( false );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_BLOGGER, PLAN_BLOGGER_2_YEARS ) ).toBe( false );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_BLOGGER_2_YEARS, PLAN_PREMIUM ) ).toBe( false );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_BUSINESS, PLAN_BUSINESS_2_YEARS ) ).toBe( false );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_BUSINESS, PLAN_PREMIUM ) ).toBe( false );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_BUSINESS, PLAN_BLOGGER ) ).toBe( false );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_BUSINESS, PLAN_PERSONAL ) ).toBe( false );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_BUSINESS, PLAN_FREE ) ).toBe( false );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_FREE, PLAN_PREMIUM ) ).toBe( false );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_FREE, PLAN_BLOGGER ) ).toBe( false );
		expect( isPrimaryUpgradeByPlanDelta( PLAN_FREE, PLAN_PERSONAL ) ).toBe( false );
	} );
} );

describe( 'PlanFeatures.renderUpgradeDisabledNotice', () => {
	const baseProps = {
		planProperties: [],
		recordTracksEvent: jest.fn(),
		translate: identity,
	};

	const originalCreatePortal = ReactDOM.createPortal;
	beforeAll( () => {
		ReactDOM.createPortal = ( elem ) => elem;
		// Necessary to trick `PlanFeatures.getBannerContainer()` into retrieving the notice container.
		jest.spyOn( document, 'querySelector' ).mockImplementation( ( selector ) => {
			switch ( selector ) {
				case '.plans-features-main__notice': {
					return <div />;
				}
			}
		} );
	} );

	afterAll( () => {
		ReactDOM.createPortal = originalCreatePortal;
		document.querySelector.mockRestore();
	} );

	test( 'Should display a notice when component is fully rendered and user is unable to buy a plan', () => {
		render( <PlanFeatures { ...baseProps } hasPlaceholders={ false } canPurchase={ false } /> );

		expect( screen.getByRole( 'status' ) ).toHaveTextContent(
			'This plan was purchased by a different WordPress.com account. To manage this plan, log in to that account or contact the account owner.'
		);
	} );

	test( 'Should not display a notice when component is not fully rendered yet', () => {
		render( <PlanFeatures { ...baseProps } hasPlaceholders canPurchase={ false } /> );

		expect( screen.queryByRole( 'status' ) ).not.toBeInTheDocument();
	} );
	test( 'Should not display a notice when user is able to buy a plan', () => {
		render( <PlanFeatures { ...baseProps } hasPlaceholders={ false } canPurchase /> );

		expect( screen.queryByRole( 'status' ) ).not.toBeInTheDocument();
	} );
} );

describe( 'calculatePlanCredits', () => {
	const baseProps = {
		planConstantObj: {
			getProductId() {},
		},
	};
	beforeEach( () => {
		getPlanDiscountedRawPrice.mockReset();
		getSitePlanRawPrice.mockReset();
	} );
	test( 'Should return max annual price difference between all available plans - 1 plan', () => {
		getPlanDiscountedRawPrice.mockReturnValueOnce( 80 );
		getSitePlanRawPrice.mockReturnValueOnce( 100 );
		const credits = calculatePlanCredits( {}, 1, [ { ...baseProps, availableForPurchase: true } ] );
		expect( credits ).toBe( 20 );
	} );
	test( 'Should return max annual price difference between all available plans - 3 plans', () => {
		getPlanDiscountedRawPrice
			.mockReturnValueOnce( 80 )
			.mockReturnValueOnce( 60 )
			.mockReturnValueOnce( 70 );

		getSitePlanRawPrice
			.mockReturnValueOnce( 100 )
			.mockReturnValueOnce( 90 )
			.mockReturnValueOnce( 130 );
		const credits = calculatePlanCredits( {}, 1, [
			{ ...baseProps, availableForPurchase: true },
			{ ...baseProps, availableForPurchase: true },
			{ ...baseProps, availableForPurchase: true },
		] );
		expect( credits ).toBe( 60 );
	} );
	test( 'Should return max annual price difference between all available plans - 3 plans, one unavailable', () => {
		getPlanDiscountedRawPrice
			.mockReturnValueOnce( 80 )
			.mockReturnValueOnce( 60 )
			.mockReturnValueOnce( 70 );

		getSitePlanRawPrice
			.mockReturnValueOnce( 100 )
			.mockReturnValueOnce( 90 )
			.mockReturnValueOnce( 130 );
		const credits = calculatePlanCredits( {}, 1, [
			{ ...baseProps, availableForPurchase: true },
			{ ...baseProps, availableForPurchase: false },
			{ ...baseProps, availableForPurchase: true },
		] );
		expect( credits ).toBe( 30 );
	} );
	test( 'Should return 0 when no plan is available', () => {
		getPlanDiscountedRawPrice.mockReturnValueOnce( 70 );
		getSitePlanRawPrice.mockReturnValueOnce( 130 );
		const credits = calculatePlanCredits( {}, 1, [
			{ ...baseProps, availableForPurchase: false },
		] );
		expect( credits ).toBe( 0 );
	} );
	test( 'Should return 0 when difference is negative', () => {
		getPlanDiscountedRawPrice
			.mockReturnValueOnce( 100 )
			.mockReturnValueOnce( 90 )
			.mockReturnValueOnce( 130 );

		getSitePlanRawPrice
			.mockReturnValueOnce( 80 )
			.mockReturnValueOnce( 60 )
			.mockReturnValueOnce( 70 );

		const credits = calculatePlanCredits( {}, 1, [
			{ ...baseProps, availableForPurchase: true },
			{ ...baseProps, availableForPurchase: true },
			{ ...baseProps, availableForPurchase: true },
		] );
		expect( credits ).toBe( 0 );
	} );
} );

/**
 * @deprecated these tests are to be removed in favour of the PlanNotice component.
 * @module calypso/my-sites/plans-features-main/components/plan-notice
 */
describe( 'PlanFeatures.renderCreditNotice', () => {
	const noticeText = 'Foo bar';
	const baseProps = {
		translate: identity,
		canPurchase: true,
		hasPlaceholders: false,
		planCredits: 5,
		planProperties: [],
		showPlanCreditsApplied: true,
		isJetpack: false,
		isSiteAT: false,
		recordTracksEvent: jest.fn(),
	};

	const originalCreatePortal = ReactDOM.createPortal;
	beforeEach( () => {
		ReactDOM.createPortal = ( elem ) => elem;
		jest.spyOn( document, 'querySelector' ).mockImplementation( ( selector ) => {
			switch ( selector ) {
				case '.plans-features-main__notice': {
					return <div />;
				}
			}
		} );
		getDiscountByName.mockImplementation( () => {
			return null;
		} );
	} );

	afterEach( () => {
		ReactDOM.createPortal = originalCreatePortal;
	} );

	test( 'Should display a credit notice when rendering a purchasable discounted plan', () => {
		getDiscountByName.mockImplementation( () => {
			return {
				plansPageNoticeTextTitle: noticeText,
			};
		} );

		render( <PlanFeatures { ...baseProps } /> );

		const notice = screen.getByRole( 'status' );
		expect( notice ).toHaveTextContent( noticeText );
		expect( notice ).toHaveClass( 'plan-features__notice-credits' );
	} );

	test( 'Should not display a credit notice when rendering a non-purchasable plan', () => {
		render( <PlanFeatures { ...baseProps } canPurchase={ false } /> );

		expect( screen.getByRole( 'status' ) ).not.toHaveClass( 'plan-features__notice-credits' );
	} );

	test( 'Should not display a credit notice when placeholders are still being displayed', () => {
		render( <PlanFeatures { ...baseProps } hasPlaceholders /> );

		expect( screen.queryByRole( 'status' ) ).not.toBeInTheDocument();
	} );

	test( 'Should not display a credit notice when showPlanCreditsApplied is false', () => {
		render( <PlanFeatures { ...baseProps } showPlanCreditsApplied={ false } /> );

		expect( screen.queryByRole( 'status' ) ).not.toBeInTheDocument();
	} );

	test( 'Should not display a credit notice when planCredits.amount is 0', () => {
		render( <PlanFeatures { ...baseProps } planCredits={ 0 } /> );

		expect( screen.queryByRole( 'status' ) ).not.toBeInTheDocument();
	} );

	test( 'Should display a credit notice for an atomic site on a Business plan', () => {
		getDiscountByName.mockImplementation( () => {
			return {
				plansPageNoticeTextTitle: noticeText,
			};
		} );

		render( <PlanFeatures { ...baseProps } isJetpack isSiteAT /> );

		const notice = screen.getByRole( 'status' );
		expect( notice ).toHaveTextContent( noticeText );
		expect( notice ).toHaveClass( 'plan-features__notice-credits' );
	} );
} );

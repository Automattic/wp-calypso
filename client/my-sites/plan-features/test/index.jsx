jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );

jest.mock( 'lib/analytics/tracks', () => ( {} ) );
jest.mock( 'lib/analytics/page-view', () => ( {} ) );
jest.mock( 'lib/analytics/ad-tracking', () => ( {} ) );
jest.mock( 'lib/analytics/page-view-tracker', () => 'PageViewTracker' );

jest.mock( 'i18n-calypso', () => ( {
	localize: ( Comp ) => ( props ) => (
		<Comp
			{ ...props }
			translate={ function ( x ) {
				return x;
			} }
		/>
	),
	numberFormat: ( x ) => x,
	translate: ( x ) => x,
} ) );

jest.mock( 'state/sites/plans/selectors', () => ( {
	getPlanDiscountedRawPrice: jest.fn(),
} ) );

jest.mock( 'state/plans/selectors', () => ( {
	getPlanRawPrice: jest.fn(),
} ) );

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';
import ReactDOM from 'react-dom';
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
} from 'lib/plans/constants';

/**
 * Internal dependencies
 */
import { calculatePlanCredits, isPrimaryUpgradeByPlanDelta, PlanFeatures } from '../index';

import { getPlanDiscountedRawPrice } from 'state/sites/plans/selectors';
import { getPlanRawPrice } from 'state/plans/selectors';

const identity = ( x ) => x;

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
		translate: identity,
	};

	const originalCreatePortal = ReactDOM.createPortal;
	beforeAll( () => {
		ReactDOM.createPortal = ( elem ) => elem;
	} );

	afterAll( () => {
		ReactDOM.createPortal = originalCreatePortal;
	} );

	const createInstance = ( props ) => {
		const instance = new PlanFeatures( props );
		instance.getBannerContainer = () => <div />;

		return instance;
	};

	test( 'Should display a notice when component is fully rendered and user is unable to buy a plan', () => {
		const instance = createInstance( {
			...baseProps,
			hasPlaceholders: false,
			canPurchase: false,
		} );
		const wrapper = shallow( instance.renderUpgradeDisabledNotice() );
		expect( wrapper.find( '.plan-features__notice' ).length ).toBe( 1 );
	} );
	test( 'Should not display a notice when component is not fully rendered yet', () => {
		const instance = createInstance( {
			...baseProps,
			hasPlaceholders: true,
			canPurchase: false,
		} );
		expect( instance.renderUpgradeDisabledNotice() ).toBe( null );
	} );
	test( 'Should not display a notice when user is able to buy a plan', () => {
		const instance = createInstance( {
			...baseProps,
			hasPlaceholders: false,
			canPurchase: true,
		} );
		expect( instance.renderUpgradeDisabledNotice() ).toBe( null );
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
		getPlanRawPrice.mockReset();
	} );
	test( 'Should return max annual price difference between all available plans - 1 plan', () => {
		getPlanDiscountedRawPrice.mockReturnValueOnce( 80 );
		getPlanRawPrice.mockReturnValueOnce( 100 );
		const credits = calculatePlanCredits( {}, 1, [ { ...baseProps, availableForPurchase: true } ] );
		expect( credits ).toBe( 20 );
	} );
	test( 'Should return max annual price difference between all available plans - 3 plans', () => {
		getPlanDiscountedRawPrice
			.mockReturnValueOnce( 80 )
			.mockReturnValueOnce( 60 )
			.mockReturnValueOnce( 70 );

		getPlanRawPrice.mockReturnValueOnce( 100 ).mockReturnValueOnce( 90 ).mockReturnValueOnce( 130 );
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

		getPlanRawPrice.mockReturnValueOnce( 100 ).mockReturnValueOnce( 90 ).mockReturnValueOnce( 130 );
		const credits = calculatePlanCredits( {}, 1, [
			{ ...baseProps, availableForPurchase: true },
			{ ...baseProps, availableForPurchase: false },
			{ ...baseProps, availableForPurchase: true },
		] );
		expect( credits ).toBe( 30 );
	} );
	test( 'Should return 0 when no plan is available', () => {
		getPlanDiscountedRawPrice.mockReturnValueOnce( 70 );
		getPlanRawPrice.mockReturnValueOnce( 130 );
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

		getPlanRawPrice.mockReturnValueOnce( 80 ).mockReturnValueOnce( 60 ).mockReturnValueOnce( 70 );

		const credits = calculatePlanCredits( {}, 1, [
			{ ...baseProps, availableForPurchase: true },
			{ ...baseProps, availableForPurchase: true },
			{ ...baseProps, availableForPurchase: true },
		] );
		expect( credits ).toBe( 0 );
	} );
} );

describe( 'PlanFeatures.renderCreditNotice', () => {
	const baseProps = {
		translate: identity,
		canPurchase: true,
		hasPlaceholders: false,
		planCredits: 5,
		planProperties: [
			{ currencyCode: 'USD', planName: 'test-bundle', availableForPurchase: true },
		],
		showPlanCreditsApplied: true,
		isJetpack: false,
		isSiteAT: false,
	};

	const createInstance = ( props ) => {
		const instance = new PlanFeatures( props );
		instance.getBannerContainer = () => <div />;

		return instance;
	};

	const originalCreatePortal = ReactDOM.createPortal;
	beforeAll( () => {
		ReactDOM.createPortal = ( elem ) => elem;
	} );

	afterAll( () => {
		ReactDOM.createPortal = originalCreatePortal;
	} );

	test( 'Should display a credit notice when rendering a purchasable discounted plan', () => {
		const instance = createInstance( baseProps );
		const notice = instance.renderCreditNotice();
		expect( notice ).not.toBe( null );

		const wrapper = shallow( notice );
		expect( wrapper.find( '.plan-features__notice-credits' ).length ).toBe( 1 );
	} );

	test( 'Should not display a credit notice when rendering a non-purchasable plan', () => {
		const instance = createInstance( { ...baseProps, canPurchase: false } );
		const notice = instance.renderCreditNotice();
		expect( notice ).toBe( null );
	} );

	test( 'Should not display a credit notice when placeholders are still being displayed', () => {
		const instance = createInstance( { ...baseProps, hasPlaceholders: true } );
		const notice = instance.renderCreditNotice();
		expect( notice ).toBe( null );
	} );

	test( 'Should not display a credit notice when showPlanCreditsApplied is false', () => {
		const instance = createInstance( { ...baseProps, showPlanCreditsApplied: false } );
		const notice = instance.renderCreditNotice();
		expect( notice ).toBe( null );
	} );

	test( 'Should not display a credit notice when planCredits.amount is 0', () => {
		const instance = createInstance( { ...baseProps, planCredits: 0 } );
		const notice = instance.renderCreditNotice();
		expect( notice ).toBe( null );
	} );

	test( 'Should display a credit notice for an atomic site on a Business plan', () => {
		const instance = createInstance( { ...baseProps, isJetpack: true, isSiteAT: true } );
		const notice = instance.renderCreditNotice();
		expect( notice ).not.toBe( null );

		const wrapper = shallow( notice );
		expect( wrapper.find( '.plan-features__notice-credits' ).length ).toBe( 1 );
	} );
} );

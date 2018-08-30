/** @format */

jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );

jest.mock( 'lib/analytics/index', () => ( {} ) );
jest.mock( 'lib/analytics/page-view-tracker', () => 'PageViewTracker' );
jest.mock( 'lib/user', () => ( {} ) );
jest.mock( 'components/main', () => 'MainComponent' );
jest.mock( 'components/popover', () => 'Popover' );
jest.mock( 'components/info-popover', () => 'InfoPopover' );

jest.mock( 'i18n-calypso', () => ( {
	localize: Comp => props => (
		<Comp
			{ ...props }
			translate={ function( x ) {
				return x;
			} }
		/>
	),
	numberFormat: x => x,
} ) );

/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';
import { identity } from 'lodash';

/**
 * Internal dependencies
 */
import PlanIntervalDiscount from 'my-sites/plan-interval-discount';
import { PlanFeaturesHeader } from '../header';
import {
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_FREE,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
} from 'lib/plans/constants';

const props = {
	translate: x => x,
	planType: PLAN_FREE,
	currentSitePlan: { productSlug: PLAN_FREE },
	isJetpack: null,
};

describe( 'PlanFeaturesHeader basic tests', () => {
	test( 'should not blow up', () => {
		const comp = shallow( <PlanFeaturesHeader { ...props } /> );
		expect( comp.find( '.plan-features__header' ).length ).toBe( 1 );
	} );
} );

describe( 'PlanFeaturesHeader.getDiscountTooltipMessage()', () => {
	[ PLAN_FREE, PLAN_JETPACK_FREE ].forEach( productSlug => {
		test( `Should return a particular message for free plans (${ productSlug })`, () => {
			const comp = new PlanFeaturesHeader( { ...props, currentSitePlan: { productSlug } } );
			expect( comp.getDiscountTooltipMessage() ).toBe( 'Price for the next 12 months' );
		} );
	} );

	[
		PLAN_PERSONAL,
		PLAN_PERSONAL_2_YEARS,
		PLAN_JETPACK_PERSONAL,
		PLAN_JETPACK_PERSONAL_MONTHLY,
		PLAN_PREMIUM,
		PLAN_PREMIUM_2_YEARS,
		PLAN_JETPACK_PREMIUM,
		PLAN_JETPACK_PREMIUM_MONTHLY,
		PLAN_JETPACK_BUSINESS,
		PLAN_JETPACK_BUSINESS_MONTHLY,
		PLAN_BUSINESS,
		PLAN_BUSINESS_2_YEARS,
	].forEach( productSlug => {
		test( `Should render different message for paid plans (${ productSlug })`, () => {
			const comp = new PlanFeaturesHeader( { ...props, currentSitePlan: { productSlug } } );
			expect( comp.getDiscountTooltipMessage() ).toBe(
				"You'll receive a discount from the full price of %(price)s because you already have a plan."
			);
		} );
	} );
} );

describe( 'PlanFeaturesHeader.getBillingTimeframe()', () => {
	const myProps = {
		...props,
		discountPrice: 12,
		isPlaceholder: false,
		currentSitePlan: { productSlug: PLAN_PREMIUM },
	};

	[ PLAN_FREE, PLAN_JETPACK_FREE ].forEach( productSlug => {
		test( `Should render InfoPopover for free plans (${ productSlug })`, () => {
			const comp = new PlanFeaturesHeader( {
				...myProps,
				isJetpack: true,
				planType: productSlug,
			} );
			const tf = shallow( comp.getBillingTimeframe() );
			expect( tf.find( 'InfoPopover' ).length ).toBe( 1 );
		} );
	} );

	[ PLAN_JETPACK_PREMIUM_MONTHLY, PLAN_JETPACK_BUSINESS ].forEach( productSlug => {
		test( `Should render InfoPopover for non-jetpack sites (${ productSlug })`, () => {
			const comp = new PlanFeaturesHeader( {
				...myProps,
				isSiteJetpack: false,
				planType: productSlug,
			} );
			const tf = shallow( comp.getBillingTimeframe() );
			expect( tf.find( 'InfoPopover' ).length ).toBe( 1 );
		} );

		test( `Should render InfoPopover for AT sites (${ productSlug })`, () => {
			const comp = new PlanFeaturesHeader( {
				...myProps,
				isSiteJetpack: true,
				isSiteAT: true,
				planType: productSlug,
			} );
			const tf = shallow( comp.getBillingTimeframe() );
			expect( tf.find( 'InfoPopover' ).length ).toBe( 1 );
		} );

		test( `Should render InfoPopover when hideMonthly is true (${ productSlug })`, () => {
			const comp = new PlanFeaturesHeader( {
				...myProps,
				isSiteJetpack: true,
				hideMonthly: true,
				planType: productSlug,
			} );
			const tf = shallow( comp.getBillingTimeframe() );
			expect( tf.find( 'InfoPopover' ).length ).toBe( 1 );
		} );
	} );

	[
		PLAN_PERSONAL,
		PLAN_PERSONAL_2_YEARS,
		PLAN_JETPACK_PERSONAL,
		PLAN_JETPACK_PERSONAL_MONTHLY,
		PLAN_PREMIUM,
		PLAN_PREMIUM_2_YEARS,
		PLAN_JETPACK_PREMIUM,
		PLAN_JETPACK_PREMIUM_MONTHLY,
		PLAN_JETPACK_BUSINESS,
		PLAN_JETPACK_BUSINESS_MONTHLY,
		PLAN_BUSINESS,
		PLAN_BUSINESS_2_YEARS,
	].forEach( productSlug => {
		test( `Should not render InfoPopover for paid plans (${ productSlug })`, () => {
			const comp = new PlanFeaturesHeader( {
				...myProps,
				isJetpack: true,
				planType: productSlug,
			} );
			const tf = shallow( comp.getBillingTimeframe() );
			expect( tf.find( 'InfoPopover' ).length ).toBe( 0 );
		} );
	} );
} );

describe( 'PlanIntervalDiscount', () => {
	const baseProps = {
		isYearly: true,
		rawPrice: 22,
		relatedMonthlyPlan: { raw_price: 2 },
		translate: identity,
	};
	test( 'should show interval discount for Jetpack during signup', () => {
		const wrapper = shallow( <PlanFeaturesHeader { ...baseProps } isInSignup isJetpack /> );
		expect( wrapper.find( PlanIntervalDiscount ) ).toHaveLength( 1 );
	} );

	test( 'should not show interval discount for Jetpack outside signup', () => {
		const wrapper = shallow( <PlanFeaturesHeader { ...baseProps } isJetpack /> );
		expect( wrapper.find( PlanIntervalDiscount ) ).toHaveLength( 0 );
	} );

	test( 'should not show interval discount for simple during signup', () => {
		const wrapper = shallow( <PlanFeaturesHeader { ...baseProps } isInSignup /> );
		expect( wrapper.find( PlanIntervalDiscount ) ).toHaveLength( 0 );
	} );

	test( 'should not show interval discount for atomic during signup', () => {
		const wrapper = shallow(
			<PlanFeaturesHeader { ...baseProps } isInSignup isJetpack isSiteAT />
		);
		expect( wrapper.find( PlanIntervalDiscount ) ).toHaveLength( 0 );
	} );
} );

describe( 'PlanFeaturesHeader.renderPriceGroup()', () => {
	const baseProps = {
		currencyCode: 'USD',
		isInSignup: false,
		translate: identity,
		currentSitePlan: PLAN_FREE,
	};
	test( 'Should return a single, not discounted price when a single price is passed', () => {
		const comp = new PlanFeaturesHeader( baseProps );
		const wrapper = shallow( <span>{ comp.renderPriceGroup( 15 ) }</span> );
		expect( wrapper.find( 'PlanPrice' ).length ).toBe( 1 );

		const myProps = wrapper.find( 'PlanPrice' ).props();
		expect( myProps.rawPrice ).toBe( 15 );
		expect( myProps.discounted ).toBe( false );
		expect( myProps.original ).toBe( false );
		expect( myProps.currencyCode ).toBe( 'USD' );
		expect( myProps.isInSignup ).toBe( false );
	} );
	test( 'Should return two prices when two numbers are passed: one original and one discounted', () => {
		const comp = new PlanFeaturesHeader( baseProps );
		const wrapper = shallow( <span>{ comp.renderPriceGroup( 15, 13 ) }</span> );
		expect( wrapper.find( 'PlanPrice' ).length ).toBe( 2 );

		const props1 = wrapper.find( 'PlanPrice' ).get( 0 ).props;
		expect( props1.rawPrice ).toBe( 15 );
		expect( props1.discounted ).toBe( false );
		expect( props1.original ).toBe( true );
		expect( props1.currencyCode ).toBe( 'USD' );
		expect( props1.isInSignup ).toBe( false );

		const props2 = wrapper.find( 'PlanPrice' ).get( 1 ).props;
		expect( props2.rawPrice ).toBe( 13 );
		expect( props2.discounted ).toBe( true );
		expect( props2.original ).toBe( false );
		expect( props2.currencyCode ).toBe( 'USD' );
		expect( props2.isInSignup ).toBe( false );
	} );
} );

describe( 'PlanFeaturesHeader.getPlanFeaturesPrices()', () => {
	describe( 'Placeholder', () => {
		const baseProps = {
			currencyCode: 'USD',
			isInSignup: false,
			translate: identity,
			currentSitePlan: PLAN_FREE,
		};
		test( 'Should return a placeholder when isPlaceholder=true and isInSignup=false', () => {
			const comp = new PlanFeaturesHeader( {
				...baseProps,
				isPlaceholder: true,
				isInSignup: false,
			} );
			const wrapper = shallow( <span>{ comp.getPlanFeaturesPrices() }</span> );
			expect( wrapper.find( '.is-placeholder' ).length ).toBe( 1 );
			expect( wrapper.find( 'PlanPrice' ).length ).toBe( 0 );
		} );
		test( 'Placeholder should have a class .plan-features__price for non-jetpack sites', () => {
			const comp = new PlanFeaturesHeader( {
				...baseProps,
				isPlaceholder: true,
				isInSignup: false,
				isJetpack: false,
			} );
			const wrapper = shallow( <span>{ comp.getPlanFeaturesPrices() }</span> );
			expect( wrapper.find( '.is-placeholder.plan-features__price' ).length ).toBe( 1 );
			expect( wrapper.find( '.is-placeholder.plan-features__price-jetpack' ).length ).toBe( 0 );
		} );
		test( 'Placeholder should have a class .plan-features__price-jetpack for non-jetpack sites', () => {
			const comp = new PlanFeaturesHeader( {
				...baseProps,
				isPlaceholder: true,
				isInSignup: false,
				isJetpack: true,
			} );
			const wrapper = shallow( <span>{ comp.getPlanFeaturesPrices() }</span> );
			expect( wrapper.find( '.is-placeholder.plan-features__price' ).length ).toBe( 0 );
			expect( wrapper.find( '.is-placeholder.plan-features__price-jetpack' ).length ).toBe( 1 );
		} );
	} );

	describe( 'has relatedMonthlyPlan', () => {
		const baseProps = {
			availableForPurchase: true,
			currencyCode: 'USD',
			isInSignup: false,
			translate: identity,
			currentSitePlan: PLAN_FREE,
			relatedMonthlyPlan: { raw_price: 5 },
			rawPrice: 50,
		};

		test( 'Should return two price groups', () => {
			const comp = new PlanFeaturesHeader( { ...baseProps } );
			const wrapper = shallow( <span>{ comp.getPlanFeaturesPrices() }</span> );
			expect( wrapper.find( 'PlanPrice' ).length ).toBe( 2 );
		} );

		test( 'Full price should be monthly price * 12 and discounted price should be rawPrice when no discountPrice is passed', () => {
			const comp = new PlanFeaturesHeader( { ...baseProps } );
			const wrapper = shallow( <span>{ comp.getPlanFeaturesPrices() }</span> );
			expect( wrapper.find( 'PlanPrice' ).length ).toBe( 2 );
			expect( wrapper.find( 'PlanPrice' ).get( 0 ).props.rawPrice ).toBe( 60 );
			expect( wrapper.find( 'PlanPrice' ).get( 1 ).props.rawPrice ).toBe( 50 );
		} );

		test( "Full price should be monthly price * 12 and discounted price should be discountPrice when it's passed", () => {
			const comp = new PlanFeaturesHeader( { ...baseProps, discountPrice: 30 } );
			const wrapper = shallow( <span>{ comp.getPlanFeaturesPrices() }</span> );
			expect( wrapper.find( 'PlanPrice' ).length ).toBe( 2 );
			expect( wrapper.find( 'PlanPrice' ).get( 0 ).props.rawPrice ).toBe( 60 );
			expect( wrapper.find( 'PlanPrice' ).get( 1 ).props.rawPrice ).toBe( 30 );
		} );

		test( 'Should return a single price (rawPrice) when availableForPurchase is false', () => {
			const comp = new PlanFeaturesHeader( {
				...baseProps,
				discountPrice: 30,
				availableForPurchase: false,
			} );
			const wrapper = shallow( <span>{ comp.getPlanFeaturesPrices() }</span> );
			expect( wrapper.find( 'PlanPrice' ).length ).toBe( 1 );
			expect( wrapper.find( 'PlanPrice' ).get( 0 ).props.rawPrice ).toBe( 50 );
		} );
	} );

	describe( 'has discountPrice', () => {
		const baseProps = {
			availableForPurchase: true,
			currencyCode: 'USD',
			isInSignup: false,
			translate: identity,
			currentSitePlan: PLAN_FREE,
			discountPrice: 40,
			rawPrice: 50,
		};

		test( 'Should return two price groups', () => {
			const comp = new PlanFeaturesHeader( { ...baseProps } );
			const wrapper = shallow( <span>{ comp.getPlanFeaturesPrices() }</span> );
			expect( wrapper.find( 'PlanPrice' ).length ).toBe( 2 );
		} );

		test( 'Full price should be rawPrice and discounted price should be discountPrice', () => {
			const comp = new PlanFeaturesHeader( { ...baseProps } );
			const wrapper = shallow( <span>{ comp.getPlanFeaturesPrices() }</span> );
			expect( wrapper.find( 'PlanPrice' ).length ).toBe( 2 );
			expect( wrapper.find( 'PlanPrice' ).get( 0 ).props.rawPrice ).toBe( 50 );
			expect( wrapper.find( 'PlanPrice' ).get( 1 ).props.rawPrice ).toBe( 40 );
		} );

		test( 'Should return a single price (rawPrice) when availableForPurchase is false', () => {
			const comp = new PlanFeaturesHeader( {
				...baseProps,
				discountPrice: 30,
				availableForPurchase: false,
			} );
			const wrapper = shallow( <span>{ comp.getPlanFeaturesPrices() }</span> );
			expect( wrapper.find( 'PlanPrice' ).length ).toBe( 1 );
			expect( wrapper.find( 'PlanPrice' ).get( 0 ).props.rawPrice ).toBe( 50 );
		} );
	} );

	describe( 'has only rawPrice', () => {
		const baseProps = {
			availableForPurchase: true,
			currencyCode: 'USD',
			isInSignup: false,
			translate: identity,
			currentSitePlan: PLAN_FREE,
			rawPrice: 50,
		};

		test( 'Should return a single price group', () => {
			const comp = new PlanFeaturesHeader( { ...baseProps } );
			const wrapper = shallow( <span>{ comp.getPlanFeaturesPrices() }</span> );
			expect( wrapper.find( 'PlanPrice' ).length ).toBe( 1 );
		} );

		test( 'Full price should be rawPrice', () => {
			const comp = new PlanFeaturesHeader( { ...baseProps } );
			const wrapper = shallow( <span>{ comp.getPlanFeaturesPrices() }</span> );
			expect( wrapper.find( 'PlanPrice' ).length ).toBe( 1 );
			expect( wrapper.find( 'PlanPrice' ).get( 0 ).props.rawPrice ).toBe( 50 );
		} );

		test( 'Should behave in the same way when availableForPurchase is false', () => {
			const comp = new PlanFeaturesHeader( { ...baseProps, availableForPurchase: false } );
			const wrapper = shallow( <span>{ comp.getPlanFeaturesPrices() }</span> );
			expect( wrapper.find( 'PlanPrice' ).length ).toBe( 1 );
			expect( wrapper.find( 'PlanPrice' ).get( 0 ).props.rawPrice ).toBe( 50 );
		} );
	} );
} );

describe( 'PlanFeaturesHeader.render()', () => {
	describe( 'For free users', () => {
		const baseProps = {
			availableForPurchase: true,
			currencyCode: 'USD',
			isInSignup: false,
			translate: identity,
			currentSitePlan: PLAN_FREE,
			rawPrice: 9,
		};

		test( "Rendering monthly plan should yield no discount if there's no discountPrice", () => {
			const comp = new PlanFeaturesHeader( {
				...baseProps,
				planType: PLAN_JETPACK_PREMIUM_MONTHLY,
			} );
			const wrapper = shallow( <span>{ comp.getPlanFeaturesPrices() }</span> );
			expect( wrapper.find( 'PlanPrice' ).length ).toBe( 1 );
			expect( wrapper.find( 'PlanPrice' ).get( 0 ).props.rawPrice ).toBe( 9 );
		} );

		test( "Rendering annual plan should show monthly price * 12 discounted to regular price if there's no discountPrice", () => {
			const comp = new PlanFeaturesHeader( {
				...baseProps,
				relatedMonthlyPlan: { raw_price: 9 },
				planType: PLAN_JETPACK_PREMIUM,
			} );
			const wrapper = shallow( <span>{ comp.getPlanFeaturesPrices() }</span> );
			expect( wrapper.find( 'PlanPrice' ).length ).toBe( 2 );
			expect( wrapper.find( 'PlanPrice' ).get( 0 ).props.rawPrice ).toBe( 108 );
			expect( wrapper.find( 'PlanPrice' ).get( 0 ).props.original ).toBe( true );
			expect( wrapper.find( 'PlanPrice' ).get( 1 ).props.rawPrice ).toBe( 9 );
			expect( wrapper.find( 'PlanPrice' ).get( 1 ).props.discounted ).toBe( true );
		} );

		test( 'Rendering annual plan should show monthly price * 12 discounted to discountPrice if one is passed', () => {
			const comp = new PlanFeaturesHeader( {
				...baseProps,
				discountPrice: 60,
				relatedMonthlyPlan: { raw_price: 9 },
				planType: PLAN_JETPACK_PREMIUM,
			} );
			const wrapper = shallow( <span>{ comp.getPlanFeaturesPrices() }</span> );
			expect( wrapper.find( 'PlanPrice' ).length ).toBe( 2 );
			expect( wrapper.find( 'PlanPrice' ).get( 0 ).props.rawPrice ).toBe( 108 );
			expect( wrapper.find( 'PlanPrice' ).get( 0 ).props.original ).toBe( true );
			expect( wrapper.find( 'PlanPrice' ).get( 1 ).props.rawPrice ).toBe( 60 );
			expect( wrapper.find( 'PlanPrice' ).get( 1 ).props.discounted ).toBe( true );
		} );

		test( "Rendering annual plan should show rawPrice with no discounts if there's no discountPrice and relatedMonthlyPlan", () => {
			const comp = new PlanFeaturesHeader( { ...baseProps, rawPrice: 60, planType: PLAN_PREMIUM } );
			const wrapper = shallow( <span>{ comp.getPlanFeaturesPrices() }</span> );
			expect( wrapper.find( 'PlanPrice' ).length ).toBe( 1 );
			expect( wrapper.find( 'PlanPrice' ).get( 0 ).props.rawPrice ).toBe( 60 );
		} );
	} );
} );

/**
 * @jest-environment jsdom
 */

jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );

jest.mock( 'lib/analytics/tracks', () => ( {} ) );
jest.mock( 'lib/analytics/page-view', () => ( {} ) );
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
import PlanPill from 'components/plans/plan-pill';
import {
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_2_YEARS,
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
import PlanPrice from 'my-sites/plan-price/';

const props = {
	translate: ( x ) => x,
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
	[ PLAN_FREE, PLAN_JETPACK_FREE ].forEach( ( productSlug ) => {
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
		PLAN_ECOMMERCE,
		PLAN_ECOMMERCE_2_YEARS,
	].forEach( ( productSlug ) => {
		test( `Should render different message for paid plans (${ productSlug })`, () => {
			const comp = new PlanFeaturesHeader( { ...props, currentSitePlan: { productSlug } } );
			expect( comp.getDiscountTooltipMessage() ).toBe(
				"You'll receive a discount from the full price of %(price)s because you already have a plan."
			);
		} );
	} );
} );

describe( 'PlanFeaturesHeader.renderPlansHeaderNoTabs()', () => {
	[ PLAN_PREMIUM, PLAN_PREMIUM_2_YEARS ].forEach( ( productSlug ) => {
		test( `Should not render "Your Plan" plan pill (${ productSlug })`, () => {
			const myProps = {
				...props,
				isPlaceholder: false,
				currentSitePlan: { productSlug },
				planType: PLAN_PREMIUM,
				popular: false,
				newPlan: false,
				bestValue: false,
			};
			const comp = new PlanFeaturesHeader( { ...myProps } );
			const pfh = shallow( comp.renderPlansHeaderNoTabs() );

			expect( pfh.contains( <PlanPill>Your Plan</PlanPill> ) ).toBe( false );
		} );

		test( `Should render "Popular" plan pill (${ productSlug })`, () => {
			const myProps = {
				...props,
				isPlaceholder: false,
				currentSitePlan: { productSlug },
				planType: PLAN_PREMIUM,
				popular: true,
				newPlan: false,
				bestValue: false,
			};
			const comp = new PlanFeaturesHeader( { ...myProps } );
			const pfh = shallow( comp.renderPlansHeaderNoTabs() );

			expect( pfh.contains( <PlanPill>Popular</PlanPill> ) ).toBe( true );
		} );
	} );
} );

describe( 'PlanFeaturesHeader.renderPlansHeader()', () => {
	[ PLAN_PREMIUM, PLAN_PREMIUM_2_YEARS ].forEach( ( productSlug ) => {
		test( `Should render "Your Plan" plan pill and no other plan pills for a paid plan in /plans page (${ productSlug })`, () => {
			const myProps = {
				...props,
				isPlaceholder: false,
				isInSignup: false,
				currentSitePlan: { productSlug },
				planType: productSlug,
			};
			const comp = new PlanFeaturesHeader( { ...myProps } );
			const pfh = shallow( comp.renderPlansHeader() );

			expect( pfh.contains( <PlanPill>Your Plan</PlanPill> ) ).toBe( true );

			[ 'New', 'Popular', 'Best Value' ].forEach( ( planPillLabel ) => {
				expect( pfh.contains( <PlanPill>${ planPillLabel }</PlanPill> ) ).toBe( false );
			} );
		} );
		test( `Should render "Your Plan" plan pill only, even if plan is Popular (${ productSlug })`, () => {
			const myProps = {
				...props,
				isPlaceholder: false,
				isInSignup: false,
				currentSitePlan: { productSlug },
				planType: PLAN_PREMIUM,
				popular: true,
			};
			const comp = new PlanFeaturesHeader( { ...myProps } );
			const pfh = shallow( comp.renderPlansHeader() );

			expect( pfh.contains( <PlanPill>Your Plan</PlanPill> ) ).toBe( true );

			[ 'New', 'Popular', 'Best Value' ].forEach( ( planPillLabel ) => {
				expect( pfh.contains( <PlanPill>${ planPillLabel }</PlanPill> ) ).toBe( false );
			} );
		} );

		test( `Should not render "Your Plan" plan pill in Signup flow (${ productSlug })`, () => {
			const myProps = {
				...props,
				isPlaceholder: false,
				isInSignup: true,
				currentSitePlan: { productSlug },
				planType: PLAN_PREMIUM,
			};
			const comp = new PlanFeaturesHeader( { ...myProps } );
			const pfh = shallow( comp.renderPlansHeader() );

			expect( pfh.contains( <PlanPill>Your Plan</PlanPill> ) ).toBe( false );
		} );

		test( `Should render "Popular" plan pill in Signup flow (${ productSlug })`, () => {
			const myProps = {
				...props,
				isPlaceholder: false,
				isInSignup: true,
				planType: PLAN_PREMIUM,
				popular: true,
			};
			const comp = new PlanFeaturesHeader( { ...myProps } );
			const pfh = shallow( comp.renderPlansHeader() );

			expect( pfh.contains( <PlanPill>Popular</PlanPill> ) ).toBe( true );

			[ 'New', 'Your Plan', 'Best Value' ].forEach( ( planPillLabel ) => {
				expect( pfh.contains( <PlanPill>${ planPillLabel }</PlanPill> ) ).toBe( false );
			} );
		} );
	} );

	[ PLAN_JETPACK_PREMIUM, PLAN_JETPACK_PREMIUM_MONTHLY ].forEach( ( productSlug ) => {
		test( `Should render "Your Plan" plan pill only even if plan is Best Value in /plans page(${ productSlug })`, () => {
			const myProps = {
				...props,
				isPlaceholder: false,
				isInSignup: false,
				currentSitePlan: { productSlug },
				planType: productSlug,
				popular: false,
				newPlan: false,
				bestValue: true,
			};
			const comp = new PlanFeaturesHeader( { ...myProps } );
			const pfh = shallow( comp.renderPlansHeader() );

			expect( pfh.contains( <PlanPill>Your Plan</PlanPill> ) ).toBe( true );

			[ 'New', 'Popular', 'Best Value' ].forEach( ( planPillLabel ) => {
				expect( pfh.contains( <PlanPill>${ planPillLabel }</PlanPill> ) ).toBe( false );
			} );
		} );

		test( `Should render "Best Value" plan pill if in signup flow(${ productSlug })`, () => {
			const myProps = {
				...props,
				isPlaceholder: false,
				isInSignup: true,
				planType: productSlug,
				popular: false,
				newPlan: false,
				bestValue: true,
			};
			const comp = new PlanFeaturesHeader( { ...myProps } );
			const pfh = shallow( comp.renderPlansHeader() );

			expect( pfh.contains( <PlanPill>Best Value</PlanPill> ) ).toBe( true );

			[ 'New', 'Popular', 'Your Plan' ].forEach( ( planPillLabel ) => {
				expect( pfh.contains( <PlanPill>${ planPillLabel }</PlanPill> ) ).toBe( false );
			} );
		} );
	} );

	[ PLAN_PERSONAL, PLAN_PREMIUM, PLAN_JETPACK_PERSONAL, PLAN_JETPACK_PREMIUM ].forEach(
		( productSlug ) => {
			test( `Should not render "Your Plan" plan pill if currently on the free plan`, () => {
				const myProps = { ...props, isInSignup: false, planType: productSlug };
				const comp = new PlanFeaturesHeader( { ...myProps } );
				const pfh = shallow( comp.renderPlansHeader() );

				expect( pfh.contains( <PlanPill>Your Plan</PlanPill> ) ).toBe( false );
			} );
		}
	);
} );

describe( 'PlanFeaturesHeader.getBillingTimeframe()', () => {
	const myProps = {
		...props,
		discountPrice: 12,
		isPlaceholder: false,
		currentSitePlan: { productSlug: PLAN_PREMIUM },
	};

	[ PLAN_FREE, PLAN_JETPACK_FREE ].forEach( ( productSlug ) => {
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

	[ PLAN_JETPACK_PREMIUM_MONTHLY, PLAN_JETPACK_BUSINESS ].forEach( ( productSlug ) => {
		test( `Should render InfoPopover for non-jetpack sites (${ productSlug })`, () => {
			const comp = new PlanFeaturesHeader( {
				...myProps,
				isJetpack: false,
				planType: productSlug,
			} );
			const tf = shallow( comp.getBillingTimeframe() );
			expect( tf.find( 'InfoPopover' ).length ).toBe( 1 );
		} );

		test( `Should render InfoPopover for AT sites (${ productSlug })`, () => {
			const comp = new PlanFeaturesHeader( {
				...myProps,
				isJetpack: true,
				isSiteAT: true,
				planType: productSlug,
			} );
			const tf = shallow( comp.getBillingTimeframe() );
			expect( tf.find( 'InfoPopover' ).length ).toBe( 1 );
		} );

		test( `Should render InfoPopover when hideMonthly is true (${ productSlug })`, () => {
			const comp = new PlanFeaturesHeader( {
				...myProps,
				isJetpack: true,
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
	].forEach( ( productSlug ) => {
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
		expect( wrapper.find( PlanPrice ).length ).toBe( 1 );

		// We need the dive() here to pick up defaultProps
		const myProps = wrapper.find( PlanPrice ).first().dive().props();
		expect( myProps.rawPrice ).toBe( 15 );
		expect( myProps.discounted ).toBe( false );
		expect( myProps.original ).toBe( false );
		expect( myProps.currencyCode ).toBe( 'USD' );
		expect( myProps.isInSignup ).toBe( false );
	} );
	test( 'Should return two prices when two numbers are passed: one original and one discounted', () => {
		const comp = new PlanFeaturesHeader( baseProps );
		const wrapper = shallow( <span>{ comp.renderPriceGroup( 15, 13 ) }</span> );
		expect( wrapper.find( PlanPrice ).length ).toBe( 2 );

		// We need the dive() here to pick up defaultProps
		const props1 = wrapper.find( PlanPrice ).at( 0 ).dive().props();
		expect( props1.rawPrice ).toBe( 15 );
		expect( props1.discounted ).toBe( false );
		expect( props1.original ).toBe( true );
		expect( props1.currencyCode ).toBe( 'USD' );
		expect( props1.isInSignup ).toBe( false );

		// We need the dive() here to pick up defaultProps
		const props2 = wrapper.find( PlanPrice ).at( 1 ).dive().props();
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
			expect( wrapper.find( PlanPrice ).length ).toBe( 0 );
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
			isJetpack: true,
		};

		test( 'Should return two price groups', () => {
			const comp = new PlanFeaturesHeader( { ...baseProps } );
			const wrapper = shallow( <span>{ comp.getPlanFeaturesPrices() }</span> );
			expect( wrapper.find( PlanPrice ).length ).toBe( 2 );
		} );

		test( 'Full price should be monthly price * 12 and discounted price should be rawPrice when no discountPrice is passed', () => {
			const comp = new PlanFeaturesHeader( { ...baseProps } );
			const wrapper = shallow( <span>{ comp.getPlanFeaturesPrices() }</span> );
			expect( wrapper.find( PlanPrice ).length ).toBe( 2 );
			expect( wrapper.find( PlanPrice ).get( 0 ).props.rawPrice ).toBe( 60 );
			expect( wrapper.find( PlanPrice ).get( 1 ).props.rawPrice ).toBe( 50 );
		} );

		test( "Full price should be monthly price * 12 and discounted price should be discountPrice when it's passed", () => {
			const comp = new PlanFeaturesHeader( { ...baseProps, discountPrice: 30 } );
			const wrapper = shallow( <span>{ comp.getPlanFeaturesPrices() }</span> );
			expect( wrapper.find( PlanPrice ).length ).toBe( 2 );
			expect( wrapper.find( PlanPrice ).get( 0 ).props.rawPrice ).toBe( 60 );
			expect( wrapper.find( PlanPrice ).get( 1 ).props.rawPrice ).toBe( 30 );
		} );

		test( 'Should return a single price (rawPrice) when availableForPurchase is false', () => {
			const comp = new PlanFeaturesHeader( {
				...baseProps,
				discountPrice: 30,
				availableForPurchase: false,
			} );
			const wrapper = shallow( <span>{ comp.getPlanFeaturesPrices() }</span> );
			expect( wrapper.find( PlanPrice ).length ).toBe( 1 );
			expect( wrapper.find( PlanPrice ).get( 0 ).props.rawPrice ).toBe( 50 );
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
			expect( wrapper.find( PlanPrice ).length ).toBe( 2 );
		} );

		test( 'Full price should be rawPrice and discounted price should be discountPrice', () => {
			const comp = new PlanFeaturesHeader( { ...baseProps } );
			const wrapper = shallow( <span>{ comp.getPlanFeaturesPrices() }</span> );
			expect( wrapper.find( PlanPrice ).length ).toBe( 2 );
			expect( wrapper.find( PlanPrice ).get( 0 ).props.rawPrice ).toBe( 50 );
			expect( wrapper.find( PlanPrice ).get( 1 ).props.rawPrice ).toBe( 40 );
		} );

		test( 'Should return a single price (rawPrice) when availableForPurchase is false', () => {
			const comp = new PlanFeaturesHeader( {
				...baseProps,
				discountPrice: 30,
				availableForPurchase: false,
			} );
			const wrapper = shallow( <span>{ comp.getPlanFeaturesPrices() }</span> );
			expect( wrapper.find( PlanPrice ).length ).toBe( 1 );
			expect( wrapper.find( PlanPrice ).get( 0 ).props.rawPrice ).toBe( 50 );
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
			expect( wrapper.find( PlanPrice ).length ).toBe( 1 );
		} );

		test( 'Full price should be rawPrice', () => {
			const comp = new PlanFeaturesHeader( { ...baseProps } );
			const wrapper = shallow( <span>{ comp.getPlanFeaturesPrices() }</span> );
			expect( wrapper.find( PlanPrice ).length ).toBe( 1 );
			expect( wrapper.find( PlanPrice ).get( 0 ).props.rawPrice ).toBe( 50 );
		} );

		test( 'Should behave in the same way when availableForPurchase is false', () => {
			const comp = new PlanFeaturesHeader( { ...baseProps, availableForPurchase: false } );
			const wrapper = shallow( <span>{ comp.getPlanFeaturesPrices() }</span> );
			expect( wrapper.find( PlanPrice ).length ).toBe( 1 );
			expect( wrapper.find( PlanPrice ).get( 0 ).props.rawPrice ).toBe( 50 );
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
			isJetpack: true,
		};

		test( "Rendering monthly plan should yield no discount if there's no discountPrice", () => {
			const comp = new PlanFeaturesHeader( {
				...baseProps,
				planType: PLAN_JETPACK_PREMIUM_MONTHLY,
			} );
			const wrapper = shallow( <span>{ comp.getPlanFeaturesPrices() }</span> );
			expect( wrapper.find( PlanPrice ).length ).toBe( 1 );
			expect( wrapper.find( PlanPrice ).get( 0 ).props.rawPrice ).toBe( 9 );
		} );

		test( "Rendering annual plan should show monthly price * 12 discounted to regular price if there's no discountPrice", () => {
			const comp = new PlanFeaturesHeader( {
				...baseProps,
				relatedMonthlyPlan: { raw_price: 9 },
				planType: PLAN_JETPACK_PREMIUM,
			} );
			const wrapper = shallow( <span>{ comp.getPlanFeaturesPrices() }</span> );
			expect( wrapper.find( PlanPrice ).length ).toBe( 2 );
			expect( wrapper.find( PlanPrice ).get( 0 ).props.rawPrice ).toBe( 108 );
			expect( wrapper.find( PlanPrice ).get( 0 ).props.original ).toBe( true );
			expect( wrapper.find( PlanPrice ).get( 1 ).props.rawPrice ).toBe( 9 );
			expect( wrapper.find( PlanPrice ).get( 1 ).props.discounted ).toBe( true );
		} );

		test( 'Rendering annual plan should show monthly price * 12 discounted to discountPrice if one is passed', () => {
			const comp = new PlanFeaturesHeader( {
				...baseProps,
				discountPrice: 60,
				relatedMonthlyPlan: { raw_price: 9 },
				planType: PLAN_JETPACK_PREMIUM,
			} );
			const wrapper = shallow( <span>{ comp.getPlanFeaturesPrices() }</span> );
			expect( wrapper.find( PlanPrice ).length ).toBe( 2 );
			expect( wrapper.find( PlanPrice ).get( 0 ).props.rawPrice ).toBe( 108 );
			expect( wrapper.find( PlanPrice ).get( 0 ).props.original ).toBe( true );
			expect( wrapper.find( PlanPrice ).get( 1 ).props.rawPrice ).toBe( 60 );
			expect( wrapper.find( PlanPrice ).get( 1 ).props.discounted ).toBe( true );
		} );

		test( "Rendering annual plan should show rawPrice with no discounts if there's no discountPrice and relatedMonthlyPlan", () => {
			const comp = new PlanFeaturesHeader( { ...baseProps, rawPrice: 60, planType: PLAN_PREMIUM } );
			const wrapper = shallow( <span>{ comp.getPlanFeaturesPrices() }</span> );
			expect( wrapper.find( PlanPrice ).length ).toBe( 1 );
			expect( wrapper.find( PlanPrice ).get( 0 ).props.rawPrice ).toBe( 60 );
		} );
	} );
} );

describe( 'PlanFeaturesHeader.renderCreditLabel()', () => {
	const baseProps = {
		showPlanCreditsApplied: true,
		availableForPurchase: true,
		planType: PLAN_PREMIUM,
		currentSitePlan: { productSlug: PLAN_PERSONAL },
		rawPrice: 100,
		discountPrice: 80,
		translate: identity,
		isJetpack: false,
		isSiteAT: false,
	};

	test( 'Should display credit label for discounted higher-tier plans that are available for purchase', () => {
		const instance = new PlanFeaturesHeader( { ...baseProps } );
		const wrapper = shallow( <span>{ instance.renderCreditLabel() }</span> );
		expect( wrapper.find( '.plan-features__header-credit-label' ).length ).toBe( 1 );
	} );

	test( 'Should not display credit label when plan is not available for purchase', () => {
		const instance = new PlanFeaturesHeader( { ...baseProps, availableForPurchase: false } );
		expect( instance.renderCreditLabel() ).toBe( null );
	} );

	test( 'Should not display credit label when showPlanCreditsApplied is false', () => {
		const instance = new PlanFeaturesHeader( { ...baseProps, showPlanCreditsApplied: false } );
		expect( instance.renderCreditLabel() ).toBe( null );
	} );

	test( 'Should not display credit label when rendered plan is the same as current plan', () => {
		const instance = new PlanFeaturesHeader( { ...baseProps, planType: PLAN_PERSONAL } );
		expect( instance.renderCreditLabel() ).toBe( null );
	} );

	test( 'Should not display credit label when there is no discount price', () => {
		const instance = new PlanFeaturesHeader( { ...baseProps, discountPrice: 0 } );
		expect( instance.renderCreditLabel() ).toBe( null );
	} );

	test( 'Should not display credit label when discount price is equal to rawPrice', () => {
		const instance = new PlanFeaturesHeader( { ...baseProps, discountPrice: 100 } );
		expect( instance.renderCreditLabel() ).toBe( null );
	} );

	test( 'Should not display credit label when discount price is higher than rawPrice', () => {
		const instance = new PlanFeaturesHeader( { ...baseProps, discountPrice: 101 } );
		expect( instance.renderCreditLabel() ).toBe( null );
	} );

	test( 'Should display credit label for atomic site on Business plan ', () => {
		const instance = new PlanFeaturesHeader( {
			...baseProps,
			planType: PLAN_BUSINESS,
			isJetpack: true,
			isSiteAT: true,
		} );
		const wrapper = shallow( <span>{ instance.renderCreditLabel() }</span> );
		expect( wrapper.find( '.plan-features__header-credit-label' ).length ).toBe( 1 );
	} );

	test( 'Should not display credit label for Jetpack site ', () => {
		const instance = new PlanFeaturesHeader( {
			...baseProps,
			planType: PLAN_JETPACK_PREMIUM,
			isJetpack: true,
			isSiteAT: false,
		} );
		expect( instance.renderCreditLabel() ).toBe( null );
	} );
} );

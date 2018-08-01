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
